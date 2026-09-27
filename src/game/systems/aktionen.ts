import { AKTION_IDS, AKTIONEN, getAktion, type AktionId } from '../content/aktionen'
import { POPULATION } from '../content/town'
import type { GameState } from '../state'
import { aktionCostFactor } from './upgrades'
import { activeFactors, endEvent, onFirstAktion } from './villain'

/** Why an Aktion can run or not. */
export type AktionCheck = 'ok' | 'locked' | 'cooldown' | 'noEvent' | 'awareness'

export function isAktionOffered(state: Readonly<GameState>, id: AktionId): boolean {
  const aktion = getAktion(id)
  return (
    state.totalEarned.gte(aktion.unlockAt) &&
    (!aktion.requiresSpecies || state.residents.some((r) => r.species === aktion.requiresSpecies)) &&
    (!aktion.endsEvent || state.megaMeat.started > 0)
  )
}

/** The panel shows once any Aktion is offered; offers only ever grow, so it stays. */
export function isAktionenUnlocked(state: Readonly<GameState>): boolean {
  return AKTIONEN.some((aktion) => isAktionOffered(state, aktion.id))
}

/** Awareness cost right now: raised while MegaMeat has booked the billboards, lowered by upgrades. */
export function aktionCost(state: Readonly<GameState>, id: AktionId): number {
  return Math.ceil(getAktion(id).cost * activeFactors(state).aktionCost * aktionCostFactor(state))
}

/** Customers a campaign would convert now: fewer as the town fills up, never beyond it. */
export function aktionEstimate(state: Readonly<GameState>, id: AktionId): number {
  const base = getAktion(id).customers ?? 0
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
