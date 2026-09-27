import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import type { SpeciesId } from '../content/animals'
import { createInitialState, type GameState } from '../state'
import { awarenessRate, convert, gatherAwareness } from './awareness'

function withLebenshof(herd: Partial<Record<SpeciesId, number>>, customers = 10): GameState {
  const state = createInitialState()
  for (const [species, count] of Object.entries(herd) as [SpeciesId, number][]) {
    for (let i = 0; i < count; i++) {
      state.residents.push({ species, name: 0 })
    }
  }
  state.customers = new Decimal(customers)
  return state
}

/** Chickens produce 1 awareness per second each, so this sets an exact rate. */
const atRate = (awareness: number, customers: number) => withLebenshof({ chicken: awareness }, customers)

describe('awarenessRate', () => {
  it('sums the output of all residents', () => {
    expect(awarenessRate(withLebenshof({ chicken: 3, pig: 2, cow: 1 }))).toBe(33)
  })

  it('is 0 without residents, and nobody is converted', () => {
    const state = withLebenshof({})
    expect(awarenessRate(state)).toBe(0)
    convert(state, 3600)
    expect(state.customers.toNumber()).toBe(10)
  })
})

describe('gatherAwareness', () => {
  it('fills the pool with the awareness produced', () => {
    const state = withLebenshof({ chicken: 3 })
    gatherAwareness(state, 10)
    expect(state.awareness.toNumber()).toBe(30)
  })

  it('collects whole points and carries the fraction over', () => {
    const state = withLebenshof({ chicken: 1 })
    for (let i = 0; i < 15; i++) {
      gatherAwareness(state, 0.1)
    }
    expect(state.awareness.toNumber()).toBe(1)
    for (let i = 0; i < 5; i++) {
      gatherAwareness(state, 0.1)
    }
    expect(state.awareness.toNumber()).toBe(2)
  })

  it('counts half during the ad campaign', () => {
    const state = withLebenshof({ chicken: 3 })
    state.megaMeat.active = { event: 'adCampaign', remaining: 100 }
    expect(awarenessRate(state)).toBe(1.5)
    gatherAwareness(state, 10)
    expect(state.awareness.toNumber()).toBe(15)
  })
})

describe('convert', () => {
  it('does not take from the pool', () => {
    const state = atRate(100, 10_000)
    state.awareness = new Decimal(500)
    gatherAwareness(state, 10)
    convert(state, 10)
    expect(state.customers.toNumber()).toBe(10_010)
    expect(state.awareness.toNumber()).toBe(1_500)
  })

  it('stops during the study but keeps its progress, while the pool still fills', () => {
    const state = atRate(100, 10_000)
    state.conversionProgress = 0.4
    state.megaMeat.active = { event: 'study', remaining: 60 }
    gatherAwareness(state, 30)
    convert(state, 30)
    expect(state.customers.toNumber()).toBe(10_000)
    expect(state.conversionProgress).toBe(0.4)
    expect(state.awareness.toNumber()).toBe(3_000)
  })

  it('converts 10 customers at 100/s over 10 s with half the town converted', () => {
    const state = atRate(100, 10_000)
    convert(state, 10)
    expect(state.customers.toNumber()).toBe(10_010)
  })

  it('slows down as the town fills up', () => {
    const state = atRate(100, 15_000)
    convert(state, 10)
    expect(state.customers.toNumber()).toBe(15_005)
  })

  it('grows in whole customers only', () => {
    const state = atRate(1, 10)
    convert(state, 10)
    expect(state.customers.toNumber()).toBe(10)
  })

  it('carries progress over to later ticks', () => {
    const state = atRate(1, 10)
    for (let i = 0; i < 6; i++) {
      convert(state, 10)
    }
    expect(state.customers.toNumber()).toBe(11)
  })

  it('ends within one customer for one long tick and many short ones', () => {
    const once = withLebenshof({ chicken: 3, pig: 2, cow: 4 })
    convert(once, 60)
    const split = withLebenshof({ chicken: 3, pig: 2, cow: 4 })
    for (let i = 0; i < 600; i++) {
      convert(split, 0.1)
    }
    expect(once.customers.toNumber()).toBeGreaterThan(10)
    expect(split.customers.sub(once.customers).abs().toNumber()).toBeLessThanOrEqual(1)
  })

  it('never goes beyond the town', () => {
    const state = atRate(0, 19_995)
    for (let i = 0; i < 1_000_000; i++) {
      state.residents.push({ species: 'chicken', name: 0 })
    }
    convert(state, 60)
    expect(state.customers.toNumber()).toBe(20_000)
    expect(state.conversionProgress).toBe(0)
  })
})
