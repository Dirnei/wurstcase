import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { NAME_POOL_SIZE, type SpeciesId } from '../content/animals'
import { createInitialState, type GameState } from '../state'
import {
  animalPrice,
  buildShelter,
  canBuildShelter,
  canRescue,
  displayNames,
  isLebenshofUnlocked,
  isSpeciesOffered,
  pickName,
  rescue,
  shelterPrice,
  totalSpace,
  usedSpace,
} from './rescue'

function withMoney(money: number, earned = money): GameState {
  return { ...createInitialState(), money: new Decimal(money), totalEarned: new Decimal(earned) }
}

function withResidents(species: SpeciesId, count: number, state = createInitialState()): GameState {
  for (let i = 0; i < count; i++) {
    state.residents.push({ species, name: i % NAME_POOL_SIZE })
  }
  return state
}

/** A random source that always picks the first candidate. */
const first = () => 0

describe('isLebenshofUnlocked', () => {
  it('is hidden below €100 earned and stays shown after spending', () => {
    expect(isLebenshofUnlocked(withMoney(99))).toBe(false)
    const state = withMoney(100)
    expect(isLebenshofUnlocked(state)).toBe(true)
    buildShelter(state, 'stable')
    expect(state.money.lt(100)).toBe(true)
    expect(isLebenshofUnlocked(state)).toBe(true)
  })

  it('starts with 0 of 0 space', () => {
    const state = withMoney(100)
    expect(usedSpace(state)).toBe(0)
    expect(totalSpace(state)).toBe(0)
  })
})

describe('isSpeciesOffered', () => {
  it('offers only chickens at €1,000 earned', () => {
    const state = withMoney(0, 1000)
    expect(isSpeciesOffered(state, 'chicken')).toBe(true)
    expect(isSpeciesOffered(state, 'pig')).toBe(false)
    expect(isSpeciesOffered(state, 'cow')).toBe(false)
  })

  it('offers all three species at €5,000 earned', () => {
    const state = withMoney(0, 5000)
    expect(isSpeciesOffered(state, 'chicken')).toBe(true)
    expect(isSpeciesOffered(state, 'pig')).toBe(true)
    expect(isSpeciesOffered(state, 'cow')).toBe(true)
  })
})

describe('animalPrice', () => {
  it('rises by 20% per animal of the species, rounded up', () => {
    expect(animalPrice(withResidents('chicken', 2), 'chicken').toNumber()).toBe(72)
  })

  it('prices each species separately', () => {
    expect(animalPrice(withResidents('chicken', 5), 'pig').toNumber()).toBe(600)
  })
})

describe('shelters', () => {
  it('builds a stable for its price and adds 4 space', () => {
    const state = withMoney(40, 100)
    expect(canBuildShelter(state, 'stable')).toBe(true)
    expect(buildShelter(state, 'stable')).toBe(true)
    expect(state.money.toNumber()).toBe(10)
    expect(state.shelters.stable).toBe(1)
    expect(totalSpace(state)).toBe(4)
    expect(usedSpace(state)).toBe(0)
  })

  it('prices the second stable at €33', () => {
    const state = createInitialState()
    state.shelters.stable = 1
    expect(shelterPrice(state, 'stable').toNumber()).toBe(33)
  })

  it('refuses a locked shelter or one the player cannot afford', () => {
    expect(canBuildShelter(withMoney(10_000, 4999), 'pasture')).toBe(false)
    expect(canBuildShelter(withMoney(29, 100), 'stable')).toBe(false)
    const state = withMoney(29, 100)
    expect(buildShelter(state, 'stable')).toBe(false)
    expect(state.shelters.stable).toBe(0)
    expect(state.money.toNumber()).toBe(29)
  })

  it('does not touch total earnings', () => {
    const state = withMoney(40, 100)
    expect(buildShelter(state, 'stable')).toBe(true)
    expect(state.totalEarned.toNumber()).toBe(100)
  })
})

