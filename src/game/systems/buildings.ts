import Decimal from 'break_eternity.js'
import { BUILDINGS, getBuilding, SET_GROWTH, setShare, type BuildingId } from '../content/buildings'
import type { ResourceId } from '../content/resources'
import type { GameState } from '../state'

/**
 * Base price × the chain's set growth ^ (copies owned ÷ the building's share of a balanced set),
 * rounded up to whole euros, so money stays a whole number. Owning one whole set of a chain
 * multiplies every price in it by the set growth once.
 */
export function buildingPrice(state: Readonly<GameState>, id: BuildingId): Decimal {
  return grownPrice(id, state.buildings[id])
}

/** Float noise can put a whole result a hair above it (318.00000000000006); ceil must not add a euro for that. */
const PRICE_EPSILON = 1e-12

export function grownPrice(id: BuildingId, owned: number): Decimal {
  const { basePrice, chain } = getBuilding(id)
  const sets = owned / setShare(id)
  const price = basePrice * SET_GROWTH[chain] ** sets
  return price < 1e12
    ? new Decimal(Math.ceil(price * (1 - PRICE_EPSILON)))
    : new Decimal(basePrice).mul(Decimal.pow(SET_GROWTH[chain], sets)).ceil()
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
