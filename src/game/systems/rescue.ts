import Decimal from 'break_eternity.js'
import { getSpecies, NAME_POOL_SIZE, PRICE_GROWTH_ANIMALS, type SpeciesId } from '../content/animals'
import { getShelter, LEBENSHOF_UNLOCK_AT, SHELTERS, type ShelterId } from '../content/shelters'
import type { GameState, Resident } from '../state'
import { PRICE_GROWTH } from './buildings'
import { animalPriceFactor, spaceBonus } from './upgrades'

/** Why a rescue is possible or not; money is reported before space when both are short. */
export type RescueCheck = 'ok' | 'locked' | 'money' | 'space'

/** Unlocks follow lifetime earnings, so spending money never hides the Lebenshof again. */
export function isLebenshofUnlocked(state: Readonly<GameState>): boolean {
  return state.totalEarned.gte(LEBENSHOF_UNLOCK_AT)
}

export function isSpeciesOffered(state: Readonly<GameState>, species: SpeciesId): boolean {
  return state.totalEarned.gte(getSpecies(species).unlockAt)
}

export function isShelterUnlocked(state: Readonly<GameState>, shelter: ShelterId): boolean {
  return state.totalEarned.gte(getShelter(shelter).unlockAt)
}

export function countOf(state: Readonly<GameState>, species: SpeciesId): number {
  return state.residents.filter((resident) => resident.species === species).length
}

/** MegaMeat raises the price with every animal of the species it sells. Whole euros. */
export function animalPrice(state: Readonly<GameState>, species: SpeciesId): Decimal {
  return new Decimal(getSpecies(species).basePrice)
    .mul(Decimal.pow(PRICE_GROWTH_ANIMALS, countOf(state, species)))
    .mul(animalPriceFactor(state))
    .ceil()
}

/** Shelters rise by the same factor as buildings. Whole euros. */
export function shelterPrice(state: Readonly<GameState>, shelter: ShelterId): Decimal {
  return new Decimal(getShelter(shelter).basePrice)
    .mul(Decimal.pow(PRICE_GROWTH, state.shelters[shelter]))
    .ceil()
}

export function totalSpace(state: Readonly<GameState>): number {
  return SHELTERS.reduce(
    (sum, shelter) => sum + state.shelters[shelter.id] * (shelter.space + spaceBonus(state, shelter.id)),
    0,
  )
}

export function usedSpace(state: Readonly<GameState>): number {
  return state.residents.reduce((sum, resident) => sum + getSpecies(resident.species).space, 0)
}

export function canBuildShelter(state: Readonly<GameState>, shelter: ShelterId): boolean {
  return isShelterUnlocked(state, shelter) && state.money.gte(shelterPrice(state, shelter))
}

export function buildShelter(state: GameState, shelter: ShelterId): boolean {
  if (!canBuildShelter(state, shelter)) {
    return false
  }
  state.money = state.money.sub(shelterPrice(state, shelter))
  state.shelters[shelter] += 1
  return true
}

export function canRescue(state: Readonly<GameState>, species: SpeciesId): RescueCheck {
  if (!isSpeciesOffered(state, species)) {
    return 'locked'
  }
  if (state.money.lt(animalPrice(state, species))) {
    return 'money'
  }
  if (totalSpace(state) - usedSpace(state) < getSpecies(species).space) {
    return 'space'
  }
  return 'ok'
}

/** Buys an animal out of MegaMeat. The only place residents are ever added; nothing removes them. */
export function rescue(state: GameState, species: SpeciesId, random: () => number = Math.random): boolean {
  if (canRescue(state, species) !== 'ok') {
    return false
  }
  state.money = state.money.sub(animalPrice(state, species))
  state.residents.push({ species, name: pickName(state, species, random) })
  return true
}

/**
 * A random name index among the least-used names of the species, so no name repeats until the
 * whole pool is in use, and a third round starts only after every name has been used twice.
 */
export function pickName(state: Readonly<GameState>, species: SpeciesId, random: () => number = Math.random): number {
  const uses = new Array<number>(NAME_POOL_SIZE).fill(0)
  for (const resident of state.residents) {
    if (resident.species === species) {
      uses[resident.name] += 1
    }
  }
  const fewest = Math.min(...uses)
  const candidates = uses.flatMap((count, index) => (count === fewest ? [index] : []))
  return candidates[Math.min(Math.floor(random() * candidates.length), candidates.length - 1)]
}

export interface NamedResident {
  resident: Resident
  label: string
}

/** Labels residents in rescue order; the second and later animal with the same name get "2", "3" … */
export function displayNames(
  residents: readonly Resident[],
  nameOf: (species: SpeciesId, index: number) => string,
): NamedResident[] {
  const seen = new Map<string, number>()
  return residents.map((resident) => {
    const key = `${resident.species}:${resident.name}`
    const count = (seen.get(key) ?? 0) + 1
    seen.set(key, count)
    const name = nameOf(resident.species, resident.name)
    return { resident, label: count > 1 ? `${name} ${count}` : name }
  })
}
