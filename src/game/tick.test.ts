import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState } from './state'
import { tick } from './tick'

function expectRelativelyEqual(actual: number, expected: number): void {
  const tolerance = 1e-9 * Math.max(Math.abs(actual), Math.abs(expected))
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance)
}

describe('tick', () => {
  it('starts a new game with no play time, money, stock or buildings', () => {
    const state = createInitialState()
    expect(state.playTime).toBe(0)
    expect(state.money.eq(0)).toBe(true)
    expect(state.totalEarned.eq(0)).toBe(true)
    expect(Object.values(state.stock).every((amount) => amount.eq(0))).toBe(true)
    expect(Object.values(state.buildings).every((count) => count === 0)).toBe(true)
    expect(state.waiting).toEqual({})
    expect(state.customers.toNumber()).toBe(10)
    expect(state.openOrders.toNumber()).toBe(0)
    expect(state.orderProgress).toBe(0)
    expect(state.assistant).toBe(false)
  })

  it('advances play time by the given seconds', () => {
    const state = createInitialState()
    tick(state, 2.5)
    expect(state.playTime).toBe(2.5)
  })

  it('gives the same result for one big step and many small steps', () => {
    const once = createInitialState()
    tick(once, 1)

    const split = createInitialState()
    for (let i = 0; i < 10; i++) {
      tick(split, 0.1)
    }

    expectRelativelyEqual(split.playTime, once.playTime)
  })

  it('agrees within one order for one big and many small ticks while the assistant sells', () => {
    const setup = () => {
      const state = createInitialState()
      state.buildings.soybeanField = 3
      state.buildings.tofuPress = 1
      state.buildings.tofuWurstKitchen = 1
      state.stock.tofuWurst = new Decimal(4)
      state.assistant = true
      return state
    }
    const once = setup()
    tick(once, 60)
    const split = setup()
    for (let i = 0; i < 600; i++) {
      tick(split, 0.1)
    }

    expect(once.money.toNumber()).toBeGreaterThan(0)
    expect(split.openOrders.sub(once.openOrders).abs().toNumber()).toBeLessThanOrEqual(1)
    expect(split.money.sub(once.money).abs().toNumber()).toBeLessThanOrEqual(3)
  })
})
