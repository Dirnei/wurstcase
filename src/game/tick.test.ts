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
})
