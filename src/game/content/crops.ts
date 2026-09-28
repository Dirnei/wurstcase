import type { BuildingDef } from './buildings'

export const FIELDS: readonly BuildingDef[] = [
  { id: 'soybeanField', chain: 'soy', output: 'soybeans', rate: 1, basePrice: 10, unlockAt: 0 },
  { id: 'oatField', chain: 'oat', output: 'oats', rate: 0.5, basePrice: 250, unlockAt: 30_000 },
  { id: 'wheatField', chain: 'wheat', output: 'wheat', rate: 0.5, basePrice: 400, unlockAt: 140_000 },
]
