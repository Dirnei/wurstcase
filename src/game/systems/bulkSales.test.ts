import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../state'
import { bulkSaleUnits, bulkSaleValue, bulkSell, canBulkSell, hasLot } from './bulkSales'
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
    expect(state.stock.soybeans.toNumber()).toBe(7)
    expect(state.money.toNumber()).toBe(3)
    expect(state.totalEarned.toNumber()).toBe(3)
    expect(state.unitsSold.megaMeat.toNumber()).toBe(30)
  })

  it('is unavailable below one lot and then changes nothing', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(9)))
    expect(canBulkSell(state, 'megaMeat', 'soybeans')).toBe(false)
    expect(bulkSell(state, 'megaMeat', 'soybeans')).toBe(false)
    expect(state.stock.soybeans.toNumber()).toBe(9)
    expect(state.money.toNumber()).toBe(0)
    expect(state.unitsSold.megaMeat.toNumber()).toBe(0)
  })

  it('uses the biogas plant’s own, larger lots', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(37)))
    bulkSell(state, 'biogas', 'soybeans')
    expect(state.stock.soybeans.toNumber()).toBe(17)
    expect(state.money.toNumber()).toBe(1)
    expect(state.unitsSold.biogas.toNumber()).toBe(20)
  })

  it('counts towards unlocks', () => {
    const state = stateWith((s) => {
      s.totalEarned = new Decimal(195)
      s.stock.soybeans = new Decimal(50)
    })
    expect(isUnlocked(state, 'wheatField')).toBe(false)
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.totalEarned.toNumber()).toBe(200)
    expect(isUnlocked(state, 'wheatField')).toBe(true)
  })

  it('previews units and earnings without changing anything', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(37)))
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans').toNumber()).toBe(30)
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(3)
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
    expect(state.money.toNumber()).toBe(6)
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
