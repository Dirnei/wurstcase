export type ShelterId = 'stable' | 'pasture'

export interface ShelterDef {
  id: ShelterId
  /** Price in euros of the first one; later ones rise by the building price factor. */
  basePrice: number
  /** Total euros earned in this game at which the shelter can be built. */
  unlockAt: number
  /** Lebenshof space it adds. */
  space: number
}

/** Total euros earned in this game at which the Lebenshof panel appears. */
export const LEBENSHOF_UNLOCK_AT = 100

export const SHELTERS: readonly ShelterDef[] = [
  { id: 'stable', basePrice: 30, unlockAt: 100, space: 4 },
  { id: 'pasture', basePrice: 2000, unlockAt: 5000, space: 25 },
]

export const SHELTER_IDS: readonly ShelterId[] = SHELTERS.map((shelter) => shelter.id)

const BY_ID = new Map(SHELTERS.map((shelter) => [shelter.id, shelter]))

export function getShelter(id: ShelterId): ShelterDef {
  return BY_ID.get(id)!
}
