import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState } from '../state'
import { canSellAll, sellAll } from './sales'

describe('sellAll', () => {
  it('sells every product at its base price', () => {
    const state = createInitialState()
    state.money = new Decimal(10)
    state.totalEarned = new Decimal(10)
    state.stock.tofuWurst = new Decimal(4)
    state.stock.leverkas = new Decimal(2)
    state.stock.tofu = new Decimal(5)

    sellAll(state)

    expect(state.money.toNumber()).toBe(72)
    expect(state.totalEarned.toNumber()).toBe(72)
    expect(state.stock.tofuWurst.toNumber()).toBe(0)
    expect(state.stock.leverkas.toNumber()).toBe(0)
    expect(state.stock.tofu.toNumber()).toBe(5)
  })

  it('is unavailable with no product in stock', () => {
    const state = createInitialState()
    state.stock.tofu = new Decimal(3)
    expect(canSellAll(state)).toBe(false)
    state.stock.haferCappuccino = new Decimal(1)
    expect(canSellAll(state)).toBe(true)
  })
})
