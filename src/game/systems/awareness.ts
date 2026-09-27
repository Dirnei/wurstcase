import Decimal from 'break_eternity.js'
import { getSpecies } from '../content/animals'
import { CONVERSION_PER_AWARENESS, POPULATION } from '../content/town'
import type { GameState } from '../state'
import { activeFactors } from './villain'

/** Float steps such as 20 × 0.1 can land just below a whole point; this much short still counts. */
const POINT_EPSILON = 1e-9

/** Residents' awareness per second before counter-events. */
export function baseAwarenessRate(state: Readonly<GameState>): number {
  return state.residents.reduce((sum, resident) => sum + getSpecies(resident.species).awareness, 0)
}

/** Awareness per second from all residents, lowered while a counter-event halves it. */
export function awarenessRate(state: Readonly<GameState>): number {
  return baseAwarenessRate(state) * activeFactors(state).awareness
}

/** Whether a counter-event currently lowers awareness. */
export function isAwarenessReduced(state: Readonly<GameState>): boolean {
  return activeFactors(state).awareness < 1
}

/** Adds the awareness produced to the pool in whole points; the fraction carries over. */
export function gatherAwareness(state: GameState, seconds: number): void {
  const gained = awarenessRate(state) * seconds + state.awarenessProgress
  const whole = Math.floor(gained + POINT_EPSILON)
  state.awareness = state.awareness.add(whole)
  state.awarenessProgress = Math.max(0, gained - whole)
}

/** Townspeople converted per second; slows as fewer townspeople are left to convince. */
export function conversionRate(state: Readonly<GameState>): number {
  const share = Math.max(0, 1 - state.customers.toNumber() / POPULATION)
  return CONVERSION_PER_AWARENESS * awarenessRate(state) * activeFactors(state).conversion * share
}

/**
 * Turns townspeople into whole customers without touching the pool. The fraction carries over
 * between ticks and is kept while a counter-event pauses conversion; the rate uses the customers
 * at the start of the tick.
 */
export function convert(state: GameState, seconds: number): void {
  if (activeFactors(state).conversion === 0) {
    return
  }
  const gained = conversionRate(state) * seconds + state.conversionProgress
  const whole = Math.floor(gained)
  const room = new Decimal(POPULATION).sub(state.customers).max(0)
  if (room.lte(whole)) {
    state.customers = state.customers.max(POPULATION)
    state.conversionProgress = 0
    return
  }
  state.customers = state.customers.add(whole)
  state.conversionProgress = gained - whole
}
