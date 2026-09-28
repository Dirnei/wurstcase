import { BUILDINGS } from '../content/buildings'
import type { ResourceId } from '../content/resources'
import type { GameState } from '../state'
import { rateFactor, yieldPerRun } from './upgrades'

/** How long an input stays marked as short after a building last waited for it. */
export const SHORTAGE_HOLD_SECONDS = 3

/**
 * Runs every building for the given seconds, in whole runs only. All copies of a building type
 * work towards the next run together; a finished run takes its whole input at once and makes its
 * yield. Buildings run in chain order, so output made earlier in the tick is available to later
 * stages.
 */
export function produce(state: GameState, seconds: number): void {
  state.waiting = {}
  for (const building of BUILDINGS) {
    const count = state.buildings[building.id]
    if (count === 0) {
      continue
    }
    const progress = state.progress[building.id] + count * building.rate * rateFactor(state, building.id) * seconds
    const ready = Math.floor(progress)
    let units = ready
    if (building.input) {
      const { resource, ratio } = building.input
      units = Math.min(ready, state.stock[resource].div(ratio).floor().toNumber())
      state.stock[resource] = state.stock[resource].sub(units * ratio)
    }
    state.stock[building.output] = state.stock[building.output].add(units * yieldPerRun(state, building.id))

    if (units < ready) {
      // Short of input: keep one unit ready for when it arrives, but bank nothing more.
      state.waiting[building.id] = building.input!.resource
      state.progress[building.id] = Math.min(progress - units, 1)
    } else {
      state.progress[building.id] = progress - units
    }
  }
  updateShortage(state, seconds)
}

function updateShortage(state: GameState, seconds: number): void {
  const short = new Set(Object.values(state.waiting))
  for (const resource of Object.keys(state.shortage) as ResourceId[]) {
    const left = state.shortage[resource]! - seconds
    if (left > 0) {
      state.shortage[resource] = left
    } else {
      delete state.shortage[resource]
    }
  }
  for (const resource of short) {
    state.shortage[resource] = SHORTAGE_HOLD_SECONDS
  }
}
