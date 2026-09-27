import Decimal from 'break_eternity.js'
import { BUILDING_IDS, type BuildingId } from './content/buildings'
import { RESOURCES, type ResourceId } from './content/resources'

/** The whole game in one plain, serializable object. Game systems mutate it through tick(). */
export interface GameState {
  /** Total seconds of game time played in this game, restored from the save across reloads. */
  playTime: number
  money: Decimal
  /** Euros earned in this game; only grows, and unlocks buildings. */
  totalEarned: Decimal
  stock: Record<ResourceId, Decimal>
  buildings: Record<BuildingId, number>
  /** Units each building type has worked towards but not finished; at most 1 while waiting. */
  progress: Record<BuildingId, number>
  /** Buildings that ran short of input in the last tick, and the input they lack. Not saved. */
  waiting: Partial<Record<BuildingId, ResourceId>>
  /** Seconds left to show a resource as short, held after the last wait so it does not flicker. Not saved. */
  shortage: Partial<Record<ResourceId, number>>
}

export function createInitialState(): GameState {
  return {
    playTime: 0,
    money: new Decimal(0),
    totalEarned: new Decimal(0),
    stock: Object.fromEntries(RESOURCES.map((id) => [id, new Decimal(0)])) as Record<ResourceId, Decimal>,
    buildings: Object.fromEntries(BUILDING_IDS.map((id) => [id, 0])) as Record<BuildingId, number>,
    progress: Object.fromEntries(BUILDING_IDS.map((id) => [id, 0])) as Record<BuildingId, number>,
    waiting: {},
    shortage: {},
  }
}
