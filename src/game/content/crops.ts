import type { BuildingDef } from './buildings'

export const FIELDS: readonly BuildingDef[] = [
  { id: 'soybeanField', chain: 'soy', output: 'soybeans', rate: 1, basePrice: 10, priceGrowth: 1.13, unlockAt: 0 },
  { id: 'oatField', chain: 'oat', output: 'oats', rate: 2, basePrice: 400, priceGrowth: 1.11, unlockAt: 30_000 },
  { id: 'wheatField', chain: 'wheat', output: 'wheat', rate: 1, basePrice: 600, priceGrowth: 1.09, unlockAt: 140_000 },
]
