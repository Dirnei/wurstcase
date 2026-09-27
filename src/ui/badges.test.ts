import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../game/state'
import { availability, hasNew } from './badges'

function earned(amount: number): GameState {
  return { ...createInitialState(), totalEarned: new Decimal(amount) }
}

describe('availability and hasNew', () => {
  it('finds a newly offered upgrade under Upgrades', () => {
    const before = availability(earned(0))
    const after = availability(earned(30))
    expect(hasNew(before.upgrades, after.upgrades)).toBe(true)
    expect(hasNew(before.produktion, after.produktion)).toBe(false)
  })

  it('finds a newly unlocked species or shelter under Lebenshof', () => {
    const before = availability(earned(99))
    const after = availability(earned(100))
    expect(hasNew(before.lebenshof, after.lebenshof)).toBe(true)
    expect(hasNew(availability(earned(1_499)).lebenshof, availability(earned(1_500)).lebenshof)).toBe(true)
  })

  it('finds a newly unlocked building under Produktion', () => {
    expect(hasNew(availability(earned(199)).produktion, availability(earned(200)).produktion)).toBe(true)
  })

  it('finds a started counter-event under Aktionen', () => {
    const state = earned(1_000)
    const before = availability(state)
    state.megaMeat.active = { event: 'adCampaign', remaining: 120 }
    state.megaMeat.started = 1
    expect(hasNew(before.aktionen, availability(state).aktionen)).toBe(true)
  })

  it('treats a second run of the same event as new', () => {
    const state = earned(1_000)
    state.megaMeat.active = { event: 'adCampaign', remaining: 120 }
    state.megaMeat.started = 1
    const seen = availability(state)
    state.megaMeat.active = null
    state.megaMeat.active = { event: 'adCampaign', remaining: 120 }
    state.megaMeat.started = 4
    expect(hasNew(seen.aktionen, availability(state).aktionen)).toBe(true)
  })

  it('gives no badge when nothing changed', () => {
    const state = earned(5_000)
    const seen = availability(state)
    const now = availability(state)
    for (const tab of ['produktion', 'upgrades', 'lebenshof', 'aktionen'] as const) {
      expect(hasNew(seen[tab], now[tab])).toBe(false)
    }
  })

  it('gives no badge when something went away', () => {
    const state = earned(30)
    const seen = availability(state)
    state.upgrades = ['strongHands']
    expect(hasNew(seen.upgrades, availability(state).upgrades)).toBe(false)
  })
})
