import { MILESTONE_FACTOR, OWNED_MILESTONES, type BuildingId } from '../content/buildings'
import type { GameState } from '../state'
import { rateFactor } from './upgrades'

/** Output factor of a building type with this many copies owned: doubled at every milestone reached. */
export function milestoneFactor(owned: number): number {
  return MILESTONE_FACTOR ** OWNED_MILESTONES.filter((at) => owned >= at).length
}

/** The next milestone not reached yet and the factor it brings, or null once all are reached. */
export function nextMilestone(owned: number): { at: number; factor: number } | null {
  const at = OWNED_MILESTONES.find((threshold) => owned < threshold)
  return at === undefined ? null : { at, factor: milestoneFactor(at) }
}

/** Everything that multiplies a building type's output: milestones and rate upgrades. */
export function outputFactor(state: Readonly<GameState>, id: BuildingId): number {
  return milestoneFactor(state.buildings[id]) * rateFactor(state, id)
}
