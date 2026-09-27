import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { CURRENT_FORMAT, decodeSave, encodeSave, exportSave, importSave } from './save'
import { createInitialState, type GameState } from './state'

const NOW = 1_790_000_000_000

const withPlayTime = (playTime: number) => ({ ...createInitialState(), playTime })

function envelope(format: number, state: unknown, savedAt = NOW): string {
  return JSON.stringify({ format, savedAt, state })
}

/** The saved form of a new game, as written into the current format. */
function savedState(): Record<string, any> {
  return JSON.parse(encodeSave(createInitialState(), NOW)).state
}

function decodedState(json: string): GameState {
  const result = decodeSave(json)
  if (!result.ok) {
    throw new Error(`decode failed: ${result.reason}`)
  }
  return result.state
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
        return { ...savedState(), playTime: (state as { seconds: number }).seconds }
      },
    }
    const result = decodeSave(envelope(1, { time: 42 }), { migrations, currentFormat: 3 })
    expect(result).toEqual({ ok: true, state: withPlayTime(42), savedAt: NOW })
    expect(steps).toEqual([1, 2])
  })

  it('restores money, earnings, stock and buildings exactly', () => {
    const state = createInitialState()
    state.money = new Decimal('1.5e320')
    state.totalEarned = new Decimal('ee400')
    state.stock.tofu = new Decimal(12)
    state.stock.leverkas = new Decimal('3e500')
    state.buildings.tofuPress = 3
    state.buildings.cafeBar = 1
    state.progress.leverkasOven = 0.625

    const restored = decodedState(encodeSave(state, NOW))

    expect(restored.money.eq(state.money)).toBe(true)
    expect(restored.totalEarned.eq(state.totalEarned)).toBe(true)
    expect(restored.stock.tofu.eq(12)).toBe(true)
    expect(restored.stock.leverkas.eq(state.stock.leverkas)).toBe(true)
    expect(restored.buildings).toEqual(state.buildings)
    expect(restored.progress).toEqual(state.progress)
  })

  it('restores customers, open orders, order progress and the assistant', () => {
    const state = createInitialState()
    state.customers = new Decimal('2e30')
    state.openOrders = new Decimal(12)
    state.orderProgress = 0.35
    state.assistant = true

    const restored = decodedState(encodeSave(state, NOW))

    expect(restored.customers.eq(state.customers)).toBe(true)
    expect(restored.openOrders.eq(12)).toBe(true)
    expect(restored.orderProgress).toBe(0.35)
    expect(restored.assistant).toBe(true)
  })

  it('migrates a format 2 save to 10 customers, no orders and no assistant', () => {
    const format2 = savedState()
    delete format2.customers
    delete format2.openOrders
    delete format2.orderProgress
    delete format2.assistant
    format2.buildings.tofuPress = 3
    format2.money = '42'

    const restored = decodedState(envelope(2, format2))

    expect(restored.buildings.tofuPress).toBe(3)
    expect(restored.money.eq(42)).toBe(true)
    expect(restored.customers.eq(10)).toBe(true)
    expect(restored.openOrders.eq(0)).toBe(true)
    expect(restored.orderProgress).toBe(0)
    expect(restored.assistant).toBe(false)
  })

  it('restores the units sold to each bulk buyer', () => {
    const state = createInitialState()
    state.unitsSold.megaMeat = new Decimal('4e400')
    state.unitsSold.biogas = new Decimal(38)

    const restored = decodedState(encodeSave(state, NOW))

    expect(restored.unitsSold.megaMeat.eq(state.unitsSold.megaMeat)).toBe(true)
    expect(restored.unitsSold.biogas.eq(38)).toBe(true)
  })

  it('migrates a format 3 save with both bulk counts at 0', () => {
    const format3 = savedState()
    delete format3.unitsSold
    format3.buildings.tofuPress = 3
    format3.assistant = true

    const restored = decodedState(envelope(3, format3))

    expect(restored.buildings.tofuPress).toBe(3)
    expect(restored.assistant).toBe(true)
    expect(restored.unitsSold.megaMeat.eq(0)).toBe(true)
    expect(restored.unitsSold.biogas.eq(0)).toBe(true)
  })

  it('ignores unknown bulk buyers', () => {
    const state = savedState()
    state.unitsSold.moonBaseCafeteria = '12'
    expect(decodedState(envelope(CURRENT_FORMAT, state))).not.toHaveProperty(
      'unitsSold.moonBaseCafeteria',
    )
  })

  it('does not save which buildings are waiting or short', () => {
    const state = createInitialState()
    state.waiting = { tofuPress: 'soybeans' }
    state.shortage = { soybeans: 2.5 }
    const json = encodeSave(state, NOW)
    expect(JSON.parse(json).state).not.toHaveProperty('waiting')
    expect(JSON.parse(json).state).not.toHaveProperty('shortage')
    expect(decodedState(json).waiting).toEqual({})
    expect(decodedState(json).shortage).toEqual({})
  })

  it('migrates a format 1 save to a new economy that keeps its play time', () => {
    expect(decodeSave(envelope(1, { playTime: 77 }))).toEqual({
      ok: true,
      state: withPlayTime(77),
      savedAt: NOW,
    })
  })

  it.each([
    ['negative money', { money: '-1' }],
    ['NaN money', { money: 'NaN' }],
    ['non-numeric money', { money: 'abc' }],
    ['empty money', { money: '' }],
    ['money as a number', { money: 5 }],
    ['fractional money', { money: '2.5' }],
    ['fractional earnings', { totalEarned: '0.1' }],
    ['infinite earnings', { totalEarned: 'Infinity' }],
    ['missing money', { money: undefined }],
    ['fractional customers', { customers: '2.5' }],
    ['negative customers', { customers: '-1' }],
    ['fractional open orders', { openOrders: '0.5' }],
    ['negative order progress', { orderProgress: -1 }],
    ['order progress as text', { orderProgress: '0.5' }],
    ['assistant as text', { assistant: 'yes' }],
    ['missing assistant', { assistant: undefined }],
  ])('rejects %s', (_, override) => {
    expect(decodeSave(envelope(CURRENT_FORMAT, { ...savedState(), ...override }))).toEqual({
      ok: false,
      reason: 'invalid',
    })
  })

  it.each([
    ['negative stock', (s: Record<string, any>) => (s.stock.tofu = '-0.5')],
    ['missing stock entry', (s: Record<string, any>) => delete s.stock.tofu],
    ['fractional stock', (s: Record<string, any>) => (s.stock.tofu = '1.5')],
    ['negative progress', (s: Record<string, any>) => (s.progress.tofuPress = -0.1)],
    ['progress as text', (s: Record<string, any>) => (s.progress.tofuPress = '0.5')],
    ['missing progress', (s: Record<string, any>) => delete s.progress.tofuPress],
    ['negative building count', (s: Record<string, any>) => (s.buildings.tofuPress = -1)],
    ['fractional building count', (s: Record<string, any>) => (s.buildings.tofuPress = 1.5)],
    ['building count as text', (s: Record<string, any>) => (s.buildings.tofuPress = '3')],
    ['missing building count', (s: Record<string, any>) => delete s.buildings.tofuPress],
    ['fractional bulk count', (s: Record<string, any>) => (s.unitsSold.megaMeat = '2.5')],
    ['negative bulk count', (s: Record<string, any>) => (s.unitsSold.biogas = '-1')],
    ['missing bulk count', (s: Record<string, any>) => delete s.unitsSold.biogas],
    ['missing bulk counts', (s: Record<string, any>) => delete s.unitsSold],
  ])('rejects %s', (_, change) => {
    const state = savedState()
    change(state)
    expect(decodeSave(envelope(CURRENT_FORMAT, state))).toEqual({ ok: false, reason: 'invalid' })
  })

  it('ignores unknown resources and buildings', () => {
    const state = savedState()
    state.stock.unobtainium = '5'
    state.buildings.moonBase = 2
    const restored = decodedState(envelope(CURRENT_FORMAT, state))
    expect(restored).not.toHaveProperty('stock.unobtainium')
    expect(restored).not.toHaveProperty('buildings.moonBase')
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
    const json = encodeSave(withPlayTime(90), NOW)
    const text = exportSave(json)
    expect(text).toMatch(/^WURSTCASE1:[A-Za-z0-9+/=]+$/)
    expect(importSave(text)).toEqual({ ok: true, state: withPlayTime(90), savedAt: NOW })
  })

  it('tolerates surrounding whitespace from copy and paste', () => {
    const text = exportSave(encodeSave(withPlayTime(5), NOW))
    expect(importSave(`  ${text}\n`)).toEqual({ ok: true, state: withPlayTime(5), savedAt: NOW })
  })

  it.each([
    ['empty text', ''],
    ['missing prefix', btoa(encodeSave(withPlayTime(1), NOW))],
    ['broken base64', 'WURSTCASE1:%%%'],
    ['valid base64 but not a save', `WURSTCASE1:${btoa('hello')}`],
  ])('rejects %s', (_, text) => {
    expect(importSave(text)).toEqual({ ok: false, reason: 'invalid' })
  })
})
