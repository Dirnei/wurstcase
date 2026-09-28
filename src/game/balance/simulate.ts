import type { BuyerId } from '../content/buyers'
import { UPGRADES, type UpgradeId } from '../content/upgrades'
import { createInitialState, type GameState } from '../state'
import { scandalFactor } from '../systems/bulkSales'
import { isUpgradeOffered } from '../systems/upgrades'
import { tick } from '../tick'
import { createPlayer, playerStep, type Purchase, type Strategy } from './player'
import { steadyIncome } from './steady'

export interface SimulationSettings {
  minutes: number
  clicksPerSecond: number
  /** Where the scripted player sells its surplus; MegaMeat shows what feeding the industry costs. */
  surplusBuyer?: BuyerId
  /** The default balanced player, or the tempted one that sells every raw ingredient to MegaMeat. */
  strategy?: Strategy
}

export interface Sample {
  /** Game time in whole seconds. */
  time: number
  money: number
  totalEarned: number
  /** Euros earned per second, averaged over the last 10 seconds. */
  income: number
  customers: number
}

/** When an upgrade first went on offer in the run, and what it would have added to income then. */
export interface UpgradeOffer {
  id: UpgradeId
  time: number
  /** Extra income per second at that moment; null for upgrades that do not change income. */
  gain: number | null
}

export interface SimulationResult {
  samples: Sample[]
  log: Purchase[]
  offers: UpgradeOffer[]
  final: GameState
}

export const DEFAULT_SETTINGS: SimulationSettings = { minutes: 60, clicksPerSecond: 2 }

/** The live loop's step, so the simulation plays exactly like the game. */
const STEP_SECONDS = 0.1
const STEPS_PER_SECOND = 10
const INCOME_WINDOW_SECONDS = 10

/** Plays a new game with the scripted player through the real tick(). Deterministic. */
export function simulate(settings: SimulationSettings = DEFAULT_SETTINGS): SimulationResult {
  const state = createInitialState()
  const player = createPlayer(settings.clicksPerSecond, settings.surplusBuyer, settings.strategy)
  const log: Purchase[] = []
  const samples: Sample[] = []
  const offers: UpgradeOffer[] = []
  const earnedBySecond: number[] = [0]
  const seconds = Math.round(settings.minutes * 60)

  for (let second = 1; second <= seconds; second++) {
    for (let step = 0; step < STEPS_PER_SECOND; step++) {
      playerStep(player, state, STEP_SECONDS, (purchase) =>
        log.push({ ...purchase, time: Math.round(purchase.time * 10) / 10 }),
      )
      tick(state, STEP_SECONDS)
    }
    recordOffers(state, offers, player.surplusBuyer)
    const totalEarned = state.totalEarned.toNumber()
    earnedBySecond.push(totalEarned)
    const from = Math.max(0, second - INCOME_WINDOW_SECONDS)
    samples.push({
      time: second,
      money: state.money.toNumber(),
      totalEarned,
      income: (totalEarned - earnedBySecond[from]) / (second - from),
      customers: state.customers.toNumber(),
    })
  }
  return { samples, log, offers, final: state }
}

const INCOME_EFFECTS = new Set(['rate', 'yield', 'price', 'orders'])

function recordOffers(state: GameState, offers: UpgradeOffer[], surplusBuyer: BuyerId): void {
  for (const upgrade of UPGRADES) {
    // An upgrade the player bought within the same second still counts as offered then.
    const owned = state.upgrades.includes(upgrade.id)
    if (offers.some((offer) => offer.id === upgrade.id) || (!owned && !isUpgradeOffered(state, upgrade.id))) {
      continue
    }
    const customers = state.customers.toNumber()
    const without = state.upgrades.filter((id) => id !== upgrade.id)
    const gain = INCOME_EFFECTS.has(upgrade.effect.kind)
      ? steadyIncome(state.buildings, customers, [...without, upgrade.id], surplusBuyer, scandalFactor(state)) -
        steadyIncome(state.buildings, customers, without, surplusBuyer, scandalFactor(state))
      : null
    offers.push({ id: upgrade.id, time: state.playTime, gain })
  }
}
