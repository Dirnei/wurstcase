import Decimal from 'break_eternity.js'
import { getBuyer, type BuyerId, type Lot } from '../content/buyers'
import type { ResourceId } from '../content/resources'
import type { GameState } from '../state'

function lotOf(buyer: BuyerId, resource: ResourceId): Lot | undefined {
  return getBuyer(buyer).lots[resource]
}

export function hasLot(buyer: BuyerId, resource: ResourceId): boolean {
  return lotOf(buyer, resource) !== undefined
}

function wholeLots(state: Readonly<GameState>, buyer: BuyerId, resource: ResourceId): Decimal {
  const lot = lotOf(buyer, resource)
  return lot ? state.stock[resource].div(lot.units).floor() : new Decimal(0)
}

/** Units a sale would take right now: whole lots only. */
export function bulkSaleUnits(state: Readonly<GameState>, buyer: BuyerId, resource: ResourceId): Decimal {
  const lot = lotOf(buyer, resource)
  return lot ? wholeLots(state, buyer, resource).mul(lot.units) : new Decimal(0)
}

/** Euros a sale would pay right now. */
export function bulkSaleValue(state: Readonly<GameState>, buyer: BuyerId, resource: ResourceId): Decimal {
  const lot = lotOf(buyer, resource)
  return lot ? wholeLots(state, buyer, resource).mul(lot.price) : new Decimal(0)
}

export function canBulkSell(state: Readonly<GameState>, buyer: BuyerId, resource: ResourceId): boolean {
  return wholeLots(state, buyer, resource).gt(0)
}

export function bulkSell(state: GameState, buyer: BuyerId, resource: ResourceId): boolean {
  if (!canBulkSell(state, buyer, resource)) {
    return false
  }
  const units = bulkSaleUnits(state, buyer, resource)
  const earned = bulkSaleValue(state, buyer, resource)
  state.stock[resource] = state.stock[resource].sub(units)
  state.money = state.money.add(earned)
  state.totalEarned = state.totalEarned.add(earned)
  state.unitsSold[buyer] = state.unitsSold[buyer].add(units)
  return true
}
