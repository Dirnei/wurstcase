import type { ResourceId } from './resources'

export type BuyerId = 'megaMeat' | 'biogas'

/** A buyer takes a resource only in whole lots, so money stays a whole number. */
export interface Lot {
  units: number
  /** Whole euros paid per lot. */
  price: number
}

/**
 * What feeding the industry costs the player. A sale drives away the share of customers that it is
 * of what they spend with the player in horizonSeconds; awareness drops one point per so many euros.
 */
export interface FeedCost {
  horizonSeconds: number
  eurosPerAwareness: number
}

export interface BuyerDef {
  id: BuyerId
  lots: Partial<Record<ResourceId, Lot>>
  /** Only for buyers whose money comes at a moral price. */
  feedCost?: FeedCost
}

/**
 * Value one processing step adds. A resource's market value is what one unit becomes in the next
 * stage, divided by one plus this, down from the product's price; bulk buyers pay a share of it.
 */
export const STEP_MARKUP = 0.25

/**
 * Bulk buyers for surplus the customers cannot take. MegaMeat pays about 90% of the market value
 * for raw ingredients and intermediates (they become animal feed), which tempts; every sale costs
 * customers and awareness. The biogas plant pays about 67% for everything, finished products
 * included, and costs nothing. Each processing step adds value, so processing before selling pays.
 */
export const BUYERS: readonly BuyerDef[] = [
  {
    id: 'megaMeat',
    lots: {
      soybeans: { units: 7, price: 4 },
      wheat: { units: 5, price: 18 },
      oats: { units: 2, price: 7 },
      tofu: { units: 6, price: 13 },
      seitan: { units: 1, price: 9 },
      oatDrink: { units: 2, price: 17 },
    },
    feedCost: { horizonSeconds: 600, eurosPerAwareness: 10 },
  },
  {
    id: 'biogas',
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

export const BUYER_IDS: readonly BuyerId[] = BUYERS.map((buyer) => buyer.id)

const BY_ID = new Map(BUYERS.map((buyer) => [buyer.id, buyer]))

export function getBuyer(id: BuyerId): BuyerDef {
  return BY_ID.get(id)!
}
