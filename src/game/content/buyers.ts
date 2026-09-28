import type { ResourceId } from './resources'

export type BuyerId = 'megaMeat' | 'biogas'

/** A buyer takes a resource only in whole lots, so money stays a whole number. */
export interface Lot {
  units: number
  /** Whole euros paid per lot. */
  price: number
}

/** What feeding the industry costs the player: one customer and one awareness point per so many euros. */
export interface FeedCost {
  eurosPerCustomer: number
  eurosPerAwareness: number
}

export interface BuyerDef {
  id: BuyerId
  lots: Partial<Record<ResourceId, Lot>>
  /** Only for buyers whose money comes at a moral price. */
  feedCost?: FeedCost
}

/**
 * Bulk buyers for surplus the customers cannot take, paying a share of an ingredient's value as
 * vegan food that rises along the chain, so processing always pays. MegaMeat pays about 40% for raw
 * ingredients and 67% for intermediates (they become animal feed); the biogas plant about 30% for
 * raw ingredients and 50% for intermediates and finished products. Only the biogas plant also
 * takes finished products. Selling to MegaMeat costs customers and awareness; the biogas plant
 * costs nothing.
 */
export const BUYERS: readonly BuyerDef[] = [
  {
    id: 'megaMeat',
    lots: {
      soybeans: { units: 5, price: 2 },
      wheat: { units: 2, price: 5 },
      oats: { units: 5, price: 12 },
      tofu: { units: 1, price: 2 },
      seitan: { units: 3, price: 25 },
      oatDrink: { units: 1, price: 8 },
    },
    feedCost: { eurosPerCustomer: 100, eurosPerAwareness: 10 },
  },
  {
    id: 'biogas',
    lots: {
      soybeans: { units: 10, price: 3 },
      wheat: { units: 8, price: 15 },
      oats: { units: 5, price: 9 },
      tofu: { units: 2, price: 3 },
      seitan: { units: 4, price: 25 },
      oatDrink: { units: 1, price: 6 },
      tofuWurst: { units: 2, price: 3 },
      leverkas: { units: 2, price: 25 },
      haferCappuccino: { units: 1, price: 6 },
    },
  },
]

export const BUYER_IDS: readonly BuyerId[] = BUYERS.map((buyer) => buyer.id)

const BY_ID = new Map(BUYERS.map((buyer) => [buyer.id, buyer]))

export function getBuyer(id: BuyerId): BuyerDef {
  return BY_ID.get(id)!
}
