import Decimal from 'break_eternity.js'
import { AKTION_IDS } from './content/aktionen'
import { isSpeciesId, NAME_POOL_SIZE } from './content/animals'
import { BUILDING_IDS } from './content/buildings'
import { BUYER_IDS } from './content/buyers'
import { EVENT_PAUSE, isMegaMeatEventId, MEGAMEAT_EVENTS } from './content/megaMeatEvents'
import { RESOURCES } from './content/resources'
import { SHELTER_IDS } from './content/shelters'
import { CHAIN_MILESTONES, isUpgradeId, type UpgradeId } from './content/upgrades'
import { createInitialState, type GameState, type MegaMeatState, type Resident } from './state'

/*
 * Save format. When a later change adds a field to GameState:
 *   1. bump CURRENT_FORMAT,
 *   2. add a MIGRATIONS entry from the previous format that supplies a default for the field,
 *   3. read and validate the field in readState(), and write it in writeState().
 * Decimal fields are written as strings (decimal.toString()) so nothing is rounded past 1e308.
 */

export const CURRENT_FORMAT = 15

/** Upgrades a state from format N (the key) to format N + 1. */
export type Migration = (state: unknown) => unknown

export const MIGRATIONS: Readonly<Record<number, Migration>> = {
  // 1 → 2 (production-chain): a new economy with no money, stock or buildings.
  1: (state) => (isRecord(state) ? { ...writeState(createInitialState()), ...state } : state),
  // 2 → 3 (sales-and-customers): the 10 starting neighbours, no open orders, no assistant.
  2: (state) =>
    isRecord(state)
      ? { customers: '10', openOrders: '0', orderProgress: 0, assistant: false, ...state }
      : state,
  // 3 → 4 (bulk-buyers): nothing sold to MegaMeat or the biogas plant yet.
  3: (state) =>
    isRecord(state) ? { unitsSold: { megaMeat: '0', biogas: '0' }, ...state } : state,
  // 4 → 5 (lebenshof-rescue): an empty Lebenshof.
  4: (state) =>
    isRecord(state)
      ? { residents: [], shelters: { stable: 0, pasture: 0 }, conversionProgress: 0, ...state }
      : state,
  // 5 → 6 (aktionen-and-megameat): an empty awareness pool, no Aktion run, MegaMeat quiet.
  5: (state) =>
    isRecord(state)
      ? {
          awareness: '0',
          awarenessProgress: 0,
          aktionen: { cooldown: {}, runs: {} },
          megaMeat: { active: null, nextIn: null, nextIndex: 0, started: 0 },
          ...state,
        }
      : state,
  // 6 → 7 (upgrades): no upgrade owned.
  6: (state) => (isRecord(state) ? { upgrades: [], ...state } : state),
  // 7 → 8 (milestone-upgrades): milestones became chain upgrades; own those whose chain the save
  // had completed.
  7: (state) => {
    if (!isRecord(state) || !isRecord(state.buildings) || !Array.isArray(state.upgrades)) {
      return state
    }
    const buildings = state.buildings
    const reached = CHAIN_MILESTONES.filter(({ upgrade }) =>
      upgrade.when.every((clause) => 'owned' in clause && typeof buildings[clause.owned] === 'number' && (buildings[clause.owned] as number) >= clause.atLeast),
    ).map(({ upgrade }) => upgrade.id)
    return { ...state, upgrades: [...new Set([...state.upgrades, ...reached])] }
  },
  // 8 → 9 (megameat-temptation): no customer income yet; it catches up within minutes of play.
  8: (state) => (isRecord(state) ? { customerIncome: '0', ...state } : state),
  // 9 → 10 (storeroom): the first storeroom level; stock above its room is kept.
  9: (state) => (isRecord(state) ? { storeroom: 1, ...state } : state),
  // 10 → 11 (campaign-growth): passive conversion is gone, and so is its progress; campaign run
  // counts, which now set each campaign's size, are kept.
  10: (state) => {
    if (!isRecord(state)) {
      return state
    }
    const { conversionProgress: _dropped, ...rest } = state
    return rest
  },
  // 11 → 12 (campaigns-unlock-by-awareness): the Aktionen tab now unlocks at 50 awareness and
  // remembers it. Games that already had it (a run, a full enough pool, or the flyers' old €100)
  // keep it.
  11: (state) => {
    if (!isRecord(state) || !isRecord(state.aktionen) || !isRecord(state.aktionen.runs)) {
      return state
    }
    const runs = Object.values(state.aktionen.runs).some((count) => typeof count === 'number' && count > 0)
    const pool = readAmount(state.awareness)?.gte(50) ?? false
    const earned = readAmount(state.totalEarned)?.gte(100) ?? false
    return { ...state, aktionen: { ...state.aktionen, unlocked: runs || pool || earned } }
  },
  // 12 → 13 (megameat-outbids): MegaMeat's markets start fresh.
  12: (state) => (isRecord(state) ? { megaMeatFlood: {}, ...state } : state),
  // 13 → 14 (chain-proportions): floods are counted in euros now, not units; markets start fresh.
  // A flood halves every 20 s, so nothing of value is lost.
  13: (state) => (isRecord(state) ? { ...state, megaMeatFlood: {} } : state),
  // 14 → 15 (megameat-scandal): sales feed a scandal instead of taking customers, and the biogas
  // plant's product markets flood; no scandal yet and fresh biogas markets.
  14: (state) => (isRecord(state) ? { megaMeatScandal: '0', biogasFlood: {}, ...state } : state),
}

