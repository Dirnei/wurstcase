import { getSpecies, SPECIES, type SpeciesId } from '../content/animals'
import { BUILDINGS, CHAINS, type BuildingId, type ChainId } from '../content/buildings'
import { MANUAL_ACTIONS } from '../content/manual'
import { PRODUCTS, RAW, RESOURCES } from '../content/resources'
import { SHELTERS, type ShelterId } from '../content/shelters'
import { getUpgrade, type UpgradeEffect, type UpgradeId } from '../content/upgrades'
import { AKTIONEN } from '../content/aktionen'
import { ASSISTANT, demandRate, POPULATION } from '../content/town'
import type { GameState } from '../state'
import { buildingPrice, buyBuilding, canBuy, isUnlocked } from '../systems/buildings'
import type { BuyerId } from '../content/buyers'
import { aktionCost, aktionEstimate, canRun, isAktionOffered, runAktion } from '../systems/aktionen'
import { bestBuyer, bulkSell, hasLot, scandalFactor, unitPrice } from '../systems/bulkSales'
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
import { canHireAssistant, canSell, hireAssistant, orderRate, sell } from '../systems/sales'
import { canExpand, expandStoreroom, expansionPrice } from '../systems/storeroom'
import {
  awarenessFactor,
  buyUpgrade,
  canBuyUpgrade,
  offeredUpgrades,
  ordersFactor,
  productPrice,
  productsByPrice,
  rateFactor,
  spaceBonus,
  yieldPerRun,
} from '../systems/upgrades'
import { steadyIncome, steadyOutput, usedOutput } from './steady'
import { chainBuildings, manualPass } from './value'

export interface Purchase {
  /** Game time in seconds. */
  time: number
  /** For an `aktion`, the price is in awareness points, not euros. */
  kind: 'building' | 'assistant' | 'shelter' | 'animal' | 'upgrade' | 'storeroom' | 'aktion'
  id: string
  price: number
}

type Target =
  | { kind: 'buildings'; pieces: BuildingId[] }
  | { kind: 'upgrade'; id: UpgradeId }
  | { kind: 'rescue'; species: SpeciesId }

/**
 * How the scripted player plays: the default balanced player, or the tempted one that only buys
 * fields and sells every raw ingredient to MegaMeat.
 */
export type Strategy = 'default' | 'tempted'

export interface Player {
  strategy: Strategy
  clicksPerSecond: number
  clickCarry: number
  /** Game seconds since the surplus was last sold in bulk. */
  sinceBulkSale: number
  /** Where the surplus goes: the biogas plant by default, or MegaMeat for the tempted player. */
  surplusBuyer: BuyerId
  target: Target | null
}

/** Gains below this (€/s) count as no gain, so rounding noise never makes a purchase look useful. */
const MIN_GAIN = 1e-9

/** Names are irrelevant to balancing; always taking the first free one keeps runs deterministic. */
const NO_RANDOM = () => 0

/** Upgrades that change income, and so are scored like buildings. */
const INCOME_EFFECTS: readonly UpgradeEffect['kind'][] = ['rate', 'yield', 'price', 'orders']

/** Other upgrades, and storeroom expansions while a good is full, are bought when they cost at most this many seconds of income. */
const CHEAP_UPGRADE_SECONDS = 300

/** A rescue is scored by what the customers its awareness wins through campaigns within this many seconds add to income. */
const RESCUE_HORIZON_SECONDS = 600

/** How often the player sells surplus in bulk, and how many seconds of use or orders it keeps. */
const BULK_SALE_EVERY_SECONDS = 10
const BULK_KEEP_SECONDS = 30

export function createPlayer(
  clicksPerSecond: number,
  surplusBuyer: BuyerId = 'biogas',
  strategy: Strategy = 'default',
): Player {
  // The tempted player feeds MegaMeat whatever the surplus setting says.
  const buyer = strategy === 'tempted' ? 'megaMeat' : surplusBuyer
  return { strategy, clicksPerSecond, clickCarry: 0, sinceBulkSale: 0, surplusBuyer: buyer, target: null }
}

/** One decision step of the scripted player; the caller then advances the game with tick(). */
export function playerStep(player: Player, state: GameState, seconds: number, log: (p: Purchase) => void): void {
  if (player.strategy === 'tempted') {
    temptedStep(player, state, seconds, log)
    return
  }
  click(player, state, seconds)
  if (!state.assistant && canSell(state)) {
    sell(state)
  }
  player.sinceBulkSale += seconds
  if (player.sinceBulkSale >= BULK_SALE_EVERY_SECONDS - 1e-9) {
    player.sinceBulkSale = 0
    sellSurplus(state, player.surplusBuyer)
    expandWhenFull(state, log, player.surplusBuyer)
  }
  runBestCampaign(state, log)
  if (canHireAssistant(state)) {
    hireAssistant(state)
    log({ time: state.playTime, kind: 'assistant', id: 'assistant', price: ASSISTANT.price })
  }
  if (!player.target) {
    buyCheapUpgrades(state, log, player.surplusBuyer)
  }
  player.target ??= chooseTarget(state, player.surplusBuyer)
  if (player.target) {
    buyTowards(player, state, log)
  }
}

