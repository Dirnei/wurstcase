import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../state'
import {
  aktionCost,
  aktionEstimate,
  canRun,
  coolDown,
  isAktionenUnlocked,
  isAktionOffered,
  runAktion,
} from './aktionen'

function withPool(pool: number, customers = 10, earned = 1_000): GameState {
  const state = createInitialState()
  state.awareness = new Decimal(pool)
  state.customers = new Decimal(customers)
  state.totalEarned = new Decimal(earned)
  return state
}

describe('isAktionenUnlocked', () => {
  it('shows the panel from €1,000 earned', () => {
    expect(isAktionenUnlocked(withPool(0, 10, 999))).toBe(false)
    expect(isAktionenUnlocked(withPool(0, 10, 1_000))).toBe(true)
    expect(isAktionOffered(withPool(0, 10, 1_000), 'flyer')).toBe(true)
  })
})

describe('isAktionOffered', () => {
  it('offers the viral video only with €15,000 earned and a pig', () => {
    const state = withPool(0, 10, 20_000)
    state.residents.push({ species: 'chicken', name: 0 }, { species: 'cow', name: 0 })
    expect(isAktionOffered(state, 'viralReel')).toBe(false)
    state.residents.push({ species: 'pig', name: 0 })
    expect(isAktionOffered(state, 'viralReel')).toBe(true)
    expect(isAktionOffered({ ...state, totalEarned: new Decimal(14_999) }, 'viralReel')).toBe(false)
  })

  it('offers the fact check once the first counter-event has started, and keeps it', () => {
    const state = withPool(0)
    expect(isAktionOffered(state, 'factCheck')).toBe(false)
    state.megaMeat.started = 1
    expect(isAktionOffered(state, 'factCheck')).toBe(true)
  })
})

describe('runAktion', () => {
  it('converts customers for awareness and starts the cooldown', () => {
    const state = withPool(150, 10_000)
    expect(runAktion(state, 'flyer')).toBe(true)
    expect(state.customers.toNumber()).toBe(10_010)
    expect(state.awareness.toNumber()).toBe(50)
    expect(state.aktionen.cooldown.flyer).toBe(30)
    expect(state.aktionen.runs.flyer).toBe(1)
  })

  it('cannot run while cooling down', () => {
    const state = withPool(1_000)
    runAktion(state, 'flyer')
    coolDown(state, 10)
    expect(canRun(state, 'flyer')).toBe('cooldown')
    expect(state.aktionen.cooldown.flyer).toBe(20)
    expect(runAktion(state, 'flyer')).toBe(false)
    coolDown(state, 20)
    expect(canRun(state, 'flyer')).toBe('ok')
  })

  it('cannot run without enough awareness', () => {
    const state = withPool(99)
    expect(canRun(state, 'flyer')).toBe('awareness')
    expect(runAktion(state, 'flyer')).toBe(false)
    expect(state.awareness.toNumber()).toBe(99)
  })

  it('converts fewer customers as the town fills up', () => {
    const state = withPool(1_500, 19_000, 5_000)
    expect(aktionEstimate(state, 'openFarmDay')).toBe(15)
    runAktion(state, 'openFarmDay')
    expect(state.customers.toNumber()).toBe(19_015)
  })

  it('never converts beyond the town', () => {
    const state = withPool(1_500, 20_000, 5_000)
    runAktion(state, 'openFarmDay')
    expect(state.customers.toNumber()).toBe(20_000)
  })

  it('ends the active counter-event with a fact check', () => {
    const state = withPool(400)
    state.megaMeat = { active: { event: 'adCampaign', remaining: 90 }, nextIn: null, nextIndex: 1, started: 1 }
    expect(runAktion(state, 'factCheck')).toBe(true)
    expect(state.megaMeat.active).toBeNull()
    expect(state.megaMeat.nextIn).toBe(300)
    expect(state.awareness.toNumber()).toBe(100)
    expect(state.customers.toNumber()).toBe(10)
  })

  it('has nothing to fact-check without an active event', () => {
    const state = withPool(1_000)
    state.megaMeat.started = 1
    expect(canRun(state, 'factCheck')).toBe('noEvent')
    expect(runAktion(state, 'factCheck')).toBe(false)
  })

  it('costs double while MegaMeat has booked the billboards', () => {
    const state = withPool(1_000)
    state.megaMeat = { active: { event: 'billboards', remaining: 90 }, nextIn: null, nextIndex: 0, started: 3 }
    expect(aktionCost(state, 'flyer')).toBe(200)
    expect(aktionCost(state, 'factCheck')).toBe(600)
  })

  it('never touches money', () => {
    const state = withPool(1_000)
    state.money = new Decimal(123)
    runAktion(state, 'flyer')
    expect(state.money.toNumber()).toBe(123)
  })

  it('makes MegaMeat schedule its first counter-event', () => {
    const state = withPool(1_000)
    runAktion(state, 'flyer')
    expect(state.megaMeat.nextIn).toBe(60)
  })

  it('refuses an Aktion that is not offered', () => {
    const state = withPool(10_000, 10, 999)
    expect(canRun(state, 'flyer')).toBe('locked')
    expect(runAktion(state, 'flyer')).toBe(false)
  })
})
