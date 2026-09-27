export type SpeciesId = 'chicken' | 'pig' | 'cow'

export interface SpeciesDef {
  id: SpeciesId
  /** Price in euros of the first animal of this species bought from MegaMeat. */
  basePrice: number
  /** Total euros earned in this game at which MegaMeat offers the species. */
  unlockAt: number
  /** Lebenshof space one animal needs. */
  space: number
  /** Awareness per second one animal produces. */
  awareness: number
}

/** Each rescue makes MegaMeat raise the next price of that species by this factor. */
export const PRICE_GROWTH_ANIMALS = 1.2

/** Names per species, the same in every language (keys animal.<species>.name.0 … 11). */
export const NAME_POOL_SIZE = 12

/** Species in order of price. */
export const SPECIES: readonly SpeciesDef[] = [
  { id: 'chicken', basePrice: 50, unlockAt: 100, space: 1, awareness: 1 },
  { id: 'pig', basePrice: 600, unlockAt: 1500, space: 4, awareness: 5 },
  { id: 'cow', basePrice: 4000, unlockAt: 5000, space: 10, awareness: 20 },
]

export const SPECIES_IDS: readonly SpeciesId[] = SPECIES.map((species) => species.id)

const BY_ID = new Map(SPECIES.map((species) => [species.id, species]))

export function getSpecies(id: SpeciesId): SpeciesDef {
  return BY_ID.get(id)!
}

export function isSpeciesId(value: unknown): value is SpeciesId {
  return typeof value === 'string' && BY_ID.has(value as SpeciesId)
}
