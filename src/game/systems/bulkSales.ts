import Decimal from 'break_eternity.js'
import { CHAIN_RESOURCES } from '../content/buildings'
import { BUYERS, getBuyer, type BuyerId, type Lot } from '../content/buyers'
import type { ProductId, ResourceId } from '../content/resources'
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
type Floods = Pick<GameState, 'megaMeatFlood' | 'biogasFlood'>
type Flooded = Readonly<Pick<GameState, 'upgrades'> & Floods>

/** A flood this small counts as a fresh market, so recovered markets read exactly 100%. */
const FRESH_FLOOD = 0.01

/** Where each buyer's floods live in the state. */
const FLOOD_OF: Record<BuyerId, keyof Floods> = { megaMeat: 'megaMeatFlood', biogas: 'biogasFlood' }

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
 * A buyer's lot for a resource, or undefined if it does not take it. A flooded market's lot price
 * is at its full price, before the flood; what a sale really pays is `bulkSaleValue`.
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

/** Whether this buyer's market for this resource floods. */
export function isFlooded(buyer: BuyerId, resource: ResourceId): boolean {
  const { flood } = getBuyer(buyer)
  return flood !== undefined && hasLot(buyer, resource) && (!flood.resources || flood.resources.includes(resource))
}

/** A buyer's price per unit at a fresh market: MegaMeat's pegged price, or the lot's price per unit. */
function freshPrice(state: Priced, buyer: BuyerId, resource: ResourceId): number | undefined {
  const lot = lotFor(state, buyer, resource)
  return lot && (buyer === 'megaMeat' ? fullPrice(state, resource) : lot.price / lot.units)
}

function floodOf(state: Partial<Floods>, resource: ResourceId, buyer: BuyerId): number {
  return state[FLOOD_OF[buyer]]?.[resource]?.toNumber() ?? 0
}

/** A flooded market's current price as a share of its full price: K ÷ (K + flood); 1 when fresh or unflooded. */
export function marketLevel(state: Partial<Floods>, resource: ResourceId, buyer: BuyerId = 'megaMeat'): number {
  if (!isFlooded(buyer, resource)) {
    return 1
  }
  const { halfPriceEuros: k } = getBuyer(buyer).flood!
  return k / (k + floodOf(state, resource, buyer))
}

/**
 * What selling this many units on a flooded market pays now, paid unit by unit along the falling
 * price: K × ln((K + F + n × full) ÷ (K + F)), in whole euros, with the flood F in euros of full price.
 */
export function floodedValue(state: Flooded, resource: ResourceId, units: Decimal, buyer: BuyerId = 'megaMeat'): Decimal {
  const full = freshPrice(state, buyer, resource)
  if (full === undefined || units.lte(0)) {
    return new Decimal(0)
  }
  const { halfPriceEuros: k } = getBuyer(buyer).flood!
  const base = k + floodOf(state, resource, buyer)
  return new Decimal(Math.floor(k * Math.log1p((units.toNumber() * full) / base) + EURO_EPSILON))
}

/** What one more unit pays right now: the lot's price per unit, lowered by the flood where the market floods. */
export function unitPrice(state: Priced & Partial<Floods>, buyer: BuyerId, resource: ResourceId): number | undefined {
  const full = freshPrice(state, buyer, resource)
  return full === undefined ? undefined : full * marketLevel(state, resource, buyer)
}

/** Seconds of game time until a flooded market is back at the given level; 0 if it is. */
export function timeToRecover(state: Partial<Floods>, resource: ResourceId, level: number, buyer: BuyerId = 'megaMeat'): number {
  if (!isFlooded(buyer, resource)) {
    return 0
  }
  const { halfPriceEuros: k, halfLifeSeconds: h } = getBuyer(buyer).flood!
  const flood = floodOf(state, resource, buyer)
  const allowed = k * (1 / level - 1)
  return flood <= allowed ? 0 : h * Math.log2(flood / allowed)
}

/** Lets every flooded market recover: each flood halves every H seconds of its buyer, exactly across ticks. */
export function recoverMarkets(state: GameState, seconds: number): void {
  for (const buyer of BUYERS) {
    if (!buyer.flood) {
      continue
    }
    const floods = state[FLOOD_OF[buyer.id]]
    const factor = 2 ** (-seconds / buyer.flood.halfLifeSeconds)
    for (const resource of Object.keys(floods) as ResourceId[]) {
      const flood = floods[resource]!.mul(factor)
      if (flood.lt(FRESH_FLOOD)) {
        delete floods[resource]
      } else {
        floods[resource] = flood
      }
    }
  }
}

