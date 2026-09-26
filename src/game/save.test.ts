import { describe, expect, it } from 'vitest'
import { decodeSave, encodeSave, exportSave, importSave } from './save'
import { createInitialState } from './state'

const NOW = 1_790_000_000_000

function envelope(format: number, state: unknown, savedAt = NOW): string {
  return JSON.stringify({ format, savedAt, state })
}

describe('encodeSave / decodeSave', () => {
  it('round-trips the game state and the save time', () => {
    const state = { ...createInitialState(), playTime: 3723.5 }
    expect(decodeSave(encodeSave(state, NOW))).toEqual({ ok: true, state, savedAt: NOW })
  })

  it.each([
    ['not JSON', 'not json'],
    ['not an object', '42'],
    ['missing envelope fields', JSON.stringify({ state: { playTime: 1 } })],
    ['non-integer format', envelope(1.5, { playTime: 1 })],
    ['negative play time', envelope(1, { playTime: -1 })],
    ['NaN-like play time', envelope(1, { playTime: 'NaN' })],
    ['string play time', envelope(1, { playTime: '12' })],
    ['missing state', JSON.stringify({ format: 1, savedAt: NOW })],
  ])('rejects %s', (_, json) => {
    expect(decodeSave(json)).toEqual({ ok: false, reason: 'invalid' })
  })

  it('refuses saves from a newer format', () => {
    expect(decodeSave(envelope(99, { playTime: 1 }))).toEqual({ ok: false, reason: 'too-new' })
  })

  it('upgrades older formats step by step, in order', () => {
    const steps: number[] = []
    const migrations = {
      1: (state: unknown) => {
        steps.push(1)
        return { seconds: (state as { time: number }).time }
      },
      2: (state: unknown) => {
        steps.push(2)
        return { playTime: (state as { seconds: number }).seconds }
      },
    }
    const result = decodeSave(envelope(1, { time: 42 }), { migrations, currentFormat: 3 })
    expect(result).toEqual({ ok: true, state: { playTime: 42 }, savedAt: NOW })
    expect(steps).toEqual([1, 2])
  })

  it('rejects an older format with a missing migration step', () => {
    expect(decodeSave(envelope(1, { playTime: 1 }), { migrations: {}, currentFormat: 2 })).toEqual({
      ok: false,
      reason: 'invalid',
    })
  })
})

describe('exportSave / importSave', () => {
  it('produces a single prefixed line that imports back to the same save', () => {
    const json = encodeSave({ playTime: 90 }, NOW)
    const text = exportSave(json)
    expect(text).toMatch(/^WURSTCASE1:[A-Za-z0-9+/=]+$/)
    expect(importSave(text)).toEqual({ ok: true, state: { playTime: 90 }, savedAt: NOW })
  })

  it('tolerates surrounding whitespace from copy and paste', () => {
    const text = exportSave(encodeSave({ playTime: 5 }, NOW))
    expect(importSave(`  ${text}\n`)).toEqual({ ok: true, state: { playTime: 5 }, savedAt: NOW })
  })

  it.each([
    ['empty text', ''],
    ['missing prefix', btoa(encodeSave({ playTime: 1 }, NOW))],
    ['broken base64', 'WURSTCASE1:%%%'],
    ['valid base64 but not a save', `WURSTCASE1:${btoa('hello')}`],
  ])('rejects %s', (_, text) => {
    expect(importSave(text)).toEqual({ ok: false, reason: 'invalid' })
  })
})
