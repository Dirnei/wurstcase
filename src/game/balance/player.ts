import { getSpecies, SPECIES, type SpeciesId } from '../content/animals'
import { BUILDINGS, CHAINS, type BuildingId, type ChainId } from '../content/buildings'
import { MANUAL_ACTIONS } from '../content/manual'
import { SHELTERS, type ShelterId } from '../content/shelters'
import { ASSISTANT } from '../content/town'
import type { GameState } from '../state'
import { buildingPrice, buyBuilding, canBuy, isUnlocked } from '../systems/buildings'
import { canPerform, isManualUnlocked, performManual } from '../systems/manual'
import {
  animalPrice,
  buildShelter,
  canBuildShelter,
  canRescue,
  isShelterUnlocked,
  isSpeciesOffered,
  rescue,
  shelterPrice,
  totalSpace,
  usedSpace,
} from '../systems/rescue'
import { canHireAssistant, canSell, hireAssistant, sell } from '../systems/sales'
import { steadyIncome } from './steady'
import { manualPass } from './value'

export interface Purchase {
  /** Game time in seconds. */
  time: number
  kind: 'building' | 'assistant' | 'shelter' | 'animal'
  id: string
  price: number
}

type Target = { kind: 'buildings'; pieces: BuildingId[] } | { kind: 'rescue'; species: SpeciesId }

export interface Player {
  clicksPerSecond: number
  clickCarry: number
  target: Target | null
}

/** Gains below this (€/s) count as no gain, so rounding noise never makes a purchase look useful. */
const MIN_GAIN = 1e-9

/** Names are irrelevant to balancing; always taking the first free one keeps runs deterministic. */
const NO_RANDOM = () => 0

export function createPlayer(clicksPerSecond: number): Player {
  return { clicksPerSecond, clickCarry: 0, target: null }
}

/** One decision step of the scripted player; the caller then advances the game with tick(). */
export function playerStep(player: Player, state: GameState, seconds: number, log: (p: Purchase) => void): void {
  click(player, state, seconds)
  if (!state.assistant && canSell(state)) {
    sell(state)
  }
  if (canHireAssistant(state)) {
    hireAssistant(state)
    log({ time: state.playTime, kind: 'assistant', id: 'assistant', price: ASSISTANT.price })
  }
  player.target ??= chooseTarget(state)
  if (player.target) {
    buyTowards(player, state, log)
  }
}

function click(player: Player, state: GameState, seconds: number): void {
  player.clickCarry += player.clicksPerSecond * seconds
  const chain = bestClickChain(state)
  while (player.clickCarry >= 1) {
    player.clickCarry -= 1
    if (chain) {
      clickChain(state, chain)
    }
  }
}

/** The chain whose whole manual pass is unlocked and earns the most per click. */
function bestClickChain(state: Readonly<GameState>): ChainId | null {
  let best: ChainId | null = null
  let bestValue = 0
  for (const chain of CHAINS) {
    const actions = MANUAL_ACTIONS.filter((action) => action.chain === chain)
    if (!actions.every((action) => isManualUnlocked(state, action.id))) {
      continue
    }
    const { clicks, euros } = manualPass(chain)
    if (euros / clicks > bestValue) {
      best = chain
      bestValue = euros / clicks
    }
  }
  return best
}

/** Takes the furthest step of the chain that has its input, else harvests. */
function clickChain(state: GameState, chain: ChainId): void {
  const actions = MANUAL_ACTIONS.filter((action) => action.chain === chain)
  for (const action of [...actions].reverse()) {
    if (canPerform(state, action.id)) {
      performManual(state, action.id)
      return
    }
  }
}

function chooseTarget(state: Readonly<GameState>): Target | null {
  const customers = state.customers.toNumber()
  const before = steadyIncome(state.buildings, customers)
  const unlocked = BUILDINGS.filter((building) => isUnlocked(state, building.id)).map((b) => b.id)
  const candidates: BuildingId[][] = unlocked.map((id) => [id])
  for (const chain of CHAINS) {
    const bundle = unlocked.filter((id) => BUILDINGS.find((b) => b.id === id)!.chain === chain)
    if (bundle.length > 1) {
      candidates.push(bundle)
    }
  }

  let best: BuildingId[] | null = null
  let bestScore = Infinity
  for (const pieces of candidates) {
    const after = { ...state.buildings }
    let price = 0
    for (const id of pieces) {
      after[id] += 1
      price += buildingPrice(state, id).toNumber()
    }
    const gain = steadyIncome(after, customers) - before
    if (gain > MIN_GAIN && price / gain < bestScore) {
      best = pieces
      bestScore = price / gain
    }
  }
  if (best) {
    return { kind: 'buildings', pieces: [...best] }
  }
  const species = bestSpecies(state)
  return species ? { kind: 'rescue', species } : null
}

/** The offered species with the most awareness per euro. */
function bestSpecies(state: Readonly<GameState>): SpeciesId | null {
  let best: SpeciesId | null = null
  let bestValue = 0
  for (const species of SPECIES) {
    if (!isSpeciesOffered(state, species.id)) {
      continue
    }
    const value = species.awareness / animalPrice(state, species.id).toNumber()
    if (value > bestValue) {
      best = species.id
      bestValue = value
    }
  }
  return best
}

/** The unlocked shelter with the lowest price per space. */
function bestShelter(state: Readonly<GameState>): ShelterId | null {
  let best: ShelterId | null = null
  let bestValue = Infinity
  for (const shelter of SHELTERS) {
    if (!isShelterUnlocked(state, shelter.id)) {
      continue
    }
    const value = shelterPrice(state, shelter.id).toNumber() / shelter.space
    if (value < bestValue) {
      best = shelter.id
      bestValue = value
    }
  }
  return best
}

function buyTowards(player: Player, state: GameState, log: (p: Purchase) => void): void {
  const target = player.target!
  if (target.kind === 'buildings') {
    // Cheapest piece first, as long as money allows.
    for (;;) {
      const next = [...target.pieces].sort(
        (a, b) => buildingPrice(state, a).toNumber() - buildingPrice(state, b).toNumber(),
      )[0]
      if (next === undefined || !canBuy(state, next)) {
        break
      }
      const price = buildingPrice(state, next).toNumber()
      buyBuilding(state, next)
      log({ time: state.playTime, kind: 'building', id: next, price })
      target.pieces.splice(target.pieces.indexOf(next), 1)
    }
    if (target.pieces.length === 0) {
      player.target = null
    }
    return
  }

  const { species } = target
  if (totalSpace(state) - usedSpace(state) < getSpecies(species).space) {
    const shelter = bestShelter(state)
    if (shelter && canBuildShelter(state, shelter)) {
      const price = shelterPrice(state, shelter).toNumber()
      buildShelter(state, shelter)
      log({ time: state.playTime, kind: 'shelter', id: shelter, price })
    }
    return
  }
  if (canRescue(state, species) === 'ok') {
    const price = animalPrice(state, species).toNumber()
    rescue(state, species, NO_RANDOM)
    log({ time: state.playTime, kind: 'animal', id: species, price })
    player.target = null
  }
}