/**
 * The buyer that pays the most for one more unit of a resource right now, or null if nobody buys
 * it. With withoutFeedCost, only buyers whose sales cost no customers count.
 */
export function bestBuyer(
  state: Priced & Partial<Floods>,
  resource: ResourceId,
  { withoutFeedCost = false } = {},
): { buyer: BuyerId; perUnit: number } | null {
  const flooded = { upgrades: state.upgrades, megaMeatFlood: state.megaMeatFlood ?? {}, biogasFlood: state.biogasFlood ?? {} }
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

/** Euros a sale would pay right now; on a flooded market along its falling price. */
export function bulkSaleValue(state: Readonly<GameState>, buyer: BuyerId, resource: ResourceId, share = 1): Decimal {
  if (isFlooded(buyer, resource)) {
    return floodedValue(state, resource, bulkSaleUnits(state, buyer, resource, share), buyer)
  }
  const lot = lotFor(state, buyer, resource)
  return lot ? wholeLots(state, buyer, resource, share).mul(lot.price) : new Decimal(0)
}

/** A scandal this small counts as none, so a faded scandal reads exactly 0. */
const NO_SCANDAL = 0.01

/** The share of their customers campaigns win under the current MegaMeat scandal: K ÷ (K + scandal). */
export function scandalFactor(state: Pick<GameState, 'megaMeatScandal'>): number {
  const { halfReachEuros: k } = getBuyer('megaMeat').feedCost!.scandal
  return k / (k + state.megaMeatScandal.toNumber())
}

/** Lets the scandal fade: it halves every H seconds, exactly across ticks. */
export function advanceScandal(state: GameState, seconds: number): void {
  if (state.megaMeatScandal.eq(0)) {
    return
  }
  const { halfLifeSeconds } = getBuyer('megaMeat').feedCost!.scandal
  const scandal = state.megaMeatScandal.mul(2 ** (-seconds / halfLifeSeconds))
  state.megaMeatScandal = scandal.lt(NO_SCANDAL) ? new Decimal(0) : scandal
}

/** Reach lost below which the scandal no longer counts as fading: 5%. */
const FADED_LOSS = 0.05

/** Game seconds until the scandal costs campaigns less than 5% of their customers; 0 if it already does. */
export function scandalFadeSeconds(state: Pick<GameState, 'megaMeatScandal'>): number {
  const { halfReachEuros: k, halfLifeSeconds: h } = getBuyer('megaMeat').feedCost!.scandal
  // K ÷ (K + S) ≥ 95% once S ≤ K ÷ 19.
  const faded = k * (FADED_LOSS / (1 - FADED_LOSS))
  const scandal = state.megaMeatScandal.toNumber()
  return scandal <= faded ? 0 : h * Math.log2(scandal / faded)
}

/**
 * What a sale would cost right now: awareness points, and how many percent fewer customers
 * campaigns would win right after it, rounded up. Both 0 for a buyer without a feed cost.
 */
export function bulkSaleCost(
  state: Readonly<GameState>,
  buyer: BuyerId,
  resource: ResourceId,
  share = 1,
): { awareness: number; scandalLoss: number } {
  const cost = getBuyer(buyer).feedCost
  const euros = bulkSaleValue(state, buyer, resource, share).toNumber()
  if (!cost || euros === 0) {
    return { awareness: 0, scandalLoss: 0 }
  }
  const after = scandalFactor({ megaMeatScandal: state.megaMeatScandal.add(euros) })
  return {
    awareness: Math.ceil(euros / cost.eurosPerAwareness),
    // A hair of float noise must not turn an exact percent into the next one.
    scandalLoss: Math.ceil((1 - after) * 100 - 1e-9),
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
  if (isFlooded(buyer, resource)) {
    // The flood counts the sale at full price, in euros.
    const floods = state[FLOOD_OF[buyer]]
    const full = new Decimal(freshPrice(state, buyer, resource) ?? 0)
    floods[resource] = (floods[resource] ?? new Decimal(0)).add(units.mul(full))
  }
  // Customers stay; the sale costs awareness (never below 0) and feeds the scandal.
  state.awareness = Decimal.max(state.awareness.sub(cost.awareness), 0)
  if (getBuyer(buyer).feedCost) {
    state.megaMeatScandal = state.megaMeatScandal.add(earned)
  }
  return true
}
