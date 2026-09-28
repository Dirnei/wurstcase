import type { ResourceId } from './resources'

export type BuyerId = 'megaMeat' | 'biogas'

/** A buyer takes a resource only in whole lots, so money stays a whole number. */
export interface Lot {
  units: number
  /** Whole euros paid per lot. */
  price: number
}

/**
 * What feeding the industry costs the player: awareness, one point per so many euros, and a
 * scandal that makes campaigns win fewer customers for a while. Customers are never taken away.
 */
export interface FeedCost {
  eurosPerAwareness: number
  /**
   * The scandal a sale's euros raise: campaigns win K ÷ (K + scandal) of their customers, and the
   * scandal halves every H seconds of game time.
   */
  scandal: {
    /** K: the scandal, in euros of MegaMeat sales, at which campaigns win half. */
    halfReachEuros: number
    /** H: seconds of game time in which the scandal halves. */
    halfLifeSeconds: number
  }
}

/**
 * Prices tied to the product of the resource's chain at its current price, upgrades included, so
 * the buyer always outbids what the vegan product earns.
 */
export interface PeggedPricing {
  /** Units in every lot. */
  lotUnits: number
  /** A raw ingredient's price per unit, as a share of its chain product's price. */
  raw: number
  /** An intermediate's price per unit, as a share of its chain's raw ingredient price. */
  intermediate: number
}

/**
 * A market that floods: at a flood of F the price per unit is the full price × K ÷ (K + F), and the
 * flood halves every H seconds of game time. Floods count euros of full price, so every market
 * caps at the same K × ln 2 ÷ H per second, whatever its resource costs.
 */
export interface Flood {
  /** K: the flood, in euros of full-price sales, at which the price is half the full price. */
  halfPriceEuros: number
  /** H: seconds of game time in which the flood halves. */
  halfLifeSeconds: number
  /** The resources whose markets flood; all the buyer takes when left out. */
  resources?: readonly ResourceId[]
}

export interface BuyerDef {
  id: BuyerId
  /** Fixed lots, per resource the buyer takes. */
  lots?: Partial<Record<ResourceId, Lot>>
  /** Instead of fixed lots: prices that follow the chain products. Never for products themselves. */
  pegged?: PeggedPricing
  /** A market the player's sales flood, per resource; only for pegged prices. */
  flood?: Flood
  /** Only for buyers whose money comes at a moral price. */
  feedCost?: FeedCost
}

/**
 * Value one processing step adds. A resource's market value is what one unit becomes in the next
 * stage, divided by one plus this, down from the product's price; bulk buyers pay a share of it.
 */
export const STEP_MARKUP = 0.25

/**
 * Bulk buyers for surplus the customers cannot take. MegaMeat openly outbids vegan food: a raw
 * ingredient pays more than the finished product it would become, an intermediate half that (they
 * become animal feed), so processing first loses money there; every sale costs customers and
 * awareness. The biogas plant pays about 67% of the market value for everything, finished products
 * included, and costs nothing; there, each processing step adds value.
 */
export const BUYERS: readonly BuyerDef[] = [
  {
    id: 'megaMeat',
    pegged: { lotUnits: 20, raw: 1.05, intermediate: 0.5 },
    flood: { halfPriceEuros: 1_575, halfLifeSeconds: 20 },
    feedCost: { eurosPerAwareness: 10, scandal: { halfReachEuros: 10_000, halfLifeSeconds: 600 } },
  },
  {
    id: 'biogas',
    // Only the finished products flood: their lots pay far more than raw goods, so dumping them
    // would otherwise be an income without a ceiling.
    flood: { halfPriceEuros: 1_575, halfLifeSeconds: 20, resources: ['tofuWurst', 'leverkas', 'haferCappuccino'] },
    lots: {
      soybeans: { units: 7, price: 3 },
      wheat: { units: 3, price: 8 },
      oats: { units: 5, price: 13 },
      tofu: { units: 5, price: 8 },
      seitan: { units: 3, price: 20 },
      oatDrink: { units: 2, price: 13 },
      tofuWurst: { units: 1, price: 2 },
      leverkas: { units: 1, price: 17 },
      haferCappuccino: { units: 1, price: 8 },
    },
  },
]

/** The shares of a resource's stock a bulk sale can take: each offer has one button per share. */
export const BULK_SHARES = [0.1, 0.5, 1] as const

export const BUYER_IDS: readonly BuyerId[] = BUYERS.map((buyer) => buyer.id)

const BY_ID = new Map(BUYERS.map((buyer) => [buyer.id, buyer]))

export function getBuyer(id: BuyerId): BuyerDef {
  return BY_ID.get(id)!
}