const HARVESTS = MANUAL_ACTIONS.filter((action) => !action.input)

/**
 * The tempted player: harvests by hand the raw ingredient MegaMeat pays most for right now, buys
 * the cheapest unlocked field whenever it can, expands the storeroom like the default player, and
 * every 10 seconds sells every raw ingredient to MegaMeat. It never processes, rescues or upgrades.
 */
function temptedStep(player: Player, state: GameState, seconds: number, log: (p: Purchase) => void): void {
  player.clickCarry += player.clicksPerSecond * seconds
  while (player.clickCarry >= 1) {
    player.clickCarry -= 1
    const harvest = HARVESTS.filter((action) => canPerform(state, action.id)).reduce<(typeof HARVESTS)[number] | null>(
      (best, action) =>
        !best || (unitPrice(state, 'megaMeat', action.output.resource) ?? 0) > (unitPrice(state, 'megaMeat', best.output.resource) ?? 0)
          ? action
          : best,
      null,
    )
    if (harvest) {
      performManual(state, harvest.id)
    }
  }
  player.sinceBulkSale += seconds
  if (player.sinceBulkSale >= BULK_SALE_EVERY_SECONDS - 1e-9) {
    player.sinceBulkSale = 0
    for (const resource of RAW) {
      bulkSell(state, 'megaMeat', resource)
    }
    expandWhenFull(state, log, 'megaMeat')
  }
  const fields = BUILDINGS.filter((building) => !building.input && isUnlocked(state, building.id))
  const cheapest = fields.reduce<(typeof fields)[number] | null>(
    (best, field) => (!best || buildingPrice(state, field.id).lt(buildingPrice(state, best.id)) ? field : best),
    null,
  )
  if (cheapest && canBuy(state, cheapest.id)) {
    const price = buildingPrice(state, cheapest.id).toNumber()
    buyBuilding(state, cheapest.id)
    log({ time: state.playTime, kind: 'building', id: cheapest.id, price })
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
 * in the next 30 seconds, to the surplus buyer where it takes the resource, otherwise to the
 * best-paying buyer that costs no customers. The game sells whole stocks
 * only, so the kept part is set aside for the sale and put back after it.
 */
function sellSurplus(state: GameState, surplusBuyer: BuyerId): void {
  const perSecond: Partial<Record<string, number>> = {}
  for (const building of BUILDINGS) {
    if (building.input) {
      const use = state.buildings[building.id] * building.rate * rateFactor(state, building.id) * building.input.ratio
      perSecond[building.input.resource] = (perSecond[building.input.resource] ?? 0) + use
    }
  }
  const orders = orderRate(state).toNumber()
  for (const resource of RESOURCES) {
    const buyer = hasLot(surplusBuyer, resource) ? surplusBuyer : bestBuyer(state, resource, { withoutFeedCost: true })?.buyer
    if (!buyer) {
      continue
    }
    const isProduct = (PRODUCTS as readonly string[]).includes(resource)
    const keep = Math.ceil(BULK_KEEP_SECONDS * (isProduct ? orders : (perSecond[resource] ?? 0)))
    const stock = state.stock[resource]
    if (stock.lte(keep)) {
      continue
    }
    state.stock[resource] = stock.sub(keep)
    bulkSell(state, buyer, resource)
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
function incomeEstimate(state: Readonly<GameState>, surplusBuyer: BuyerId): number {
  const average = state.playTime > 0 ? state.totalEarned.toNumber() / state.playTime : 0
  return Math.max(steadyIncome(state.buildings, state.customers.toNumber(), state.upgrades, surplusBuyer, scandalFactor(state)), average)
}

/** Buys upgrades without an income effect once they cost no more than a few minutes of income. */
function buyCheapUpgrades(state: GameState, log: (p: Purchase) => void, surplusBuyer: BuyerId): void {
  for (const upgrade of offeredUpgrades(state)) {
    if (INCOME_EFFECTS.includes(upgrade.effect.kind)) {
      continue
    }
    if (upgrade.price <= incomeEstimate(state, surplusBuyer) * CHEAP_UPGRADE_SECONDS && canBuyUpgrade(state, upgrade.id)) {
      buyUpgrade(state, upgrade.id)
      log({ time: state.playTime, kind: 'upgrade', id: upgrade.id, price: upgrade.price })
    }
  }
}

/** Campaigns that win customers, as opposed to the fact check. */
const CAMPAIGNS = AKTIONEN.filter((aktion) => !aktion.endsEvent).map((aktion) => aktion.id)

/** Customers a campaign wins per awareness point right now. */
function customersPerPoint(state: Readonly<GameState>, id: (typeof CAMPAIGNS)[number]): number {
  return aktionEstimate(state, id) / aktionCost(state, id)
}

/** Of the campaigns that can run now, runs the one winning the most customers per awareness point. */
function runBestCampaign(state: GameState, log: (p: Purchase) => void): void {
  const ready = CAMPAIGNS.filter((id) => canRun(state, id) === 'ok' && aktionEstimate(state, id) > 0)
  if (ready.length === 0) {
    return
  }
  const best = ready.reduce((a, b) => (customersPerPoint(state, b) > customersPerPoint(state, a) ? b : a))
  const cost = aktionCost(state, best)
  runAktion(state, best)
  log({ time: state.playTime, kind: 'aktion', id: best, price: cost })
}

/**
 * The best customers per awareness point among the campaigns on offer, ready or not; 0 with none.
 * The Aktionen tab's awareness unlock is taken as met: the first rescue is what fills the pool.
 */
function bestCustomersPerPoint(state: Readonly<GameState>): number {
  const unlocked = { ...state, aktionen: { ...state.aktionen, unlocked: true } }
  const offered = CAMPAIGNS.filter((id) => isAktionOffered(unlocked, id))
  return Math.max(0, ...offered.map((id) => customersPerPoint(state, id)))
}

function expandWhenFull(state: GameState, log: (p: Purchase) => void, surplusBuyer: BuyerId): void {
  // Runs right after the surplus sale, so a good still marked full is one the sale did not relieve.
  if (Object.keys(state.full).length === 0 || !canExpand(state)) {
    return
  }
  const price = expansionPrice(state)
  if (price.toNumber() <= incomeEstimate(state, surplusBuyer) * CHEAP_UPGRADE_SECONDS) {
    expandStoreroom(state)
    log({ time: state.playTime, kind: 'storeroom', id: 'storeroom', price: price.toNumber() })
  }
}

function chooseTarget(state: Readonly<GameState>, surplusBuyer: BuyerId): Target | null {
  const customers = state.customers.toNumber()
  const before = steadyIncome(state.buildings, customers, state.upgrades, surplusBuyer, scandalFactor(state))
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
    const gain = steadyIncome(after, customers, state.upgrades, surplusBuyer, scandalFactor(state)) - before
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
    const gain = steadyIncome(state.buildings, customers, [...state.upgrades, upgrade.id], surplusBuyer, scandalFactor(state)) - before
    if (gain > MIN_GAIN && upgrade.price / gain < bestScore) {
      bestUpgrade = upgrade.id
      bestScore = upgrade.price / gain
    }
  }
  const rescue = rescueScore(state, surplusBuyer)
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
    const used = usedOutput(flow, state.upgrades)
    let need = units
    let cost = 0
    for (const building of [...stages].reverse()) {
      const runs = need / yieldPerRun(state, building.id)
      cost += (runs / (building.rate * rateFactor(state, building.id))) * buildingPrice(state, building.id).toNumber()
      if (!building.input) {
        break
      }
      const { resource, ratio } = building.input
      const spare = Math.max(0, (flow[resource] ?? 0) - (used[resource] ?? 0))
      need = Math.max(0, runs * ratio - spare)
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
 * customers its awareness wins through campaigns within the horizon first take the products now
 * going to the biogas plant;
 * orders beyond that need new chain capacity, which is added to the price.
 */
function rescueScore(state: Readonly<GameState>, surplusBuyer: BuyerId): { species: SpeciesId; score: number } | null {
  const species = bestSpecies(state)
  if (!species) {
    return null
  }
  const customers = state.customers.toNumber()
  // Awareness wins customers only through campaigns, so the rescue is worth what its awareness of
  // the horizon buys at the best campaign's current rate; with no campaign offered, nothing.
  const perPoint = bestCustomersPerPoint(state)
  if (perPoint === 0) {
    return null
  }
  const converted = Math.min(
    getSpecies(species).awareness * awarenessFactor(state, species) * RESCUE_HORIZON_SECONDS * perPoint,
    POPULATION - customers,
  )
  // The orders the won customers add on top of today's: the curve makes later customers order less.
  const orders = demandRate(customers + converted, ordersFactor(state) * scandalFactor(state)) -
    demandRate(customers, ordersFactor(state) * scandalFactor(state))
  const before = steadyIncome(state.buildings, customers, state.upgrades, surplusBuyer, scandalFactor(state))
  const fromSurplus = steadyIncome(state.buildings, customers + converted, state.upgrades, surplusBuyer, scandalFactor(state)) - before
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
