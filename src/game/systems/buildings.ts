import Decimal from 'break_eternity.js'
import { BUILDINGS, getBuilding, type BuildingId } from '../content/buildings'
import type { ResourceId } from '../content/resources'
import type { GameState } from '../state'

/** Each copy owned makes the next one this much more expensive. */
export const PRICE_GROWTH = 1.1

/** Rounded up to whole euros, so money stays a whole number. */
export function buildingPrice(state: Readonly<GameState>, id: BuildingId): Decimal {
  return new Decimal(getBuilding(id).basePrice)
    .mul(Decimal.pow(PRICE_GROWTH, state.buildings[id]))
    .ceil()
}

/** Unlocks follow lifetime earnings, so spending money never locks a building again. */
export function isUnlocked(state: Readonly<GameState>, id: BuildingId): boolean {
  return state.totalEarned.gte(getBuilding(id).unlockAt)
}

export function canBuy(state: Readonly<GameState>, id: BuildingId): boolean {
  return isUnlocked(state, id) && state.money.gte(buildingPrice(state, id))
}

export function buyBuilding(state: GameState, id: BuildingId): boolean {
  if (!canBuy(state, id)) {
    return false
  }
  state.money = state.money.sub(buildingPrice(state, id))
  state.buildings[id] += 1
  return true
}

/** The locked buildings that unlock next: all that share the lowest threshold, in production order. */
export function nextLockedBuildings(state: Readonly<GameState>): BuildingId[] {
  const locked = BUILDINGS.filter((building) => !isUnlocked(state, building.id))
  const next = Math.min(...locked.map((building) => building.unlockAt))
  return locked.filter((building) => building.unlockAt === next).map((building) => building.id)
}

/** A resource is shown once the player has some, or an unlocked building makes it. */
export function isResourceShown(state: Readonly<GameState>, resource: ResourceId): boolean {
  return (
    state.stock[resource].gt(0) ||
    BUILDINGS.some((building) => building.output === resource && isUnlocked(state, building.id))
  )
}
