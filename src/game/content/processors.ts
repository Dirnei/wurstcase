import type { BuildingDef } from './buildings'

export const PROCESSORS: readonly BuildingDef[] = [
  {
    id: 'tofuPress',
    chain: 'soy',
    input: { resource: 'soybeans', ratio: 3 },
    output: 'tofu',
    rate: 0.5,
    basePrice: 25,
    priceGrowth: 1.13,
    unlockAt: 0,
  },
  {
    id: 'oatMill',
    chain: 'oat',
    input: { resource: 'oats', ratio: 2 },
    output: 'oatDrink',
    rate: 1,
    basePrice: 1000,
    priceGrowth: 1.11,
    unlockAt: 30_000,
  },
  {
    id: 'seitanKitchen',
    chain: 'wheat',
    input: { resource: 'wheat', ratio: 2 },
    output: 'seitan',
    rate: 0.5,
    basePrice: 1600,
    priceGrowth: 1.09,
    unlockAt: 140_000,
  },
]