export type DecodeResult =
  | { ok: true; state: GameState; savedAt: number }
  | { ok: false; reason: 'invalid' | 'too-new' }

export interface DecodeOptions {
  migrations?: Readonly<Record<number, Migration>>
  currentFormat?: number
}

const EXPORT_PREFIX = 'WURSTCASE1:'
const INVALID: DecodeResult = { ok: false, reason: 'invalid' }

export function encodeSave(state: GameState, savedAt: number): string {
  return JSON.stringify({ format: CURRENT_FORMAT, savedAt, state: writeState(state) })
}

/** Parses, migrates and validates a save; invalid data never reaches the game. */
export function decodeSave(json: string, options: DecodeOptions = {}): DecodeResult {
  const { migrations = MIGRATIONS, currentFormat = CURRENT_FORMAT } = options
  let envelope: unknown
  try {
    envelope = JSON.parse(json)
  } catch {
    return INVALID
  }
  if (!isRecord(envelope) || !('state' in envelope)) {
    return INVALID
  }
  const { format, savedAt } = envelope
  if (!Number.isInteger(format) || (format as number) < 1 || !isFiniteNumber(savedAt)) {
    return INVALID
  }
  if ((format as number) > currentFormat) {
    return { ok: false, reason: 'too-new' }
  }

  let state = envelope.state
  for (let version = format as number; version < currentFormat; version++) {
    const migrate = migrations[version]
    if (!migrate) {
      return INVALID
    }
    state = migrate(state)
  }

  const gameState = readState(state)
  return gameState ? { ok: true, state: gameState, savedAt } : INVALID
}

/** A single line players can copy, e.g. to move their progress to another device. */
export function exportSave(json: string): string {
  const bytes = new TextEncoder().encode(json)
  return EXPORT_PREFIX + btoa(String.fromCharCode(...bytes))
}

export function importSave(text: string, options?: DecodeOptions): DecodeResult {
  const trimmed = text.trim()
  if (!trimmed.startsWith(EXPORT_PREFIX)) {
    return INVALID
  }
  try {
    const binary = atob(trimmed.slice(EXPORT_PREFIX.length))
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return decodeSave(new TextDecoder('utf-8', { fatal: true }).decode(bytes), options)
  } catch {
    return INVALID
  }
}

