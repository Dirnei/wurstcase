import Decimal from 'break_eternity.js'
import { CHAIN_RESOURCES } from '../content/buildings'
import { BUYERS, getBuyer, type BuyerId, type Lot } from '../content/buyers'
import type { ProductId, ResourceId } from '../content/resources'
import { STARTING_CUSTOMERS } from '../content/town'
import type { GameState } from '../state'
import { productPrice } from './upgrades'

/** Each resource's stage in its chain (0 raw, 1 intermediate, 2 product) and the chain's product. */
const STAGES = new Map(
  CHAIN_RESOURCES.flatMap(({ resources }) =>
    resources.map((resource, stage) => [resource, { stage, product: resources.at(-1) as ProductId }] as const),
  ),
)

/** Float products such as 20 × 12.6 can land a hair below a whole euro; this much short still counts. */
const EURO_EPSILON = 1e-9

type Priced = Readonly<Pick<GameState, 'upgrades'>>
type Flooded = Readonly<Pick<GameState, 'upgrades' | 'megaMeatFlood'>>

/** A flood this small counts as a fresh market, so recovered markets read exactly 100%. */
const FRESH_FLOOD = 0.01

/** MegaMeat's full price per unit at a fresh market, pegged to the chain product; undefined for products. */
export function fullPrice(state: Priced, resource: ResourceId): number | undefined {
  const { pegged } = getBuyer('megaMeat')
  const at = STAGES.get(resource)
  if (!pegged || !at || at.stage > 1) {
    return undefined
  }
  const raw = productPrice(state, at.product) * pegged.raw
  return at.stage === 0 ? raw : raw * pegged.intermediate
}

/**
 * A buyer's lot for a resource, or undefined if it does not take it. MegaMeat's lot price is at its
 * full price, before the flood; what a sale really pays is `bulkSaleValue`.
 */
export function lotFor(state: Priced, buyer: BuyerId, resource: ResourceId): Lot | undefined {
  const { lots, pegged } = getBuyer(buyer)
  if (!pegged) {
    return lots?.[resource]
  }
  const full = fullPrice(state, resource)
  return full === undefined
    ? undefined
    : { units: pegged.lotUnits, price: Math.floor(pegged.lotUnits * full + EURO_EPSILON) }
}

function floodOf(state: Pick<GameState, 'megaMeatFlood'>, resource: ResourceId): number {
  return state.megaMeatFlood[resource]?.toNumber() ?? 0
}

/** MegaMeat's current price as a share of its full price: K ÷ (K + flood); 1 at a fresh market. */
export function marketLevel(state: Pick<GameState, 'megaMeatFlood'>, resource: ResourceId): number {
  const { halfPriceUnits: k } = getBuyer('megaMeat').flood!
  return k / (k + floodOf(state, resource))
}

/**
 * What selling this many units to MegaMeat pays now, paid unit by unit along the falling price:
 * full × K × ln((K + F + n) ÷ (K + F)), in whole euros.
 */
export function floodedValue(state: Flooded, resource: ResourceId, units: Decimal): Decimal {
  const full = fullPrice(state, resource)
  if (full === undefined || units.lte(0)) {
    return new Decimal(0)
  }
  const { halfPriceUnits: k } = getBuyer('megaMeat').flood!
  const base = k + floodOf(state, resource)
  return new Decimal(Math.floor(full * k * Math.log1p(units.toNumber() / base) + EURO_EPSILON))
}

/** What one more unit pays right now: the buyer's lot price per unit, or MegaMeat's flooded price. */
export function unitPrice(state: Flooded, buyer: BuyerId, resource: ResourceId): number | undefined {
  if (getBuyer(buyer).flood) {
    const full = fullPrice(state, resource)
    return full === undefined ? undefined : full * marketLevel(state, resource)
  }
  const lot = lotFor(state, buyer, resource)
  return lot && lot.price / lot.units
}

/** Seconds of game time until MegaMeat's market for a resource is back at the given level; 0 if it is. */
export function timeToRecover(state: Pick<GameState, 'megaMeatFlood'>, resource: ResourceId, level: number): number {
  const { halfPriceUnits: k, halfLifeSeconds: h } = getBuyer('megaMeat').flood!
  const flood = floodOf(state, resource)
  const allowed = k * (1 / level - 1)
  return flood <= allowed ? 0 : h * Math.log2(flood / allowed)
}

/** Lets every flooded market recover: the flood halves every H seconds, exactly across ticks. */
export function recoverMarkets(state: GameState, seconds: number): void {
  const { halfLifeSeconds } = getBuyer('megaMeat').flood!
  const factor = 2 ** (-seconds / halfLifeSeconds)
  for (const resource of Object.keys(state.megaMeatFlood) as ResourceId[]) {
    const flood = state.megaMeatFlood[resource]!.mul(factor)
    if (flood.lt(FRESH_FLOOD)) {
      delete state.megaMeatFlood[resource]
    } else {
      state.megaMeatFlood[resource] = flood
    }
  }
}

