import { FIELDS } from './crops'
import { PROCESSORS } from './processors'
import { KITCHENS } from './products'
import type { ResourceId } from './resources'

export type BuildingId =
  | 'soybeanField'
  | 'tofuPress'
  | 'tofuWurstKitchen'
  | 'wheatField'
  | 'seitanKitchen'
  | 'leverkasOven'
  | 'oatField'
  | 'oatMill'
  | 'cafeBar'

export type ChainId = 'soy' | 'wheat' | 'oat'

/** Chains in unlock order; each later chain sells for more per order. */
export const CHAINS: readonly ChainId[] = ['soy', 'oat', 'wheat']

/**
 * How much every price in a chain grows per balanced set owned. Later chains grow more slowly, so
 * each starts as a worse deal and overtakes the one before, whatever number of copies a set needs.
 */
export const SET_GROWTH: Readonly<Record<ChainId, number>> = { soy: 1.13, oat: 1.07, wheat: 1.06 }

export interface BuildingDef {
  id: BuildingId
  chain: ChainId
  output: ResourceId
  /** Units of input each run takes. Fields have no input. */
  input?: { resource: ResourceId; ratio: number }
  /** Runs per second per building at full speed; a run makes 1 unit, more with yield upgrades. */
  rate: number
  /** Price in euros of the first copy; each set owned multiplies it by the chain's set growth. */
  basePrice: number
  /** Total euros earned in this game at which the building becomes available. */
  unlockAt: number
}

/** All buildings in production order: fields, then processing, then kitchens. */
export const BUILDINGS: readonly BuildingDef[] = [...FIELDS, ...PROCESSORS, ...KITCHENS]

export const BUILDING_IDS: readonly BuildingId[] = BUILDINGS.map((building) => building.id)

/** Each chain's resources in production order (raw ingredient, intermediate, product), in chain order. */
export const CHAIN_RESOURCES: readonly { chain: ChainId; resources: readonly ResourceId[] }[] = CHAINS.map((chain) => ({
  chain,
  resources: BUILDINGS.filter((building) => building.chain === chain).map((building) => building.output),
}))

const BY_ID = new Map(BUILDINGS.map((building) => [building.id, building]))

export function getBuilding(id: BuildingId): BuildingDef {
  return BY_ID.get(id)!
}

/**
 * A building's share of a balanced set: how many of it one product building of its chain needs to
 * run without stalls or surplus at base values. Walks back from the product building along the
 * chain, so it follows the rates and recipes and never goes stale.
 */
const SHARES: ReadonlyMap<BuildingId, number> = new Map(
  CHAIN_RESOURCES.flatMap(({ resources }) => {
    const steps = resources.map((resource) => BUILDINGS.find((building) => building.output === resource)!)
    const shares = [1]
    for (let i = steps.length - 1; i > 0; i--) {
      shares.unshift((shares[0] * steps[i].rate * steps[i].input!.ratio) / steps[i - 1].rate)
    }
    return steps.map((step, i) => [step.id, shares[i]] as const)
  }),
)

export function setShare(id: BuildingId): number {
  return SHARES.get(id)!
}
