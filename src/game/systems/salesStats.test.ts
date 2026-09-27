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

  it('counts a sale by hand until it drops out of the window', () => {
    const state = createInitialState()
    state.stock.tofuWurst = new Decimal(3)
    state.openOrders = new Decimal(3)
    sell(state)
    wait(state, 59.9)
    expect(soldPerMinute(state, 'tofuWurst')).toBe(3)
    expect(incomePerMinute(state)).toBe(9)
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
