import { getSpecies, SPECIES, type SpeciesId } from '../content/animals'
import { BUILDINGS, CHAINS, type BuildingId, type ChainId } from '../content/buildings'
import { MANUAL_ACTIONS } from '../content/manual'
import { PRODUCTS, RESOURCES } from '../content/resources'
import { SHELTERS, type ShelterId } from '../content/shelters'
import { getUpgrade, type UpgradeEffect, type UpgradeId } from '../content/upgrades'
import { ASSISTANT, CONVERSION_PER_AWARENESS, ORDERS_PER_CUSTOMER, POPULATION } from '../content/town'
import type { GameState } from '../state'
import { buildingPrice, buyBuilding, canBuy, isUnlocked } from '../systems/buildings'
import { bestBuyer, bulkSell } from '../systems/bulkSales'
import { canPerform, isManualUnlocked, performManual } from '../systems/manual'
import { outputFactor } from '../systems/ownedMilestones'
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
import { canHireAssistant, canSell, hireAssistant, orderRate, sell } from '../systems/sales'
import {
  awarenessFactor,
  buyUpgrade,
  canBuyUpgrade,
  conversionFactor,
  offeredUpgrades,
  ordersFactor,
  productPrice,
  productsByPrice,
  spaceBonus,
} from '../systems/upgrades'
import { steadyIncome, steadyOutput, usedOutput } from './steady'
import { chainBuildings, manualPass } from './value'

export interface Purchase {
  /** Game time in seconds. */
  time: number
  kind: 'building' | 'assistant' | 'shelter' | 'animal' | 'upgrade'
  id: string
  price: number
}

type Target =
  | { kind: 'buildings'; pieces: BuildingId[] }
  | { kind: 'upgrade'; id: UpgradeId }
  | { kind: 'rescue'; species: SpeciesId }

export interface Player {
  clicksPerSecond: number
  clickCarry: number
  /** Game seconds since the surplus was last sold in bulk. */
  sinceBulkSale: number
  target: Target | null
}

/** Gains below this (€/s) count as no gain, so rounding noise never makes a purchase look useful. */
const MIN_GAIN = 1e-9

/** Names are irrelevant to balancing; always taking the first free one keeps runs deterministic. */
const NO_RANDOM = () => 0

/** Upgrades that change income, and so are scored like buildings. */
const INCOME_EFFECTS: readonly UpgradeEffect['kind'][] = ['rate', 'price', 'orders']

/** Other upgrades are bought when they cost at most this many seconds of income. */
const CHEAP_UPGRADE_SECONDS = 300

/** A rescue is scored by what the customers it converts within this many seconds add to income. */
const RESCUE_HORIZON_SECONDS = 600

/** How often the player sells surplus in bulk, and how many seconds of use or orders it keeps. */
const BULK_SALE_EVERY_SECONDS = 10
const BULK_KEEP_SECONDS = 30

export function createPlayer(clicksPerSecond: number): Player {
  return { clicksPerSecond, clickCarry: 0, sinceBulkSale: 0, target: null }
}