// `waiting`, `blocked` and `full` are left out: production recomputes them on the next tick.
function writeState(state: GameState): Record<string, unknown> {
  return {
    playTime: state.playTime,
    money: state.money.toString(),
    totalEarned: state.totalEarned.toString(),
    stock: Object.fromEntries(RESOURCES.map((id) => [id, state.stock[id].toString()])),
    buildings: { ...state.buildings },
    progress: { ...state.progress },
    customers: state.customers.toString(),
    openOrders: state.openOrders.toString(),
    orderProgress: state.orderProgress,
    assistant: state.assistant,
    unitsSold: Object.fromEntries(BUYER_IDS.map((id) => [id, state.unitsSold[id].toString()])),
    residents: state.residents.map(({ species, name }) => ({ species, name })),
    shelters: { ...state.shelters },
    awareness: state.awareness.toString(),
    awarenessProgress: state.awarenessProgress,
    aktionen: {
      cooldown: { ...state.aktionen.cooldown },
      runs: { ...state.aktionen.runs },
      unlocked: state.aktionen.unlocked,
    },
    megaMeat: { ...state.megaMeat, active: state.megaMeat.active && { ...state.megaMeat.active } },
    upgrades: [...state.upgrades],
    customerIncome: state.customerIncome.toString(),
    storeroom: state.storeroom,
    megaMeatScandal: state.megaMeatScandal.toString(),
    megaMeatFlood: Object.fromEntries(
      Object.entries(state.megaMeatFlood).map(([resource, flood]) => [resource, flood.toString()]),
    ),
    biogasFlood: Object.fromEntries(
      Object.entries(state.biogasFlood).map(([resource, flood]) => [resource, flood.toString()]),
    ),
  }
}

function readState(value: unknown): GameState | null {
  if (
    !isRecord(value) ||
    !isRecord(value.stock) ||
    !isRecord(value.buildings) ||
    !isRecord(value.progress) ||
    !isRecord(value.unitsSold) ||
    !isRecord(value.shelters) ||
    !Array.isArray(value.residents) ||
    !isRecord(value.aktionen) ||
    !isRecord(value.aktionen.cooldown) ||
    !isRecord(value.aktionen.runs) ||
    typeof value.aktionen.unlocked !== 'boolean' ||
    !Array.isArray(value.upgrades) ||
    !isRecord(value.megaMeatFlood) ||
    !isRecord(value.biogasFlood)
  ) {
    return null
  }
  const { playTime, orderProgress, assistant, awarenessProgress, storeroom } = value
  const awareness = readAmount(value.awareness)
  const megaMeat = readMegaMeat(value.megaMeat)
  const money = readAmount(value.money)
  const totalEarned = readAmount(value.totalEarned)
  const customers = readAmount(value.customers)
  const openOrders = readAmount(value.openOrders)
  const customerIncome = readRate(value.customerIncome)
  const megaMeatScandal = readRate(value.megaMeatScandal)
  if (
    !isFiniteNumber(playTime) ||
    playTime < 0 ||
    !money ||
    !totalEarned ||
    !customers ||
    !openOrders ||
    !customerIncome ||
    !megaMeatScandal ||
    !isFiniteNumber(orderProgress) ||
    orderProgress < 0 ||
    typeof assistant !== 'boolean' ||
    !awareness ||
    !isFiniteNumber(awarenessProgress) ||
    awarenessProgress < 0 ||
    !megaMeat ||
    !Number.isSafeInteger(storeroom) ||
    (storeroom as number) < 1
  ) {
    return null
  }

  // Only known ids are read, so keys of removed content are ignored instead of breaking the save.
  const state = createInitialState()
  for (const id of RESOURCES) {
    const amount = readAmount(value.stock[id])
    if (!amount) {
      return null
    }
    state.stock[id] = amount
  }
  for (const id of BUILDING_IDS) {
    const count = value.buildings[id]
    if (!Number.isSafeInteger(count) || (count as number) < 0) {
      return null
    }
    state.buildings[id] = count as number
    const progress = value.progress[id]
    if (!isFiniteNumber(progress) || progress < 0) {
      return null
    }
    state.progress[id] = progress
  }
  for (const id of BUYER_IDS) {
    const units = readAmount(value.unitsSold[id])
    if (!units) {
      return null
    }
    state.unitsSold[id] = units
  }
  for (const id of SHELTER_IDS) {
    const count = value.shelters[id]
    if (!Number.isSafeInteger(count) || (count as number) < 0) {
      return null
    }
    state.shelters[id] = count as number
  }
  for (const id of AKTION_IDS) {
    // A known Aktion missing from the save (added in a later build) starts ready and never run.
    const cooldown = value.aktionen.cooldown[id] ?? 0
    const runs = value.aktionen.runs[id] ?? 0
    if (!isFiniteNumber(cooldown) || cooldown < 0 || !Number.isSafeInteger(runs) || (runs as number) < 0) {
      return null
    }
    state.aktionen.cooldown[id] = cooldown
    state.aktionen.runs[id] = runs as number
  }
  state.aktionen.unlocked = value.aktionen.unlocked
  for (const id of RESOURCES) {
    const saved = value.megaMeatFlood[id]
    if (saved === undefined) {
      continue
    }
    const flood = readRate(saved)
    if (!flood) {
      return null
    }
    state.megaMeatFlood[id] = flood
  }
  for (const id of RESOURCES) {
    const saved = value.biogasFlood[id]
    if (saved === undefined) {
      continue
    }
    const flood = readRate(saved)
    if (!flood) {
      return null
    }
    state.biogasFlood[id] = flood
  }
  // Unknown ids (content removed) and repeats are dropped; the purchase order is kept.
  state.upgrades = [...new Set(value.upgrades.filter(isUpgradeId))] as UpgradeId[]
  for (const entry of value.residents) {
    const resident = readResident(entry)
    if (resident === null) {
      return null
    }
    if (resident !== 'unknown') {
      state.residents.push(resident)
    }
  }
  return {
    ...state,
    playTime,
    awareness,
    awarenessProgress,
    megaMeat,
    money,
    totalEarned,
    customers,
    openOrders,
    orderProgress,
    assistant,
    customerIncome,
    megaMeatScandal,
    storeroom: storeroom as number,
  }
}

