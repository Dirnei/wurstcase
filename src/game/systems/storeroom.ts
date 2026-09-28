import Decimal from 'break_eternity.js'
import type { ResourceId } from '../content/resources'
import { STOREROOM } from '../content/storeroom'
import type { GameState } from '../state'

/** Units of each good the storeroom holds at its current level. */
export function storeroomRoom(state: Readonly<GameState>): Decimal {
  return grown(STOREROOM.baseRoom, STOREROOM.roomGrowth, state.storeroom - 1)
}

/** Free room for a good; never negative, so stock above the room simply leaves none. */
export function roomFor(state: Readonly<GameState>, resource: ResourceId): Decimal {
  return Decimal.max(storeroomRoom(state).sub(state.stock[resource]), 0)
}

export function isFull(state: Readonly<GameState>, resource: ResourceId): boolean {
  return state.stock[resource].gte(storeroomRoom(state))
}

/** Rounded up to whole euros, so money stays a whole number. */
export function expansionPrice(state: Readonly<GameState>): Decimal {
  return grown(STOREROOM.basePrice, STOREROOM.priceGrowth, state.storeroom - 1).ceil()
}

/**
 * base × growth^times. Plain numbers are exact for whole results up to 2^53, where Decimal.pow is
 * off by a hair (2,700.0000000004), enough for ceil to add a euro; Decimal only takes over beyond.
 */
function grown(base: number, growth: number, times: number): Decimal {
  const value = base * growth ** times
  return value <= Number.MAX_SAFE_INTEGER ? new Decimal(value) : new Decimal(base).mul(Decimal.pow(growth, times))
}

export function canExpand(state: Readonly<GameState>): boolean {
  return state.money.gte(expansionPrice(state))
}

export function expandStoreroom(state: GameState): boolean {
  if (!canExpand(state)) {
    return false
  }
  state.money = state.money.sub(expansionPrice(state))
  state.storeroom += 1
  return true
}
