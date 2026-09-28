import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../state'
import { bestBuyer, bulkSaleCost, bulkSaleUnits, bulkSaleValue, bulkSell, canBulkSell, hasLot } from './bulkSales'
import { isUnlocked } from './buildings'

function stateWith(setup: (state: GameState) => void): GameState {
  const state = createInitialState()
  setup(state)
  return state
}

describe('bulkSell', () => {
  it('sells whole lots and keeps the rest', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(37)))
    expect(bulkSell(state, 'megaMeat', 'soybeans')).toBe(true)
    expect(state.stock.soybeans.toNumber()).toBe(2)
    expect(state.money.toNumber()).toBe(14)
    expect(state.totalEarned.toNumber()).toBe(14)
    expect(state.unitsSold.megaMeat.toNumber()).toBe(35)
  })

  it('is unavailable below one lot and then changes nothing', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(4)))
    expect(canBulkSell(state, 'megaMeat', 'soybeans')).toBe(false)
    expect(bulkSell(state, 'megaMeat', 'soybeans')).toBe(false)
    expect(state.stock.soybeans.toNumber()).toBe(4)
    expect(state.money.toNumber()).toBe(0)
    expect(state.unitsSold.megaMeat.toNumber()).toBe(0)
  })

  it('uses the biogas plant’s own, larger lots', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(37)))
    bulkSell(state, 'biogas', 'soybeans')
    expect(state.stock.soybeans.toNumber()).toBe(7)
    expect(state.money.toNumber()).toBe(9)
    expect(state.unitsSold.biogas.toNumber()).toBe(30)
  })

  it('counts towards unlocks', () => {
    const state = stateWith((s) => {
      s.totalEarned = new Decimal(29_995)
      s.stock.soybeans = new Decimal(15)
    })
    expect(isUnlocked(state, 'oatField')).toBe(false)
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.totalEarned.toNumber()).toBe(30_001)
    expect(isUnlocked(state, 'oatField')).toBe(true)
  })

  it('previews units and earnings without changing anything', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(37)))
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans').toNumber()).toBe(35)
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(14)
    expect(state.stock.soybeans.toNumber()).toBe(37)
    expect(state.money.toNumber()).toBe(0)
  })

  it('lets only the biogas plant buy finished products', () => {
    const state = stateWith((s) => (s.stock.tofuWurst = new Decimal(40)))
    expect(hasLot('megaMeat', 'tofuWurst')).toBe(false)
    expect(canBulkSell(state, 'megaMeat', 'tofuWurst')).toBe(false)
    expect(bulkSell(state, 'megaMeat', 'tofuWurst')).toBe(false)
    expect(state.stock.tofuWurst.toNumber()).toBe(40)

    expect(hasLot('biogas', 'tofuWurst')).toBe(true)
    expect(bulkSell(state, 'biogas', 'tofuWurst')).toBe(true)
    expect(state.stock.tofuWurst.toNumber()).toBe(0)
    expect(state.money.toNumber()).toBe(60)
    expect(state.unitsSold.biogas.toNumber()).toBe(40)
  })

  it('counts units sold per buyer', () => {
    const state = stateWith((s) => {
      s.stock.soybeans = new Decimal(30)
      s.stock.wheat = new Decimal(8)
      s.stock.tofu = new Decimal(20)
    })
    bulkSell(state, 'megaMeat', 'soybeans')
    bulkSell(state, 'megaMeat', 'wheat')
    bulkSell(state, 'biogas', 'tofu')
    expect(state.unitsSold.megaMeat.toNumber()).toBe(38)
    expect(state.unitsSold.biogas.toNumber()).toBe(20)
  })
})

describe('bestBuyer', () => {
  it('is MegaMeat for what both buy and the biogas plant for products', () => {
    expect(bestBuyer('soybeans')).toEqual({ buyer: 'megaMeat', perUnit: 0.4 })
    expect(bestBuyer('tofuWurst')).toEqual({ buyer: 'biogas', perUnit: 1.5 })
  })

  it('can leave out buyers that cost customers', () => {
    expect(bestBuyer('soybeans', { withoutFeedCost: true })).toEqual({ buyer: 'biogas', perUnit: 0.3 })
  })
})

describe('price of feeding MegaMeat', () => {
  function feeding(customers: number, awareness: number, setup: (state: GameState) => void): GameState {
    return stateWith((s) => {
      s.customers = new Decimal(customers)
      s.awareness = new Decimal(awareness)
      setup(s)
    })
  }

  it('costs a customer per €100 and an awareness point per €10', () => {
    // 125 tofu at €2 each: €250.
    const state = feeding(50, 100, (s) => (s.stock.tofu = new Decimal(125)))
    bulkSell(state, 'megaMeat', 'tofu')
    expect(state.money.toNumber()).toBe(250)
    expect(state.customers.toNumber()).toBe(47)
    expect(state.awareness.toNumber()).toBe(75)
  })

  it('rounds up, so a small sale still costs', () => {
    const state = feeding(50, 100, (s) => (s.stock.soybeans = new Decimal(37)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(14)
    expect(state.customers.toNumber()).toBe(49)
    expect(state.awareness.toNumber()).toBe(98)
  })

  it('never drops below the starting neighbours or below no awareness', () => {
    const state = feeding(12, 5, (s) => (s.stock.tofu = new Decimal(500)))
    bulkSell(state, 'megaMeat', 'tofu')
    expect(state.customers.toNumber()).toBe(10)
    expect(state.awareness.toNumber()).toBe(0)
  })

  it('costs nothing at the biogas plant', () => {
    const state = feeding(50, 100, (s) => (s.stock.tofuWurst = new Decimal(40)))
    bulkSell(state, 'biogas', 'tofuWurst')
    expect(state.money.toNumber()).toBe(60)
    expect(state.customers.toNumber()).toBe(50)
    expect(state.awareness.toNumber()).toBe(100)
  })

  it('previews the cost of a sale without changing anything', () => {
    const state = feeding(50, 100, (s) => {
      s.stock.tofu = new Decimal(125)
      s.stock.tofuWurst = new Decimal(40)
    })
    expect(bulkSaleCost(state, 'megaMeat', 'tofu')).toEqual({ customers: 3, awareness: 25 })
    expect(bulkSaleCost(state, 'biogas', 'tofuWurst')).toEqual({ customers: 0, awareness: 0 })
    expect(state.customers.toNumber()).toBe(50)
  })
})
