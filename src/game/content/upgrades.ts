import type { AktionId } from './aktionen'
import type { SpeciesId } from './animals'
import type { BuildingId } from './buildings'
import type { ProductId } from './resources'
import type { ShelterId } from './shelters'

export type UpgradeId =
  | 'strongHands'
  | 'mustard'
  | 'betterSeeds'
  | 'hydraulicPress'
  | 'moreStraw'
  | 'henPhotoShoot'
  | 'loyaltyCard'
  | 'instagram'
  | 'secondFarmer'
  | 'kneadingMachine'
  | 'leverkasRecipe'
  | 'negotiator'
  | 'pigInfluencer'
  | 'localNewspaper'
  | 'steamOven'
  | 'baristaCourse'
  | 'newMillstones'

/** One unlock condition; all of an upgrade's conditions must hold. Each can only go from false to true. */
export type UnlockClause =
  | { earned: number }
  | { owned: BuildingId; atLeast: number }
  | { shelters: ShelterId; atLeast: number }
  | { residents: SpeciesId | 'any'; atLeast: number }
  | { aktionRuns: AktionId; atLeast: number }

/** What an upgrade changes, on top of the base values in the other content. */
export type UpgradeEffect =
  | { kind: 'rate'; buildings: readonly BuildingId[]; factor: number }
  /** Units per manual click; a whole number. */
  | { kind: 'manual'; factor: number }
  /** Whole euros added to a product's price. */
  | { kind: 'price'; product: ProductId; add: number }
  | { kind: 'orders'; factor: number }
  | { kind: 'awareness'; species: SpeciesId; factor: number }
  | { kind: 'conversion'; factor: number }
  /** Whole space added to every shelter of the type. */
  | { kind: 'space'; shelter: ShelterId; add: number }
  | { kind: 'animalPrice'; factor: number }
  | { kind: 'aktionCost'; factor: number }

export interface UpgradeDef {
  id: UpgradeId
  /** Whole euros. */
  price: number
  when: readonly UnlockClause[]
  effect: UpgradeEffect
}

const FIELDS: readonly BuildingId[] = ['soybeanField', 'wheatField', 'oatField']

/** Act 1 one-time upgrades; starting values, tuned with the balancing page. */
export const UPGRADES: readonly UpgradeDef[] = [
  { id: 'strongHands', price: 40, when: [{ earned: 30 }], effect: { kind: 'manual', factor: 2 } },
  { id: 'mustard', price: 400, when: [{ earned: 500 }], effect: { kind: 'price', product: 'tofuWurst', add: 1 } },
  {
    id: 'betterSeeds',
    price: 150,
    when: [{ owned: 'soybeanField', atLeast: 5 }],
    effect: { kind: 'rate', buildings: ['soybeanField'], factor: 2 },
  },
  {
    id: 'hydraulicPress',
    price: 300,
    when: [{ owned: 'tofuPress', atLeast: 5 }],
    effect: { kind: 'rate', buildings: ['tofuPress'], factor: 2 },
  },
  { id: 'moreStraw', price: 500, when: [{ shelters: 'stable', atLeast: 3 }], effect: { kind: 'space', shelter: 'stable', add: 2 } },
  {
    id: 'henPhotoShoot',
    price: 800,
    when: [{ residents: 'chicken', atLeast: 5 }],
    effect: { kind: 'awareness', species: 'chicken', factor: 2 },
  },
  { id: 'loyaltyCard', price: 1_500, when: [{ earned: 2_000 }], effect: { kind: 'orders', factor: 1.5 } },
  { id: 'instagram', price: 2_000, when: [{ aktionRuns: 'flyer', atLeast: 3 }], effect: { kind: 'aktionCost', factor: 0.75 } },
  { id: 'secondFarmer', price: 2_500, when: [{ earned: 3_000 }], effect: { kind: 'rate', buildings: FIELDS, factor: 1.5 } },
  {
    id: 'kneadingMachine',
    price: 12_000,
    when: [{ owned: 'seitanKitchen', atLeast: 5 }],
    effect: { kind: 'rate', buildings: ['seitanKitchen'], factor: 2 },
  },
  {
    id: 'leverkasRecipe',
    price: 20_000,
    when: [{ owned: 'leverkasOven', atLeast: 1 }],
    effect: { kind: 'price', product: 'leverkas', add: 10 },
  },
  { id: 'negotiator', price: 5_000, when: [{ residents: 'any', atLeast: 10 }], effect: { kind: 'animalPrice', factor: 0.8 } },
  {
    id: 'pigInfluencer',
    price: 6_000,
    when: [{ residents: 'pig', atLeast: 3 }],
    effect: { kind: 'awareness', species: 'pig', factor: 2 },
  },
  { id: 'localNewspaper', price: 8_000, when: [{ earned: 10_000 }], effect: { kind: 'conversion', factor: 1.5 } },
  {
    id: 'steamOven',
    price: 40_000,
    when: [{ owned: 'leverkasOven', atLeast: 5 }],
    effect: { kind: 'rate', buildings: ['leverkasOven'], factor: 2 },
  },
  {
    id: 'baristaCourse',
    price: 4_000,
    when: [{ owned: 'cafeBar', atLeast: 3 }],
    effect: { kind: 'price', product: 'haferCappuccino', add: 4 },
  },
  {
    id: 'newMillstones',
    price: 6_000,
    when: [{ owned: 'oatMill', atLeast: 5 }],
    effect: { kind: 'rate', buildings: ['oatMill'], factor: 2 },
  },
]

export const UPGRADE_IDS: readonly UpgradeId[] = UPGRADES.map((upgrade) => upgrade.id)

const BY_ID = new Map(UPGRADES.map((upgrade) => [upgrade.id, upgrade]))

export function getUpgrade(id: UpgradeId): UpgradeDef {
  return BY_ID.get(id)!
}

export function isUpgradeId(value: unknown): value is UpgradeId {
  return typeof value === 'string' && BY_ID.has(value as UpgradeId)
}
