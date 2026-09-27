import { MANUAL_ACTIONS, type ManualActionDef, type ManualActionId } from '../content/manual'
import type { GameState } from '../state'
import { isUnlocked } from './buildings'
import { manualFactor } from './upgrades'

const BY_ID = new Map<ManualActionId, ManualActionDef>(MANUAL_ACTIONS.map((action) => [action.id, action]))

/** A manual action unlocks with the building that does the same step. */
export function isManualUnlocked(state: Readonly<GameState>, id: ManualActionId): boolean {
  return isUnlocked(state, BY_ID.get(id)!.building)
}

/** Units one click makes: the upgraded amount, or as many whole units as the input covers. */
export function manualUnits(state: Readonly<GameState>, id: ManualActionId): number {
  const { input } = BY_ID.get(id)!
  const units = manualFactor(state)
  return input ? Math.min(units, state.stock[input.resource].div(input.amount).floor().toNumber()) : units
}

export function canPerform(state: Readonly<GameState>, id: ManualActionId): boolean {
  return isManualUnlocked(state, id) && manualUnits(state, id) >= 1
}

export function performManual(state: GameState, id: ManualActionId): boolean {
  if (!canPerform(state, id)) {
    return false
  }
  const { input, output } = BY_ID.get(id)!
  const units = manualUnits(state, id)
  if (input) {
    state.stock[input.resource] = state.stock[input.resource].sub(input.amount * units)
  }
  state.stock[output.resource] = state.stock[output.resource].add(output.amount * units)
  return true
}
