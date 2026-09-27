import { HINTS, SATIRE, type HintClause, type HintDef } from '../content/headlines'
import type { GameState } from '../state'
import { canRun, isAktionOffered } from './aktionen'
import { isUnlocked } from './buildings'
import { isLebenshofUnlocked } from './rescue'
import { isAssistantOffered } from './sales'

/** What the ticker remembers between headlines; kept by the UI, never saved. */
export interface TickerMemory {
  /** Headlines shown so far; odd slots are hint slots. */
  slot: number
  lastHint: string | null
  /** The last satirical headline ids, newest last. */
  recentSatire: string[]
}

/** Satirical headlines are not repeated within this many while enough others are unlocked. */
const NO_REPEAT = 3

export function createTickerMemory(): TickerMemory {
  return { slot: 0, lastHint: null, recentSatire: [] }
}

function clauseHolds(state: Readonly<GameState>, clause: HintClause): boolean {
  if ('owned' in clause) {
    return clause.is === 'none' ? state.buildings[clause.owned] === 0 : state.buildings[clause.owned] > 0
  }
  if ('unlocked' in clause) {
    return isUnlocked(state, clause.unlocked)
  }
  if ('assistantOffered' in clause) {
    return isAssistantOffered(state)
  }
  if ('lebenshofEmpty' in clause) {
    return isLebenshofUnlocked(state) && state.residents.length === 0
  }
  if ('aktionNeverRun' in clause) {
    return isAktionOffered(state, clause.aktionNeverRun) && state.aktionen.runs[clause.aktionNeverRun] === 0
  }
  return canRun(state, 'factCheck') === 'ok'
}

export function hintApplies(state: Readonly<GameState>, hint: HintDef): boolean {
  return hint.when.every((clause) => clauseHolds(state, clause))
}

/**
 * The next ticker headline as a translation key. Every other slot is a hint while one applies:
 * the first applicable one in list order, skipping the one shown last time if another applies.
 * Other slots get a random unlocked satirical headline that was not among the last few.
 */
export function nextHeadline(
  state: Readonly<GameState>,
  memory: TickerMemory,
  random: () => number = Math.random,
): { key: string; memory: TickerMemory } {
  const slot = memory.slot + 1
  if (memory.slot % 2 === 1) {
    const applicable = HINTS.filter((hint) => hintApplies(state, hint)).map((hint) => hint.id)
    if (applicable.length > 0) {
      const id = applicable.find((candidate) => candidate !== memory.lastHint) ?? applicable[0]
      return { key: `headline.hint.${id}`, memory: { ...memory, slot, lastHint: id } }
    }
  }

  const unlocked = SATIRE.filter((satire) => state.totalEarned.gte(satire.unlockAt)).map((s) => s.id)
  const avoid = memory.recentSatire.slice(unlocked.length > NO_REPEAT ? -NO_REPEAT : -1)
  const candidates = unlocked.filter((id) => !avoid.includes(id))
  const pool = candidates.length > 0 ? candidates : unlocked
  const id = pool[Math.min(Math.floor(random() * pool.length), pool.length - 1)]
  return {
    key: `headline.satire.${id}`,
    memory: { ...memory, slot, recentSatire: [...memory.recentSatire, id].slice(-NO_REPEAT) },
  }
}