/** One decision step of the scripted player; the caller then advances the game with tick(). */
export function playerStep(player: Player, state: GameState, seconds: number, log: (p: Purchase) => void): void {
  click(player, state, seconds)
  if (!state.assistant && canSell(state)) {
    sell(state)
  }
  player.sinceBulkSale += seconds
  if (player.sinceBulkSale >= BULK_SALE_EVERY_SECONDS - 1e-9) {
    player.sinceBulkSale = 0
    sellSurplus(state)
  }
  if (canHireAssistant(state)) {
    hireAssistant(state)
    log({ time: state.playTime, kind: 'assistant', id: 'assistant', price: ASSISTANT.price })
  }
  if (!player.target) {
    buyCheapUpgrades(state, log)
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

/**
 * Sells each resource's stock beyond what its buildings use (for products: what customers order)
 * in the next 30 seconds, to the best-paying buyer that costs no customers: the player plays for
 * customers, who buy on their own. The game sells whole stocks
 * only, so the kept part is set aside for the sale and put back after it.
 */
function sellSurplus(state: GameState): void {
  const perSecond: Partial<Record<string, number>> = {}
  for (const building of BUILDINGS) {
    if (building.input) {
      const use = state.buildings[building.id] * building.rate * outputFactor(state, building.id) * building.input.ratio
      perSecond[building.input.resource] = (perSecond[building.input.resource] ?? 0) + use
    }
  }
  const orders = orderRate(state).toNumber()
  for (const resource of RESOURCES) {
    const best = bestBuyer(resource, { withoutFeedCost: true })
    if (!best) {
      continue
    }
    const isProduct = (PRODUCTS as readonly string[]).includes(resource)
    const keep = Math.ceil(BULK_KEEP_SECONDS * (isProduct ? orders : (perSecond[resource] ?? 0)))
    const stock = state.stock[resource]
    if (stock.lte(keep)) {
      continue
    }
    state.stock[resource] = stock.sub(keep)
    bulkSell(state, best.buyer, resource)
    state.stock[resource] = state.stock[resource].add(keep)
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

/** Income per second the player can count on: the steady model, or the average so far while clicking. */
function incomeEstimate(state: Readonly<GameState>): number {
  const average = state.playTime > 0 ? state.totalEarned.toNumber() / state.playTime : 0
  return Math.max(steadyIncome(state.buildings, state.customers.toNumber(), state.upgrades), average)
}

/** Buys upgrades without an income effect once they cost no more than a few minutes of income. */
function buyCheapUpgrades(state: GameState, log: (p: Purchase) => void): void {
  for (const upgrade of offeredUpgrades(state)) {
    if (INCOME_EFFECTS.includes(upgrade.effect.kind)) {
      continue
    }
    if (upgrade.price <= incomeEstimate(state) * CHEAP_UPGRADE_SECONDS && canBuyUpgrade(state, upgrade.id)) {
      buyUpgrade(state, upgrade.id)
      log({ time: state.playTime, kind: 'upgrade', id: upgrade.id, price: upgrade.price })
    }
  }
}

function chooseTarget(state: Readonly<GameState>): Target | null {
  const customers = state.customers.toNumber()
  const before = steadyIncome(state.buildings, customers, state.upgrades)
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
    const gain = steadyIncome(after, customers, state.upgrades) - before
    if (gain > MIN_GAIN && price / gain < bestScore) {
      best = pieces
      bestScore = price / gain
    }
  }
  let bestUpgrade: UpgradeId | null = null
  for (const upgrade of offeredUpgrades(state)) {
    if (!INCOME_EFFECTS.includes(upgrade.effect.kind)) {
      continue
    }
    const gain = steadyIncome(state.buildings, customers, [...state.upgrades, upgrade.id]) - before
    if (gain > MIN_GAIN && upgrade.price / gain < bestScore) {
      bestUpgrade = upgrade.id
      bestScore = upgrade.price / gain
    }
  }
  const rescue = rescueScore(state)
  if (rescue && rescue.score < bestScore) {
    return { kind: 'rescue', species: rescue.species }
  }
  if (bestUpgrade) {
    return { kind: 'upgrade', id: bestUpgrade }
  }
  if (best) {
    return { kind: 'buildings', pieces: [...best] }
  }
  const species = bestSpecies(state)
  return species ? { kind: 'rescue', species } : null
}

/** Finished products per second that the customers do not order, at steady state. */
function productSurplus(state: Readonly<GameState>): number {
  const flow = steadyOutput(state.buildings, state.upgrades)
  const made = PRODUCTS.reduce((sum, product) => sum + (flow[product] ?? 0), 0)
  return Math.max(0, made - orderRate(state).toNumber())
}

/**
 * How the player would serve new orders: the dearest product whose whole chain is unlocked, and
 * what the buildings for that many more units per second cost at today's prices. It walks back
 * from the kitchen and stops at the first stage whose input is already made in surplus.
 */
function servingChain(
  state: Readonly<GameState>,
  units: number,
): { price: number; cost: number } | null {
  for (const product of productsByPrice(state)) {
    const chain = BUILDINGS.find((building) => building.output === product)!.chain
    const stages = chainBuildings(chain)
    if (!stages.every((building) => isUnlocked(state, building.id))) {
      continue
    }
    const flow = steadyOutput(state.buildings, state.upgrades)
    const used = usedOutput(flow)
    let need = units
    let cost = 0
    for (const building of [...stages].reverse()) {
      cost += (need / (building.rate * outputFactor(state, building.id))) * buildingPrice(state, building.id).toNumber()
      if (!building.input) {
        break
      }
      const { resource, ratio } = building.input
      const spare = Math.max(0, (flow[resource] ?? 0) - (used[resource] ?? 0))
      need = Math.max(0, need * ratio - spare)
      if (need === 0) {
        break
      }
    }
    return { price: productPrice(state, product), cost }
  }
  return null
}

/**
 * Payback of the best rescue, bought together with the production its new customers need. The
 * customers it converts within the horizon first take the products now going to the biogas plant;
 * orders beyond that need new chain capacity, which is added to the price.
 */
function rescueScore(state: Readonly<GameState>): { species: SpeciesId; score: number } | null {
  const species = bestSpecies(state)
  if (!species) {
    return null
  }
  const customers = state.customers.toNumber()
  const share = Math.max(0, 1 - customers / POPULATION)
  const converted =
    CONVERSION_PER_AWARENESS *
    conversionFactor(state) *
    getSpecies(species).awareness *
    awarenessFactor(state, species) *
    share *
    RESCUE_HORIZON_SECONDS
  const orders = converted * ORDERS_PER_CUSTOMER * ordersFactor(state)
  const before = steadyIncome(state.buildings, customers, state.upgrades)
  const fromSurplus = steadyIncome(state.buildings, customers + converted, state.upgrades) - before
  const unserved = Math.max(0, orders - productSurplus(state))
  const serving = servingChain(state, unserved)
  if (!serving) {
    return null
  }
  const gain = fromSurplus + unserved * serving.price
  if (gain <= MIN_GAIN) {
    return null
  }
  let price = animalPrice(state, species).toNumber() + serving.cost
  if (totalSpace(state) - usedSpace(state) < getSpecies(species).space) {
    const shelter = bestShelter(state)
    if (!shelter) {
      return null
    }
    price += shelterPrice(state, shelter).toNumber()
  }
  return { species, score: price / gain }
}

/** The offered species with the most awareness per euro. */
function bestSpecies(state: Readonly<GameState>): SpeciesId | null {
  let best: SpeciesId | null = null
  let bestValue = 0
  for (const species of SPECIES) {
    if (!isSpeciesOffered(state, species.id)) {
      continue
    }
    const value = (species.awareness * awarenessFactor(state, species.id)) / animalPrice(state, species.id).toNumber()
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
    const value = shelterPrice(state, shelter.id).toNumber() / (shelter.space + spaceBonus(state, shelter.id))
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

  if (target.kind === 'upgrade') {
    if (canBuyUpgrade(state, target.id)) {
      buyUpgrade(state, target.id)
      log({ time: state.playTime, kind: 'upgrade', id: target.id, price: getUpgrade(target.id).price })
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
