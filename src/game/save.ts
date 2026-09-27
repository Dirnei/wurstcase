import Decimal from 'break_eternity.js'
import { BUILDING_IDS } from './content/buildings'
import { RESOURCES } from './content/resources'
import { createInitialState, type GameState } from './state'

/*
 * Save format. When a later change adds a field to GameState:
 *   1. bump CURRENT_FORMAT,
 *   2. add a MIGRATIONS entry from the previous format that supplies a default for the field,
 *   3. read and validate the field in readState(), and write it in writeState().
 * Decimal fields are written as strings (decimal.toString()) so nothing is rounded past 1e308.
 */

export const CURRENT_FORMAT = 3

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

// `waiting` is left out: production recomputes it on the next tick.
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
  }
}

function readState(value: unknown): GameState | null {
  if (
    !isRecord(value) ||
    !isRecord(value.stock) ||
    !isRecord(value.buildings) ||
    !isRecord(value.progress)
  ) {
    return null
  }
  const { playTime, orderProgress, assistant } = value
  const money = readAmount(value.money)
  const totalEarned = readAmount(value.totalEarned)
  const customers = readAmount(value.customers)
  const openOrders = readAmount(value.openOrders)
  if (
    !isFiniteNumber(playTime) ||
    playTime < 0 ||
    !money ||
    !totalEarned ||
    !customers ||
    !openOrders ||
    !isFiniteNumber(orderProgress) ||
    orderProgress < 0 ||
    typeof assistant !== 'boolean'
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
  return {
    ...state,
    playTime,
    money,
    totalEarned,
    customers,
    openOrders,
    orderProgress,
    assistant,
  }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