/**
 * The buyer that pays the most for one more unit of a resource right now, or null if nobody buys
 * it. With withoutFeedCost, only buyers whose sales cost no customers count.
 */
export function bestBuyer(
  state: Priced & Partial<Pick<GameState, 'megaMeatFlood'>>,
  resource: ResourceId,
  { withoutFeedCost = false } = {},
): { buyer: BuyerId; perUnit: number } | null {
  const flooded = { upgrades: state.upgrades, megaMeatFlood: state.megaMeatFlood ?? {} }
  let best: { buyer: BuyerId; perUnit: number } | null = null
  for (const buyer of BUYERS) {
    if (withoutFeedCost && buyer.feedCost) {
      continue
    }
    const perUnit = unitPrice(flooded, buyer.id, resource)
    if (perUnit !== undefined && (!best || perUnit > best.perUnit)) {
      best = { buyer: buyer.id, perUnit }
    }
  }
  return best
}

/** Whether a buyer takes a resource at all; the price may change, this does not. */
export function hasLot(buyer: BuyerId, resource: ResourceId): boolean {
  const { lots, pegged } = getBuyer(buyer)
  return pegged ? (STAGES.get(resource)?.stage ?? 2) <= 1 : lots?.[resource] !== undefined
}

/**
 * Whole lots in the given share of the stock: the share is rounded down to whole units first, then
 * to whole lots, so a share never sells more than it says.
 */
function wholeLots(state: Readonly<GameState>, buyer: BuyerId, resource: ResourceId, share = 1): Decimal {
  const lot = lotFor(state, buyer, resource)
  return lot ? state.stock[resource].mul(share).floor().div(lot.units).floor() : new Decimal(0)
}

/** Units a sale would take right now: whole lots only. */
export function bulkSaleUnits(state: Readonly<GameState>, buyer: BuyerId, resource: ResourceId, share = 1): Decimal {
  const lot = lotFor(state, buyer, resource)
  return lot ? wholeLots(state, buyer, resource, share).mul(lot.units) : new Decimal(0)
}

/** Euros a sale would pay right now; for MegaMeat along its flooded market. */
export function bulkSaleValue(state: Readonly<GameState>, buyer: BuyerId, resource: ResourceId, share = 1): Decimal {
  if (getBuyer(buyer).flood) {
    return floodedValue(state, resource, bulkSaleUnits(state, buyer, resource, share))
  }
  const lot = lotFor(state, buyer, resource)
  return lot ? wholeLots(state, buyer, resource, share).mul(lot.price) : new Decimal(0)
}

/** Customers and awareness points a sale would cost right now; both 0 for a buyer without a feed cost. */
export function bulkSaleCost(
  state: Readonly<GameState>,
  buyer: BuyerId,
  resource: ResourceId,
  share = 1,
): { customers: number; awareness: number } {
  const cost = getBuyer(buyer).feedCost
  const euros = bulkSaleValue(state, buyer, resource, share).toNumber()
  if (!cost || euros === 0) {
    return { customers: 0, awareness: 0 }
  }
  // What the customers spend in the horizon; the sale drives away its share of them.
  const spend = state.customerIncome.mul(cost.horizonSeconds)
  const above = Decimal.max(state.customers.sub(STARTING_CUSTOMERS), 0).toNumber()
  const lost = spend.gt(0) ? Math.ceil(state.customers.mul(euros).div(spend).toNumber()) : above
  return {
    customers: Math.min(lost, above),
    awareness: Math.ceil(euros / cost.eurosPerAwareness),
  }
}

export function canBulkSell(state: Readonly<GameState>, buyer: BuyerId, resource: ResourceId, share = 1): boolean {
  return wholeLots(state, buyer, resource, share).gt(0)
}

/** Sells the whole lots in the given share of the stock (all of it by default). */
export function bulkSell(state: GameState, buyer: BuyerId, resource: ResourceId, share = 1): boolean {
  if (!canBulkSell(state, buyer, resource, share)) {
    return false
  }
  const units = bulkSaleUnits(state, buyer, resource, share)
  const earned = bulkSaleValue(state, buyer, resource, share)
  const cost = bulkSaleCost(state, buyer, resource, share)
  state.stock[resource] = state.stock[resource].sub(units)
  state.money = state.money.add(earned)
  state.totalEarned = state.totalEarned.add(earned)
  state.unitsSold[buyer] = state.unitsSold[buyer].add(units)
  if (getBuyer(buyer).flood) {
    state.megaMeatFlood[resource] = (state.megaMeatFlood[resource] ?? new Decimal(0)).add(units)
  }
  // The starting neighbours never leave, and awareness never goes negative.
  const floor = Decimal.min(state.customers, STARTING_CUSTOMERS)
  state.customers = Decimal.max(state.customers.sub(cost.customers), floor)
  state.awareness = Decimal.max(state.awareness.sub(cost.awareness), 0)
  return true
}
