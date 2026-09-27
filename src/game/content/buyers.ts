import type { ResourceId } from './resources'

export type BuyerId = 'megaMeat' | 'biogas'

/** A buyer takes a resource only in whole lots, so money stays a whole number. */
export interface Lot {
  units: number
  /** Whole euros paid per lot. */
  price: number
}

export interface BuyerDef {
  id: BuyerId
  lots: Partial<Record<ResourceId, Lot>>
}

/**
 * Bulk buyers for surplus the customers cannot take. MegaMeat pays about 10% of an ingredient's
 * value as vegan food (it becomes animal feed), the biogas plant about 5%. Only the biogas plant
 * also takes finished products.
 */
export const BUYERS: readonly BuyerDef[] = [
  {
    id: 'megaMeat',
    lots: {
      soybeans: { units: 10, price: 1 },
      wheat: { units: 8, price: 5 },
      oats: { units: 5, price: 3 },
      tofu: { units: 10, price: 3 },
      seitan: { units: 4, price: 5 },
      oatDrink: { units: 5, price: 6 },
    },
  },
  {
    id: 'biogas',
    lots: {
      soybeans: { units: 20, price: 1 },
      wheat: { units: 16, price: 5 },
      oats: { units: 10, price: 3 },
      tofu: { units: 20, price: 3 },
      seitan: { units: 8, price: 5 },
      oatDrink: { units: 10, price: 6 },
      tofuWurst: { units: 20, price: 3 },
      leverkas: { units: 4, price: 5 },
      haferCappuccino: { units: 5, price: 3 },
    },
  },
]

export const BUYER_IDS: readonly BuyerId[] = BUYERS.map((buyer) => buyer.id)

const BY_ID = new Map(BUYERS.map((buyer) => [buyer.id, buyer]))

export function getBuyer(id: BuyerId): BuyerDef {
  return BY_ID.get(id)!
}
