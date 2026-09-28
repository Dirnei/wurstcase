import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import type { SpeciesId } from '../content/animals'
import { createInitialState, type GameState } from '../state'
import { tick } from '../tick'
import { awarenessRate, gatherAwareness } from './awareness'

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

  it('is 0 without residents', () => {
    expect(awarenessRate(withLebenshof({}))).toBe(0)
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

describe('no passive conversion', () => {
  it('wins no customers without campaigns while the pool fills', () => {
    const state = atRate(1_000, 10)
    tick(state, 600)
    expect(state.customers.toNumber()).toBe(10)
    expect(state.awareness.toNumber()).toBe(600_000)
  })

  it('fills nothing with an empty Lebenshof', () => {
    const state = withLebenshof({})
    tick(state, 60)
    expect(awarenessRate(state)).toBe(0)
    expect(state.awareness.toNumber()).toBe(0)
    expect(state.customers.toNumber()).toBe(10)
  })
})

describe('upgrade effects on awareness', () => {
  it('doubles chicken awareness with the hen photo shoot', () => {
    const state = withLebenshof({ chicken: 3 })
    state.upgrades = ['henPhotoShoot']
    expect(awarenessRate(state)).toBe(6)
  })
})
