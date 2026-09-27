import Decimal from 'break_eternity.js'
import { getSpecies } from '../content/animals'
import { CONVERSION_PER_AWARENESS, POPULATION } from '../content/town'
import type { GameState } from '../state'

/** Awareness per second from all residents of the Lebenshof. */
export function awarenessRate(state: Readonly<GameState>): number {
  return state.residents.reduce((sum, resident) => sum + getSpecies(resident.species).awareness, 0)
}

/** Townspeople converted per second; slows as fewer townspeople are left to convince. */
export function conversionRate(state: Readonly<GameState>): number {
  const share = Math.max(0, 1 - state.customers.toNumber() / POPULATION)
  return CONVERSION_PER_AWARENESS * awarenessRate(state) * share
}

/**
 * Turns townspeople into whole customers. The fraction carries over between ticks; the rate uses
 * the customers at the start of the tick.
 */
export function convert(state: GameState, seconds: number): void {
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
