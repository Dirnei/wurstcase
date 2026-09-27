import type { BuildingDef } from './buildings'
import type { ProductId } from './resources'

/** Euros earned per unit sold. Leverkas is the Act 1 premium product. */
export const PRODUCT_PRICES: Readonly<Record<ProductId, number>> = {
  tofuWurst: 3,
  haferCappuccino: 12,
  leverkas: 25,
}

export const KITCHENS: readonly BuildingDef[] = [
  {
    id: 'tofuWurstKitchen',
    chain: 'soy',
    input: { resource: 'tofu', ratio: 1 },
    output: 'tofuWurst',
    rate: 0.5,
    basePrice: 40,
    unlockAt: 0,
  },
  {
    id: 'leverkasOven',
    chain: 'wheat',
    input: { resource: 'seitan', ratio: 2 },
    output: 'leverkas',
    rate: 0.25,
    basePrice: 1000,
    unlockAt: 1500,
  },
  {
    id: 'cafeBar',
    chain: 'oat',
    input: { resource: 'oatDrink', ratio: 1 },
    output: 'haferCappuccino',
    rate: 0.5,
    basePrice: 12000,
    unlockAt: 5000,
  },
]
