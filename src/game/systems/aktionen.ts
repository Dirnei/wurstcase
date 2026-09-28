import { AKTION_IDS, AKTIONEN_UNLOCK_AWARENESS, getAktion, type AktionId } from '../content/aktionen'
import { POPULATION } from '../content/town'
import type { GameState } from '../state'
import { scandalFactor } from './bulkSales'
import { aktionCostFactor, reachFactor } from './upgrades'
import { activeFactors, endEvent, onFirstAktion } from './villain'

/** Why an Aktion can run or not. */
export type AktionCheck = 'ok' | 'locked' | 'cooldown' | 'noEvent' | 'awareness'

/** Unlocks the Aktionen tab the first time the pool holds enough awareness; it never locks again. */
export function unlockAktionen(state: GameState): void {
  if (!state.aktionen.unlocked && state.awareness.gte(AKTIONEN_UNLOCK_AWARENESS)) {
    state.aktionen.unlocked = true
  }
}

/** The panel shows once the pool first held enough awareness, and stays even when the pool drops. */
export function isAktionenUnlocked(state: Readonly<GameState>): boolean {
  return state.aktionen.unlocked
}

export function isAktionOffered(state: Readonly<GameState>, id: AktionId): boolean {
  const aktion = getAktion(id)
  return (
    state.aktionen.unlocked &&
    state.totalEarned.gte(aktion.unlockAt) &&
    (!aktion.requiresSpecies || state.residents.some((r) => r.species === aktion.requiresSpecies)) &&
    (!aktion.endsEvent || state.megaMeat.started > 0)
  )
}

/**
 * How much bigger a campaign has grown from its runs so far; 1 for the fact check. Plain numbers
 * suffice: even 200 runs at ×1.25 are about 3e19, far from float limits, and the town caps reach.
 */
function growthFor(state: Readonly<GameState>, id: AktionId, of: 'costGrowth' | 'reachGrowth'): number {
  return (getAktion(id)[of] ?? 1) ** state.aktionen.runs[id]
}

/** Awareness cost right now: grown with the runs so far, raised by the billboards, lowered by upgrades. */
export function aktionCost(state: Readonly<GameState>, id: AktionId): number {
  return Math.ceil(getAktion(id).cost * growthFor(state, id, 'costGrowth') * activeFactors(state).aktionCost * aktionCostFactor(state))
}

/**
 * Customers a campaign would win now: grown with its runs, lowered by MegaMeat's study and scandal,
 * fewer as the town fills up, never beyond it.
 */
export function aktionEstimate(state: Readonly<GameState>, id: AktionId): number {
  const base =
    (getAktion(id).customers ?? 0) *
    growthFor(state, id, 'reachGrowth') *
    activeFactors(state).reach *
    reachFactor(state) *
    scandalFactor(state)
  const customers = state.customers.toNumber()
  const share = Math.max(0, 1 - customers / POPULATION)
  return Math.max(0, Math.min(Math.floor(base * share), POPULATION - customers))
}

export function canRun(state: Readonly<GameState>, id: AktionId): AktionCheck {
  if (!isAktionOffered(state, id)) {
    return 'locked'
  }
  if (state.aktionen.cooldown[id] > 0) {
    return 'cooldown'
  }
  if (getAktion(id).endsEvent && !state.megaMeat.active) {
    return 'noEvent'
  }
  if (state.awareness.lt(aktionCost(state, id))) {
    return 'awareness'
  }
  return 'ok'
}

/** Spends awareness on an Aktion. Money is never touched. */
export function runAktion(state: GameState, id: AktionId): boolean {
  if (canRun(state, id) !== 'ok') {
    return false
  }
  const aktion = getAktion(id)
  const converted = aktionEstimate(state, id)
  state.awareness = state.awareness.sub(aktionCost(state, id))
  state.aktionen.cooldown[id] = aktion.cooldown
  state.aktionen.runs[id] += 1
  if (aktion.endsEvent) {
    endEvent(state)
  } else {
    state.customers = state.customers.add(converted)
  }
  onFirstAktion(state)
  return true
}

/** Counts every cooldown down with passing game time. */
export function coolDown(state: GameState, seconds: number): void {
  for (const id of AKTION_IDS) {
    state.aktionen.cooldown[id] = Math.max(0, state.aktionen.cooldown[id] - seconds)
  }
}
