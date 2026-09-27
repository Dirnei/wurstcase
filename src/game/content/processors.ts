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
    id: 'seitanKitchen',
    chain: 'wheat',
    input: { resource: 'wheat', ratio: 2 },
    output: 'seitan',
    rate: 0.5,
    basePrice: 400,
    unlockAt: 200,
  },
  {
    id: 'oatMill',
    chain: 'oat',
    input: { resource: 'oats', ratio: 2 },
    output: 'oatDrink',
    rate: 1,
    basePrice: 6000,
    unlockAt: 5000,
  },
]
