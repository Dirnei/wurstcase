import { createInitialState, type GameState } from '../state'
import { tick } from '../tick'
import { createPlayer, playerStep, type Purchase } from './player'

export interface SimulationSettings {
  minutes: number
  clicksPerSecond: number
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

export interface SimulationResult {
  samples: Sample[]
  log: Purchase[]
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
  const player = createPlayer(settings.clicksPerSecond)
  const log: Purchase[] = []
  const samples: Sample[] = []
  const earnedBySecond: number[] = [0]
  const seconds = Math.round(settings.minutes * 60)

  for (let second = 1; second <= seconds; second++) {
    for (let step = 0; step < STEPS_PER_SECOND; step++) {
      playerStep(player, state, STEP_SECONDS, (purchase) =>
        log.push({ ...purchase, time: Math.round(purchase.time * 10) / 10 }),
      )
      tick(state, STEP_SECONDS)
    }
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
  return { samples, log, final: state }
}
