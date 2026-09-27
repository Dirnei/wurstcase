import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { RESOURCES, type ResourceId } from '../content/resources'
import { createInitialState, type GameState } from '../state'
import { recordTrend, stockTrend } from './trend'

/** Records a tick of the given length in which the stock changed by the given amounts. */
function record(state: GameState, seconds: number, changes: Partial<Record<ResourceId, number>> = {}): void {
  const before = { ...state.stock }
  for (const [resource, change] of Object.entries(changes) as [ResourceId, number][]) {
    state.stock[resource] = state.stock[resource].add(change)
  }
  recordTrend(state, before, seconds)
}

function withStock(amount: number): GameState {
  const state = createInitialState()
  for (const resource of RESOURCES) {
    state.stock[resource] = new Decimal(amount)
  }
  return state
}

describe('stockTrend', () => {
  it('is steady for every resource without any record', () => {
    const state = createInitialState()
    for (const resource of RESOURCES) {
      expect(stockTrend(state, resource)).toBe('steady')
    }
  })

  it('is rising or falling beyond one unit over the window', () => {
    const state = withStock(100)
    record(state, 10, { soybeans: 3, tofu: -3, wheat: 1, oats: -1 })
    expect(stockTrend(state, 'soybeans')).toBe('rising')
    expect(stockTrend(state, 'tofu')).toBe('falling')
    expect(stockTrend(state, 'wheat')).toBe('steady')
    expect(stockTrend(state, 'oats')).toBe('steady')
  })

  it('is steady for a resource marked as short', () => {
    const state = createInitialState()
    record(state, 10, { soybeans: 5 })
    state.shortage.soybeans = 3
    expect(stockTrend(state, 'soybeans')).toBe('steady')
  })

  it('gives the same result for one long record and many short ones', () => {
    const once = createInitialState()
    record(once, 10, { soybeans: 2 })
    const split = createInitialState()
    for (let i = 0; i < 100; i++) {
      record(split, 0.1, { soybeans: i % 50 === 0 ? 1 : 0 })
    }
    expect(stockTrend(split, 'soybeans')).toBe(stockTrend(once, 'soybeans'))
    expect(stockTrend(once, 'soybeans')).toBe('rising')
  })

  it('forgets changes older than the window', () => {
    const state = createInitialState()
    record(state, 1, { soybeans: 5 })
    expect(stockTrend(state, 'soybeans')).toBe('rising')
    for (let i = 0; i < 100; i++) {
      record(state, 0.1)
    }
    expect(stockTrend(state, 'soybeans')).toBe('steady')
  })

  it('counts only the share of a long record that lies inside the window', () => {
    const state = createInitialState()
    // +60 over 60 s is +10 over the last 10 s; -9 more keeps it just above +1.
    record(state, 60, { soybeans: 60 })
    record(state, 0, { soybeans: -8.5 })
    expect(stockTrend(state, 'soybeans')).toBe('rising')
    record(state, 0, { soybeans: -1 })
    expect(stockTrend(state, 'soybeans')).toBe('steady')
  })

  it('keeps at most 11 buckets', () => {
    const state = createInitialState()
    for (let i = 0; i < 1000; i++) {
      record(state, 0.1, { soybeans: 1 })
    }
    expect(state.trend.length).toBeLessThanOrEqual(11)
  })
})
