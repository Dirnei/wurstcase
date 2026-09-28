import Decimal from 'break_eternity.js'
import { BUYERS, getBuyer, type BuyerId, type Lot } from '../content/buyers'
import type { ResourceId } from '../content/resources'
import { STARTING_CUSTOMERS } from '../content/town'
import type { GameState } from '../state'

function lotOf(buyer: BuyerId, resource: ResourceId): Lot | undefined {
  return getBuyer(buyer).lots[resource]
}

/**
 * The buyer that pays the most per unit of a resource, or null if nobody buys it. With
 * withoutFeedCost, only buyers whose sales cost no customers count.
 */
export function bestBuyer(
  resource: ResourceId,
  { withoutFeedCost = false } = {},
): { buyer: BuyerId; perUnit: number } | null {
  let best: { buyer: BuyerId; perUnit: number } | null = null
  for (const buyer of BUYERS) {
    if (withoutFeedCost && buyer.feedCost) {
      continue
    }
    const lot = buyer.lots[resource]
    if (lot && (!best || lot.price / lot.units > best.perUnit)) {
      best = { buyer: buyer.id, perUnit: lot.price / lot.units }
    }
  }
  return best
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

/** Customers and awareness points a sale would cost right now; both 0 for a buyer without a feed cost. */
export function bulkSaleCost(
  state: Readonly<GameState>,
  buyer: BuyerId,
  resource: ResourceId,
): { customers: number; awareness: number } {
  const cost = getBuyer(buyer).feedCost
  const euros = bulkSaleValue(state, buyer, resource).toNumber()
  if (!cost || euros === 0) {
    return { customers: 0, awareness: 0 }
  }
  return {
    customers: Math.ceil(euros / cost.eurosPerCustomer),
    awareness: Math.ceil(euros / cost.eurosPerAwareness),
  }
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
  const cost = bulkSaleCost(state, buyer, resource)
  state.stock[resource] = state.stock[resource].sub(units)
  state.money = state.money.add(earned)
  state.totalEarned = state.totalEarned.add(earned)
  state.unitsSold[buyer] = state.unitsSold[buyer].add(units)
  // The starting neighbours never leave, and awareness never goes negative.
  const floor = Decimal.min(state.customers, STARTING_CUSTOMERS)
  state.customers = Decimal.max(state.customers.sub(cost.customers), floor)
  state.awareness = Decimal.max(state.awareness.sub(cost.awareness), 0)
  return true
}
