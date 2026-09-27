import type { BuildingDef } from './buildings'

export const FIELDS: readonly BuildingDef[] = [
  { id: 'soybeanField', chain: 'soy', output: 'soybeans', rate: 1, basePrice: 10, unlockAt: 0 },
  { id: 'wheatField', chain: 'wheat', output: 'wheat', rate: 1, basePrice: 150, unlockAt: 200 },
  { id: 'oatField', chain: 'oat', output: 'oats', rate: 2, basePrice: 2500, unlockAt: 5000 },
]
