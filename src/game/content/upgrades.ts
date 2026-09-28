import type { AktionId } from './aktionen'
import type { SpeciesId } from './animals'
import { BUILDINGS, CHAINS, SET_GROWTH, setShare, type BuildingId, type ChainId } from './buildings'
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
  | 'sausageFiller'
  | 'oatFoamNozzle'
  | ChainMilestoneId

/** Copies of every building of a chain at which its chain milestone upgrade comes on offer. */
export const OWNED_MILESTONES = [25, 50, 100] as const

/** Output factor each milestone upgrade multiplies in. */
export const MILESTONE_FACTOR = 2

/** A chain milestone costs this many times the copies that complete it. */
export const MILESTONE_PRICE_MULTIPLE = 10

export type ChainMilestoneId = `${ChainId}Chain${(typeof OWNED_MILESTONES)[number]}`

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
  /** Whole units added to each run of a building that has an input; same input, same runs per second. */
  | { kind: 'yield'; building: BuildingId; add: number }
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

/** Rounds to two significant digits, so a buy button reads €1,900 rather than €1,882. */
function roundTwoDigits(value: number): number {
  const step = 10 ** Math.max(0, Math.floor(Math.log10(value)) - 1)
  return Math.round(value / step) * step
}

/**
 * One upgrade per chain and milestone: on offer once every building of the chain reaches the count,
 * it doubles the whole chain so its stages stay in balance. The price follows the buildings' own
 * price rule: the copies that complete the milestone, times the multiple.
 */
export const CHAIN_MILESTONES: readonly { chain: ChainId; at: number; upgrade: UpgradeDef }[] = CHAINS.flatMap((chain) => {
  const buildings = BUILDINGS.filter((building) => building.chain === chain)
  return OWNED_MILESTONES.map((at) => ({
    chain,
    at,
    upgrade: {
      id: `${chain}Chain${at}` as ChainMilestoneId,
      price: roundTwoDigits(
        // The multiple of what the milestone's last copies cost: base × set growth ^ ((at − 1) ÷ share).
        MILESTONE_PRICE_MULTIPLE *
          buildings.reduce((sum, b) => sum + b.basePrice * SET_GROWTH[chain] ** ((at - 1) / setShare(b.id)), 0),
      ),
      when: buildings.map((building) => ({ owned: building.id, atLeast: at })),
      effect: { kind: 'rate', buildings: buildings.map((building) => building.id), factor: MILESTONE_FACTOR },
    },
  }))
})

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
    effect: { kind: 'yield', building: 'tofuPress', add: 1 },
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
    effect: { kind: 'yield', building: 'seitanKitchen', add: 1 },
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
    effect: { kind: 'yield', building: 'leverkasOven', add: 1 },
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
    effect: { kind: 'yield', building: 'oatMill', add: 1 },
  },
  {
    id: 'sausageFiller',
    price: 400,
    when: [{ owned: 'tofuWurstKitchen', atLeast: 5 }],
    effect: { kind: 'yield', building: 'tofuWurstKitchen', add: 1 },
  },
  {
    id: 'oatFoamNozzle',
    price: 8_000,
    when: [{ owned: 'cafeBar', atLeast: 5 }],
    effect: { kind: 'yield', building: 'cafeBar', add: 1 },
  },
  ...CHAIN_MILESTONES.map((milestone) => milestone.upgrade),
]

export const UPGRADE_IDS: readonly UpgradeId[] = UPGRADES.map((upgrade) => upgrade.id)

const BY_ID = new Map(UPGRADES.map((upgrade) => [upgrade.id, upgrade]))

export function getUpgrade(id: UpgradeId): UpgradeDef {
  return BY_ID.get(id)!
}

export function isUpgradeId(value: unknown): value is UpgradeId {
  return typeof value === 'string' && BY_ID.has(value as UpgradeId)
}
