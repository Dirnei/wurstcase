import { MANUAL_ACTIONS, type ManualActionDef, type ManualActionId } from '../content/manual'
import type { GameState } from '../state'
import { isUnlocked } from './buildings'

const BY_ID = new Map<ManualActionId, ManualActionDef>(MANUAL_ACTIONS.map((action) => [action.id, action]))

/** A manual action unlocks with the building that does the same step. */
export function isManualUnlocked(state: Readonly<GameState>, id: ManualActionId): boolean {
  return isUnlocked(state, BY_ID.get(id)!.building)
}

export function canPerform(state: Readonly<GameState>, id: ManualActionId): boolean {
  const { input } = BY_ID.get(id)!
  return isManualUnlocked(state, id) && (!input || state.stock[input.resource].gte(input.amount))
}

export function performManual(state: GameState, id: ManualActionId): boolean {
  if (!canPerform(state, id)) {
    return false
  }
  const { input, output } = BY_ID.get(id)!
  if (input) {
    state.stock[input.resource] = state.stock[input.resource].sub(input.amount)
  }
  state.stock[output.resource] = state.stock[output.resource].add(output.amount)
  return true
}
