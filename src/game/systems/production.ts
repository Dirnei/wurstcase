import { BUILDINGS } from '../content/buildings'
import { RESOURCES, type ResourceId } from '../content/resources'
import type { GameState } from '../state'
import { storeroomRoom } from './storeroom'
import { rateFactor, yieldPerRun } from './upgrades'

/** How long an input stays marked as short after a building last waited for it. */
export const SHORTAGE_HOLD_SECONDS = 3

/** How long a good stays marked as full after it was last full or a building last waited on it. */
export const FULL_HOLD_SECONDS = 3

/**
 * Runs every building for the given seconds, in whole runs only. All copies of a building type
 * work towards the next run together; a finished run takes its whole input at once and makes its
 * yield. Buildings run in chain order, so output made earlier in the tick is available to later
 * stages. A run happens only when its whole yield fits the storeroom; room freed by a later stage
 * in the same tick helps the earlier one on the next tick.
 */
export function produce(state: GameState, seconds: number): void {
  state.waiting = {}
  state.blocked = {}
  // The level cannot change within a tick. Plain numbers keep the room check cheap on every tick;
  // they are exact below 2^53 units, and far beyond that a unit more or less does not matter.
  const room = storeroomRoom(state).toNumber()
  for (const building of BUILDINGS) {
    const count = state.buildings[building.id]
    if (count === 0) {
      continue
    }
    const progress = state.progress[building.id] + count * building.rate * rateFactor(state, building.id) * seconds
    const ready = Math.floor(progress)
    const perRun = yieldPerRun(state, building.id)
    const fit = Math.floor(Math.max(room - state.stock[building.output].toNumber(), 0) / perRun)
    let units = Math.min(ready, fit)
    let short = false
    if (building.input) {
      const { resource, ratio } = building.input
      const covered = state.stock[resource].div(ratio).floor().toNumber()
      short = covered < units
      units = Math.min(units, covered)
      state.stock[resource] = state.stock[resource].sub(units * ratio)
    }
    state.stock[building.output] = state.stock[building.output].add(units * perRun)

    if (units < ready) {
      // Short of input or of room: keep one unit ready for when it arrives, but bank nothing more.
      if (short) {
        state.waiting[building.id] = building.input!.resource
      } else {
        state.blocked[building.id] = building.output
      }
      state.progress[building.id] = Math.min(progress - units, 1)
    } else {
      state.progress[building.id] = progress - units
    }
  }
  updateShortage(state, seconds)
  updateFull(state, seconds, room)
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

function updateFull(state: GameState, seconds: number, room: number): void {
  for (const resource of Object.keys(state.full) as ResourceId[]) {
    const left = state.full[resource]! - seconds
    if (left > 0) {
      state.full[resource] = left
    } else {
      delete state.full[resource]
    }
  }
  const blocked = new Set(Object.values(state.blocked))
  for (const resource of RESOURCES) {
    // Stock counts too: a good can be full with nothing waiting on it, e.g. after a manual fill.
    if (blocked.has(resource) || state.stock[resource].toNumber() >= room) {
      state.full[resource] = FULL_HOLD_SECONDS
    }
  }
}
