import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../state'
import { activeFactors, advanceVillain, endEvent, onFirstAktion } from './villain'

/** Advances only the villain in live-loop steps of 0.1 s. */
function advance(state: GameState, seconds: number): void {
  for (let i = 0; i < Math.round(seconds * 10); i++) {
    advanceVillain(state, 0.1)
  }
}

const activeEvent = (state: GameState) => state.megaMeat.active?.event ?? null

describe('advanceVillain', () => {
  it('stays quiet for an hour without any Aktion', () => {
    const state = createInitialState()
    advance(state, 3600)
    expect(state.megaMeat).toEqual({ active: null, nextIn: null, nextIndex: 0, started: 0 })
  })

  it('starts the first event 60 s after the first Aktion', () => {
    const state = createInitialState()
    onFirstAktion(state)
    advance(state, 59.9)
    expect(activeEvent(state)).toBeNull()
    advance(state, 0.1)
    expect(activeEvent(state)).toBe('adCampaign')
    expect(state.megaMeat.started).toBe(1)
  })

  it('runs the events in order, each for its duration, with 300 s in between', () => {
    const state = createInitialState()
    onFirstAktion(state)
    advance(state, 60)
    const seen = [activeEvent(state)]
    advance(state, 119.9)
    expect(activeEvent(state)).toBe('adCampaign')
    advance(state, 0.1)
    expect(activeEvent(state)).toBeNull()
    advance(state, 299.9)
    expect(activeEvent(state)).toBeNull()
    advance(state, 0.1)
    seen.push(activeEvent(state))
    advance(state, 60 + 300)
    seen.push(activeEvent(state))
    advance(state, 90 + 300)
    seen.push(activeEvent(state))
    expect(seen).toEqual(['adCampaign', 'study', 'billboards', 'adCampaign'])
    expect(state.megaMeat.started).toBe(4)
  })

  it('schedules the next event 300 s after one is ended early', () => {
    const state = createInitialState()
    onFirstAktion(state)
    advance(state, 70)
    endEvent(state)
    expect(activeEvent(state)).toBeNull()
    expect(state.megaMeat.nextIn).toBe(300)
    advance(state, 300)
    expect(activeEvent(state)).toBe('study')
  })

  it('does not move the schedule when more Aktionen run before the first event', () => {
    const state = createInitialState()
    onFirstAktion(state)
    advance(state, 30)
    onFirstAktion(state)
    advance(state, 30)
    expect(activeEvent(state)).toBe('adCampaign')
  })

  it('never schedules a second first event once MegaMeat has started', () => {
    const state = createInitialState()
    onFirstAktion(state)
    advance(state, 60)
    endEvent(state)
    onFirstAktion(state)
    expect(state.megaMeat.nextIn).toBe(300)
  })
})

describe('activeFactors', () => {
  it('is neutral without an event', () => {
    expect(activeFactors(createInitialState())).toEqual({ awareness: 1, conversion: 1, aktionCost: 1 })
  })

  it.each([
    ['adCampaign', { awareness: 0.5, conversion: 1, aktionCost: 1 }],
    ['study', { awareness: 1, conversion: 0, aktionCost: 1 }],
    ['billboards', { awareness: 1, conversion: 1, aktionCost: 2 }],
  ] as const)('applies the %s factors', (event, factors) => {
    const state = createInitialState()
    state.megaMeat.active = { event, remaining: 10 }
    expect(activeFactors(state)).toEqual(factors)
  })
})
