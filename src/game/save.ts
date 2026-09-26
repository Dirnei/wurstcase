import type { GameState } from './state'

/*
 * Save format. When a later change adds a field to GameState:
 *   1. bump CURRENT_FORMAT,
 *   2. add a MIGRATIONS entry from the previous format that supplies a default for the field,
 *   3. read and validate the field in readState(), and write it in writeState().
 * Decimal fields are written as strings (decimal.toString()) so nothing is rounded past 1e308.
 */

export const CURRENT_FORMAT = 1

/** Upgrades a state from format N (the key) to format N + 1. */
export type Migration = (state: unknown) => unknown

export const MIGRATIONS: Readonly<Record<number, Migration>> = {}

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

function writeState(state: GameState): Record<string, unknown> {
  return { playTime: state.playTime }
}

function readState(value: unknown): GameState | null {
  if (!isRecord(value)) {
    return null
  }
  const { playTime } = value
  if (!isFiniteNumber(playTime) || playTime < 0) {
    return null
  }
  return { playTime }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
