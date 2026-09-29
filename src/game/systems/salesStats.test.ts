import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../content/resources'
import { createInitialState } from '../state'
import { bulkSell } from './bulkSales'
import { sell } from './sales'
import { advanceSalesStats, demandPerMinute, incomePerMinute, recordSale, soldPerMinute } from './salesStats'

/** Moves the sales window on in live-loop steps of 0.1 s. */
function wait(state: ReturnType<typeof createInitialState>, seconds: number): void {
  for (let i = 0; i < Math.round(seconds * 10); i++) {
    advanceSalesStats(state, 0.1)
  }
}

describe('salesStats', () => {
  it('shows demand from all customers per minute', () => {
    expect(demandPerMinute(createInitialState()).toNumber()).toBe(30)
  })

  it('shows 0 for every product in a new game', () => {
    const state = createInitialState()
    for (const product of PRODUCTS) {
      expect(soldPerMinute(state, product)).toBe(0)
    }
    expect(incomePerMinute(state)).toBe(0)
  })

  it('averages steady sales over the last minute', () => {
    const state = createInitialState()
    for (let i = 0; i < 15; i++) {
      advanceSalesStats(state, 4)
      recordSale(state, 'leverkas', 1)
    }
    expect(soldPerMinute(state, 'leverkas')).toBe(15)
    expect(incomePerMinute(state)).toBe(375)
  })

  it('shows the real rate of steady sales right after loading', () => {
    const state = createInitialState()
    for (let i = 0; i < 10; i++) {
      wait(state, 2)
      recordSale(state, 'leverkas', 1)
    }
    expect(soldPerMinute(state, 'leverkas')).toBeCloseTo(30, 6)
    expect(incomePerMinute(state)).toBeCloseTo(750, 6)
  })

  it('averages a sale right after loading over at least 10 seconds', () => {
    const state = createInitialState()
    state.stock.tofuWurst = new Decimal(3)
    state.openOrders = new Decimal(3)
    wait(state, 0.5)
    sell(state)
    expect(soldPerMinute(state, 'tofuWurst')).toBe(18)
    expect(incomePerMinute(state)).toBe(54)
  })

  it('counts a sale by hand until it drops out of the window', () => {
    const state = createInitialState()
    state.stock.tofuWurst = new Decimal(3)
    state.openOrders = new Decimal(3)
    sell(state)
    wait(state, 59.9)
    expect(soldPerMinute(state, 'tofuWurst')).toBeCloseTo(3, 1)
    expect(incomePerMinute(state)).toBeCloseTo(9, 1)
    wait(state, 1.1)
    expect(soldPerMinute(state, 'tofuWurst')).toBe(0)
    expect(incomePerMinute(state)).toBe(0)
  })

  it('leaves bulk sales out', () => {
    const state = createInitialState()
    state.stock.soybeans = new Decimal(100)
    expect(bulkSell(state, 'megaMeat', 'soybeans')).toBe(true)
    expect(incomePerMinute(state)).toBe(0)
  })
})

describe('demand under a MegaMeat scandal', () => {
  it('shows half the demand at a scandal of €10,000', () => {
    const state = createInitialState()
    state.customers = new Decimal(1_600)
    state.megaMeatScandal = new Decimal(10_000)
    expect(demandPerMinute(state).toNumber()).toBeCloseTo(1_200, 6)
  })

  it('follows the demand curve: 800 customers order 1,800 per minute, not 2,400', () => {
    const state = createInitialState()
    state.customers = new Decimal(800)
    expect(demandPerMinute(state).toNumber()).toBeCloseTo(1_800, 6)
  })
})