/** MegaMeat's saved timers; an event this build does not know is dropped and the next one scheduled. */
function readMegaMeat(value: unknown): MegaMeatState | null {
  if (!isRecord(value)) {
    return null
  }
  const { active, nextIn, nextIndex, started } = value
  if (
    !Number.isSafeInteger(started) ||
    (started as number) < 0 ||
    !Number.isSafeInteger(nextIndex) ||
    (nextIndex as number) < 0 ||
    (nextIn !== null && (!isFiniteNumber(nextIn) || nextIn < 0))
  ) {
    return null
  }
  const state: MegaMeatState = {
    active: null,
    nextIn,
    nextIndex: (nextIndex as number) < MEGAMEAT_EVENTS.length ? (nextIndex as number) : 0,
    started: started as number,
  }
  if (active !== null) {
    if (!isRecord(active) || !isFiniteNumber(active.remaining) || active.remaining < 0) {
      return null
    }
    if (isMegaMeatEventId(active.event)) {
      state.active = { event: active.event, remaining: active.remaining }
    } else {
      state.nextIn = EVENT_PAUSE
    }
  }
  return state
}

/** A saved resident, 'unknown' for a species this build does not know (skipped), or null if broken. */
function readResident(value: unknown): Resident | 'unknown' | null {
  if (!isRecord(value)) {
    return null
  }
  const { species, name } = value
  if (!isSpeciesId(species)) {
    return typeof species === 'string' ? 'unknown' : null
  }
  if (!Number.isSafeInteger(name) || (name as number) < 0 || (name as number) >= NAME_POOL_SIZE) {
    return null
  }
  return { species, name: name as number }
}

/** A saved amount: a non-negative, finite, whole Decimal written as a string. */
function readAmount(value: unknown): Decimal | null {
  // break_eternity parses unknown text such as "abc" as 0, so check the characters first.
  if (typeof value !== 'string' || !/^[0-9.eE+-]+$/.test(value)) {
    return null
  }
  const amount = new Decimal(value)
  const valid = !amount.isNan() && amount.isFinite() && amount.gte(0) && amount.floor().eq(amount)
  return valid ? amount : null
}

/** A non-negative amount that may have a fractional part, such as a rate per second. */
function readRate(value: unknown): Decimal | null {
  if (typeof value !== 'string' || !/^[0-9.eE+-]+$/.test(value)) {
    return null
  }
  const rate = new Decimal(value)
  return !rate.isNan() && rate.isFinite() && rate.gte(0) ? rate : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
