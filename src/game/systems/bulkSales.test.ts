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
    expect(state.money.toNumber()).toBe(20)
    expect(state.totalEarned.toNumber()).toBe(20)
    expect(state.unitsSold.megaMeat.toNumber()).toBe(35)
  })

  it('is unavailable below one lot and then changes nothing', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(6)))
    expect(canBulkSell(state, 'megaMeat', 'soybeans')).toBe(false)
    expect(bulkSell(state, 'megaMeat', 'soybeans')).toBe(false)
    expect(state.stock.soybeans.toNumber()).toBe(6)
    expect(state.money.toNumber()).toBe(0)
    expect(state.unitsSold.megaMeat.toNumber()).toBe(0)
  })

  it('uses the biogas plant’s own lots', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(37)))
    bulkSell(state, 'biogas', 'soybeans')
    expect(state.stock.soybeans.toNumber()).toBe(2)
    expect(state.money.toNumber()).toBe(15)
    expect(state.unitsSold.biogas.toNumber()).toBe(35)
  })

  it('counts towards unlocks', () => {
    const state = stateWith((s) => {
      s.totalEarned = new Decimal(29_995)
      s.stock.soybeans = new Decimal(14)
    })
    expect(isUnlocked(state, 'oatField')).toBe(false)
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.totalEarned.toNumber()).toBe(30_003)
    expect(isUnlocked(state, 'oatField')).toBe(true)
  })

  it('previews units and earnings without changing anything', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(37)))
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans').toNumber()).toBe(35)
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(20)
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
    expect(state.money.toNumber()).toBe(80)
    expect(state.unitsSold.biogas.toNumber()).toBe(40)
  })

  it('counts units sold per buyer', () => {
    const state = stateWith((s) => {
      s.stock.soybeans = new Decimal(30)
      s.stock.wheat = new Decimal(18)
      s.stock.tofu = new Decimal(20)
    })
    bulkSell(state, 'megaMeat', 'soybeans')
    bulkSell(state, 'megaMeat', 'wheat')
    bulkSell(state, 'biogas', 'tofu')
    expect(state.unitsSold.megaMeat.toNumber()).toBe(43)
    expect(state.unitsSold.biogas.toNumber()).toBe(20)
  })
})

describe('bestBuyer', () => {
  it('is MegaMeat for what both buy and the biogas plant for products', () => {
    expect(bestBuyer('soybeans')).toEqual({ buyer: 'megaMeat', perUnit: 4 / 7 })
    expect(bestBuyer('tofuWurst')).toEqual({ buyer: 'biogas', perUnit: 2 })
  })

  it('can leave out buyers that cost customers', () => {
    expect(bestBuyer('soybeans', { withoutFeedCost: true })).toEqual({ buyer: 'biogas', perUnit: 3 / 7 })
  })
})

describe('price of feeding MegaMeat', () => {
  function feeding(customers: number, income: number, awareness: number, setup: (state: GameState) => void): GameState {
    return stateWith((s) => {
      s.customers = new Decimal(customers)
      s.customerIncome = new Decimal(income)
      s.awareness = new Decimal(awareness)
      setup(s)
    })
  }

  it('costs the share of customers that the sale is of 10 minutes of their spending', () => {
    // 1,050 soybeans in lots of 7 for €4: €600, one minute of €10/s.
    const state = feeding(1_000, 10, 100, (s) => (s.stock.soybeans = new Decimal(1_050)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(600)
    expect(state.customers.toNumber()).toBe(900)
    expect(state.awareness.toNumber()).toBe(40)
  })

  it('rounds up, so a small sale still costs', () => {
    const state = feeding(1_000, 10, 100, (s) => (s.stock.soybeans = new Decimal(7)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(4)
    expect(state.customers.toNumber()).toBe(999)
    expect(state.awareness.toNumber()).toBe(99)
  })

  it('never drops below the starting neighbours or below no awareness', () => {
    const state = feeding(12, 10, 5, (s) => (s.stock.seitan = new Decimal(120)))
    bulkSell(state, 'megaMeat', 'seitan')
    expect(state.customers.toNumber()).toBe(10)
    expect(state.awareness.toNumber()).toBe(0)
  })

  it('costs every customer above the neighbours while customers spend nothing', () => {
    const state = feeding(30, 0, 100, (s) => (s.stock.soybeans = new Decimal(8)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.customers.toNumber()).toBe(10)
  })

  it('costs nothing at the biogas plant', () => {
    const state = feeding(50, 10, 100, (s) => (s.stock.tofuWurst = new Decimal(30)))
    bulkSell(state, 'biogas', 'tofuWurst')
    expect(state.money.toNumber()).toBe(60)
    expect(state.customers.toNumber()).toBe(50)
    expect(state.awareness.toNumber()).toBe(100)
  })

  it('previews the cost of a sale without changing anything', () => {
    const state = feeding(1_000, 10, 100, (s) => {
      s.stock.soybeans = new Decimal(1_050)
      s.stock.tofuWurst = new Decimal(30)
    })
    expect(bulkSaleCost(state, 'megaMeat', 'soybeans')).toEqual({ customers: 100, awareness: 60 })
    expect(bulkSaleCost(state, 'biogas', 'tofuWurst')).toEqual({ customers: 0, awareness: 0 })
    expect(state.customers.toNumber()).toBe(1_000)
  })
})
