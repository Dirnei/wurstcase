import type { BuildingDef } from './buildings'

export const PROCESSORS: readonly BuildingDef[] = [
  {
    id: 'tofuPress',
    chain: 'soy',
    input: { resource: 'soybeans', ratio: 3 },
    output: 'tofu',
    rate: 0.5,
    basePrice: 25,
   
    unlockAt: 0,
  },
  {
    id: 'oatMill',
    chain: 'oat',
    input: { resource: 'oats', ratio: 2 },
    output: 'oatDrink',
    rate: 1 / 3,
    basePrice: 500,
   
    unlockAt: 30_000,
  },
  {
    id: 'seitanKitchen',
    chain: 'wheat',
    input: { resource: 'wheat', ratio: 2 },
    output: 'seitan',
    rate: 1 / 3,
    basePrice: 600,
   
    unlockAt: 140_000,
  },
]