describe('rescue', () => {
  it('rescues the first chicken into a stable', () => {
    const state = withMoney(60, 100)
    state.shelters.stable = 1
    expect(canRescue(state, 'chicken')).toBe('ok')
    expect(rescue(state, 'chicken', first)).toBe(true)
    expect(state.money.toNumber()).toBe(10)
    expect(state.residents).toHaveLength(1)
    expect(state.residents[0].species).toBe('chicken')
    expect(usedSpace(state)).toBe(1)
    expect(totalSpace(state)).toBe(4)
    expect(state.totalEarned.toNumber()).toBe(100)
  })

  it('reports lacking space for a pig next to a chicken in one stable', () => {
    const state = withResidents('chicken', 1, withMoney(1000, 1500))
    state.shelters.stable = 1
    expect(canRescue(state, 'pig')).toBe('space')
    expect(rescue(state, 'pig', first)).toBe(false)
    expect(state.residents).toHaveLength(1)
    expect(state.money.toNumber()).toBe(1000)
  })

  it('reports lacking money when there is space', () => {
    const state = withMoney(49, 100)
    state.shelters.stable = 1
    expect(canRescue(state, 'chicken')).toBe('money')
  })

  it('reports money first when both are lacking', () => {
    expect(canRescue(withMoney(0, 100), 'chicken')).toBe('money')
  })

  it('refuses a species that is not offered', () => {
    const state = withMoney(10_000, 1000)
    state.shelters.stable = 5
    expect(canRescue(state, 'cow')).toBe('locked')
    expect(rescue(state, 'cow', first)).toBe(false)
  })
})

describe('names', () => {
  /** Rescues chickens with plenty of money and space, using the given random source. */
  function rescueChickens(count: number, random: () => number): GameState {
    const state = withMoney(1e30, 100)
    state.shelters.stable = 1000
    for (let i = 0; i < count; i++) {
      rescue(state, 'chicken', random)
    }
    return state
  }

  it('gives the whole pool before repeating a name', () => {
    const state = rescueChickens(NAME_POOL_SIZE, Math.random)
    expect(new Set(state.residents.map((r) => r.name)).size).toBe(NAME_POOL_SIZE)
  })

  it('numbers a repeated name', () => {
    const state = rescueChickens(NAME_POOL_SIZE + 1, first)
    const repeated = state.residents[NAME_POOL_SIZE].name
    const names = displayNames(state.residents, (_, index) => `Name${index}`)
    const shown = names.filter((n) => n.resident.name === repeated).map((n) => n.label)
    expect(shown).toEqual([`Name${repeated}`, `Name${repeated} 2`])
  })

  it('starts the third round only after every name is used twice', () => {
    const state = rescueChickens(NAME_POOL_SIZE * 2, () => 0.999)
    const counts = new Map<number, number>()
    for (const resident of state.residents) {
      counts.set(resident.name, (counts.get(resident.name) ?? 0) + 1)
    }
    expect([...counts.values()].every((count) => count === 2)).toBe(true)
    expect(counts.size).toBe(NAME_POOL_SIZE)
  })

  it('keeps a separate pool per species', () => {
    const state = createInitialState()
    withResidents('chicken', NAME_POOL_SIZE, state)
    expect(pickName(state, 'pig', first)).toBe(0)
  })

  it('uses the random source to choose among unused names', () => {
    const state = createInitialState()
    expect(pickName(state, 'cow', () => 0.5)).toBe(6)
  })
})

describe('upgrade effects on the Lebenshof', () => {
  it('adds space to every stable with more straw', () => {
    const state = createInitialState()
    state.shelters.stable = 2
    state.upgrades = ['moreStraw']
    expect(totalSpace(state)).toBe(12)
  })

  it('makes MegaMeat cheaper with the tough negotiator', () => {
    const state = createInitialState()
    state.upgrades = ['negotiator']
    expect(animalPrice(state, 'chicken').toNumber()).toBe(40)
  })
})
