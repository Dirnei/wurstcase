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

export const CHAINS: readonly ChainId[] = ['soy', 'wheat', 'oat']

export interface BuildingDef {
  id: BuildingId
  chain: ChainId
  output: ResourceId
  /** Units of input consumed per unit of output. Fields have no input. */
  input?: { resource: ResourceId; ratio: number }
  /** Output per second per building at full speed. */
  rate: number
  /** Price in euros of the first copy. */
  basePrice: number
  /** Total euros earned in this game at which the building becomes available. */
  unlockAt: number
}

/** All buildings in production order: fields, then processing, then kitchens. */
export const BUILDINGS: readonly BuildingDef[] = [...FIELDS, ...PROCESSORS, ...KITCHENS]

export const BUILDING_IDS: readonly BuildingId[] = BUILDINGS.map((building) => building.id)

const BY_ID = new Map(BUILDINGS.map((building) => [building.id, building]))

export function getBuilding(id: BuildingId): BuildingDef {
  return BY_ID.get(id)!
}
