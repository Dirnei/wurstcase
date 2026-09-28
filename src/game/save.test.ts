import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { CURRENT_FORMAT, decodeSave, encodeSave, exportSave, importSave } from './save'
import { createInitialState, type GameState } from './state'
import { isUpgradeOffered } from './systems/upgrades'

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

  it('restores residents, shelters and conversion progress', () => {
    const state = createInitialState()
    state.residents = [
      { species: 'chicken', name: 0 },
      { species: 'chicken', name: 1 },
      { species: 'pig', name: 11 },
    ]
    state.shelters.stable = 2
    state.shelters.pasture = 1
    const restored = decodedState(encodeSave(state, NOW))
    expect(restored.residents).toEqual(state.residents)
    expect(restored.shelters).toEqual({ stable: 2, pasture: 1 })
  })

  it('migrates a format 4 save to an empty Lebenshof', () => {
    const format4 = savedState()
    delete format4.residents
    delete format4.shelters
    delete format4.conversionProgress
    format4.buildings.tofuPress = 3
    format4.customers = '40'

    const restored = decodedState(envelope(4, format4))

    expect(restored.buildings.tofuPress).toBe(3)
    expect(restored.customers.toNumber()).toBe(40)
    expect(restored.residents).toEqual([])
    expect(restored.shelters).toEqual({ stable: 0, pasture: 0 })
  })

  it('restores the awareness pool, Aktionen and MegaMeat', () => {
    const state = createInitialState()
    state.awareness = new Decimal(1234)
    state.awarenessProgress = 0.25
    state.aktionen.cooldown.openFarmDay = 100
    state.aktionen.runs.flyer = 7
    state.megaMeat = { active: { event: 'study', remaining: 40 }, nextIn: null, nextIndex: 2, started: 2 }
    const restored = decodedState(encodeSave(state, NOW))
    expect(restored.awareness.toNumber()).toBe(1234)
    expect(restored.awarenessProgress).toBe(0.25)
    expect(restored.aktionen).toEqual(state.aktionen)
    expect(restored.megaMeat).toEqual(state.megaMeat)
  })

  it('migrates a format 5 save to an empty pool and a quiet MegaMeat', () => {
    const format5 = savedState()
    for (const key of ['awareness', 'awarenessProgress', 'aktionen', 'megaMeat']) {
      delete format5[key]
    }
    format5.residents = [0, 1, 2].map((name) => ({ species: 'chicken', name }))
    format5.customers = '40'

    const restored = decodedState(envelope(5, format5))

    expect(restored.residents).toHaveLength(3)
    expect(restored.customers.toNumber()).toBe(40)
    expect(restored.awareness.toNumber()).toBe(0)
    expect(restored.aktionen.runs.flyer).toBe(0)
    expect(restored.megaMeat).toEqual({ active: null, nextIn: null, nextIndex: 0, started: 0 })
  })

  it('restores owned upgrades in order', () => {
    const state = createInitialState()
    state.upgrades = ['betterSeeds', 'strongHands', 'leverkasRecipe']
    expect(decodedState(encodeSave(state, NOW)).upgrades).toEqual(['betterSeeds', 'strongHands', 'leverkasRecipe'])
  })

  it('migrates a format 6 save with no upgrades owned', () => {
    const format6 = savedState()
    delete format6.upgrades
    format6.buildings.soybeanField = 6
    const restored = decodedState(envelope(6, format6))
    expect(restored.upgrades).toEqual([])
    expect(isUpgradeOffered(restored, 'betterSeeds')).toBe(true)
  })

  it('migrates a format 7 save to own the chain milestones its chains had completed', () => {
    const format7 = savedState()
    format7.buildings.soybeanField = 60
    format7.buildings.tofuPress = 55
    format7.buildings.tofuWurstKitchen = 30
    format7.upgrades = ['betterSeeds']
    const restored = decodedState(envelope(7, format7))
    expect(restored.upgrades).toEqual(['betterSeeds', 'soyChain25'])
    expect(isUpgradeOffered(restored, 'soyChain50')).toBe(false)
    restored.buildings.tofuWurstKitchen = 50
    expect(isUpgradeOffered(restored, 'soyChain50')).toBe(true)
  })

  it('restores the customer income exactly', () => {
    const state = createInitialState()
    state.customerIncome = new Decimal('12.345')
    expect(decodedState(encodeSave(state, NOW)).customerIncome.eq('12.345')).toBe(true)
  })

  it('migrates a format 8 save with no customer income', () => {
    const format8 = savedState()
    delete format8.customerIncome
    format8.customers = '40'
    const restored = decodedState(envelope(8, format8))
    expect(restored.customerIncome.toNumber()).toBe(0)
    expect(restored.customers.toNumber()).toBe(40)
  })

  it('migrates a format 10 save and drops the passive conversion progress', () => {
    const format10 = savedState()
    format10.conversionProgress = 0.7
    format10.customers = '1234'
    format10.awareness = '567'
    format10.aktionen.runs.flyer = 6
    const restored = decodedState(envelope(10, format10))
    expect(restored).not.toHaveProperty('conversionProgress')
    expect(restored.customers.toNumber()).toBe(1234)
    expect(restored.awareness.toNumber()).toBe(567)
    expect(restored.aktionen.runs.flyer).toBe(6)
    expect(JSON.parse(encodeSave(restored, NOW))).toMatchObject({ format: CURRENT_FORMAT })
    expect(JSON.parse(encodeSave(restored, NOW)).state).not.toHaveProperty('conversionProgress')
  })

  it('restores whether the Aktionen tab was unlocked', () => {
    const state = createInitialState()
    state.aktionen.unlocked = true
    state.awareness = new Decimal(10)
    expect(decodedState(encodeSave(state, NOW)).aktionen.unlocked).toBe(true)
    expect(decodedState(encodeSave(createInitialState(), NOW)).aktionen.unlocked).toBe(false)
  })

  it.each<[string, { totalEarned: string; awareness: string; runs?: number }, boolean]>([
    ['€2,000 earned and an empty pool', { totalEarned: '2000', awareness: '0' }, true],
    ['a pool of 50', { totalEarned: '0', awareness: '50' }, true],
    ['a flyer run', { totalEarned: '0', awareness: '0', runs: 1 }, true],
    ['€50 earned, a pool of 10 and no runs', { totalEarned: '50', awareness: '10' }, false],
  ])('migrates a format 11 save with %s', (_, setup, unlocked) => {
    const format11 = savedState()
    delete format11.aktionen.unlocked
    format11.totalEarned = setup.totalEarned
    format11.awareness = setup.awareness
    format11.aktionen.runs.flyer = setup.runs ?? 0
    expect(decodedState(envelope(11, format11)).aktionen.unlocked).toBe(unlocked)
  })

  it.each([['yes'], [1], [null]])('rejects an Aktionen unlock flag of %j', (flag) => {
    const state = savedState()
    state.aktionen.unlocked = flag
    expect(decodeSave(envelope(CURRENT_FORMAT, state))).toEqual({ ok: false, reason: 'invalid' })
  })

  it('restores the MegaMeat floods exactly, also beyond 2^53', () => {
    const state = createInitialState()
    state.megaMeatFlood.soybeans = new Decimal('400.25')
    state.megaMeatFlood.wheat = new Decimal('1.5e20')
    const restored = decodedState(encodeSave(state, NOW))
    expect(restored.megaMeatFlood.soybeans!.eq('400.25')).toBe(true)
    expect(restored.megaMeatFlood.wheat!.eq('1.5e20')).toBe(true)
    expect(restored.megaMeatFlood.tofu).toBeUndefined()
  })

  it('migrates a format 12 save to fresh MegaMeat markets', () => {
    const format12 = savedState()
    delete format12.megaMeatFlood
    format12.customers = '321'
    const restored = decodedState(envelope(12, format12))
    expect(restored.megaMeatFlood).toEqual({})
    expect(restored.customers.toNumber()).toBe(321)
  })

  it('restores the MegaMeat scandal exactly', () => {
    const state = createInitialState()
    state.megaMeatScandal = new Decimal(4_000)
    expect(decodedState(encodeSave(state, NOW)).megaMeatScandal.toNumber()).toBe(4_000)
  })

  it('migrates a format 14 save to no scandal and fresh biogas markets, keeping everything else', () => {
    const format14 = savedState()
    delete format14.megaMeatScandal
    delete format14.biogasFlood
    format14.megaMeatFlood = { soybeans: '400' }
    format14.customers = '654'
    const restored = decodedState(envelope(14, format14))
    expect(restored.megaMeatScandal.toNumber()).toBe(0)
    expect(restored.biogasFlood).toEqual({})
    expect(restored.megaMeatFlood.soybeans!.toNumber()).toBe(400)
    expect(restored.customers.toNumber()).toBe(654)
  })

  it('restores a biogas product flood exactly', () => {
    const state = createInitialState()
    state.biogasFlood.leverkas = new Decimal('1234.5')
    expect(decodedState(encodeSave(state, NOW)).biogasFlood.leverkas!.eq('1234.5')).toBe(true)
  })

  it.each([['-1'], ['abc'], [5]])('rejects a MegaMeat scandal of %j', (scandal) => {
    const state = savedState()
    state.megaMeatScandal = scandal
    expect(decodeSave(envelope(CURRENT_FORMAT, state))).toEqual({ ok: false, reason: 'invalid' })
  })

  it('migrates a format 13 save with floods in units to fresh markets', () => {
    const format13 = savedState()
    format13.megaMeatFlood = { soybeans: '500', wheat: '60' }
    format13.customers = '321'
    const restored = decodedState(envelope(13, format13))
    expect(restored.megaMeatFlood).toEqual({})
    expect(restored.customers.toNumber()).toBe(321)
  })

  it.each([['-1'], ['abc'], [5]])('rejects a MegaMeat flood of %j', (flood) => {
    const state = savedState()
    state.megaMeatFlood = { soybeans: flood }
    expect(decodeSave(envelope(CURRENT_FORMAT, state))).toEqual({ ok: false, reason: 'invalid' })
  })

  it('restores the storeroom level exactly', () => {
    const state = createInitialState()
    state.storeroom = 5
    expect(decodedState(encodeSave(state, NOW)).storeroom).toBe(5)
  })

  it('migrates a format 9 save to storeroom level 1 and keeps every stock, even above the room', () => {
    const format9 = savedState()
    delete format9.storeroom
    format9.stock.tofuWurst = '2000'
    format9.stock.soybeans = '120'
    const restored = decodedState(envelope(9, format9))
    expect(restored.storeroom).toBe(1)
    expect(restored.stock.tofuWurst.toNumber()).toBe(2000)
    expect(restored.stock.soybeans.toNumber()).toBe(120)
  })

  it.each([[0], [1.5], [-2], ['3'], [null]])('rejects a storeroom level of %j', (level) => {
    const state = savedState()
    state.storeroom = level
    expect(decodeSave(envelope(CURRENT_FORMAT, state))).toEqual({ ok: false, reason: 'invalid' })
  })

  it('saves a new game at storeroom level 1 and does not save the full mark', () => {
    const saved = savedState()
    expect(saved.storeroom).toBe(1)
    expect(saved).not.toHaveProperty('full')
    expect(saved).not.toHaveProperty('blocked')
  })

  it.each([['-1'], ['abc'], [3]])('rejects a customer income of %s', (income) => {
    const state = savedState()
    state.customerIncome = income
    expect(decodeSave(envelope(CURRENT_FORMAT, state))).toEqual({ ok: false, reason: 'invalid' })
  })

  it('migrates a format 7 save with one building past a milestone alone without milestone upgrades', () => {
    const format7 = savedState()
    format7.buildings.soybeanField = 60
    expect(decodedState(envelope(7, format7)).upgrades).toEqual([])
  })

  it('drops unknown and repeated upgrades', () => {
    const state = savedState()
    state.upgrades = ['strongHands', 'goldenSpatula', 'strongHands', 'mustard']
    expect(decodedState(envelope(CURRENT_FORMAT, state)).upgrades).toEqual(['strongHands', 'mustard'])
  })

  it('rejects upgrades that are not a list', () => {
    const state = savedState()
    state.upgrades = { strongHands: true }
    expect(decodeSave(envelope(CURRENT_FORMAT, state))).toEqual({ ok: false, reason: 'invalid' })
  })

  it('ignores unknown Aktionen', () => {
    const state = savedState()
    state.aktionen.cooldown.petition = 5
    state.aktionen.runs.petition = 2
    const restored = decodedState(envelope(CURRENT_FORMAT, state))
    expect(restored.aktionen.cooldown).not.toHaveProperty('petition')
    expect(restored.aktionen.runs).not.toHaveProperty('petition')
  })

  it('drops an unknown active event and schedules the next one', () => {
    const state = savedState()
    state.megaMeat = { active: { event: 'lawsuit', remaining: 50 }, nextIn: null, nextIndex: 1, started: 3 }
    const restored = decodedState(envelope(CURRENT_FORMAT, state))
    expect(restored.megaMeat).toEqual({ active: null, nextIn: 300, nextIndex: 1, started: 3 })
  })

  it('resets an out-of-range next event to the first', () => {
    const state = savedState()
    state.megaMeat.nextIndex = 7
    expect(decodedState(envelope(CURRENT_FORMAT, state)).megaMeat.nextIndex).toBe(0)
  })

  it('skips residents of an unknown species and ignores unknown shelters', () => {
    const state = savedState()
    state.residents = [
      { species: 'unicorn', name: 0 },
      { species: 'cow', name: 2 },
    ]
    state.shelters.moonBarn = 3
    const restored = decodedState(envelope(CURRENT_FORMAT, state))
    expect(restored.residents).toEqual([{ species: 'cow', name: 2 }])
    expect(restored).not.toHaveProperty('shelters.moonBarn')
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

  it('does not save the sales figures', () => {
    const state = createInitialState()
    state.sales = [{ seconds: 1, values: { leverkas: new Decimal(2) } }]
    const json = encodeSave(state, NOW)
    expect(JSON.parse(json).state).not.toHaveProperty('sales')
    expect(decodedState(json).sales).toEqual([])
  })

  it('does not save the stock trend', () => {
    const state = createInitialState()
    state.trend = [{ seconds: 1, values: { soybeans: new Decimal(3) } }]
    const json = encodeSave(state, NOW)
    expect(JSON.parse(json).state).not.toHaveProperty('trend')
    expect(decodedState(json).trend).toEqual([])
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
    ['fractional name index', (s: Record<string, any>) => (s.residents = [{ species: 'pig', name: 1.5 }])],
    ['negative name index', (s: Record<string, any>) => (s.residents = [{ species: 'pig', name: -1 }])],
    ['name index beyond the pool', (s: Record<string, any>) => (s.residents = [{ species: 'pig', name: 12 }])],
    ['name index as text', (s: Record<string, any>) => (s.residents = [{ species: 'pig', name: '1' }])],
    ['residents not a list', (s: Record<string, any>) => (s.residents = {})],
    ['resident not an object', (s: Record<string, any>) => (s.residents = ['pig'])],
    ['negative shelter count', (s: Record<string, any>) => (s.shelters.stable = -1)],
    ['fractional shelter count', (s: Record<string, any>) => (s.shelters.stable = 1.5)],
    ['missing shelter count', (s: Record<string, any>) => delete s.shelters.pasture],
    ['missing shelters', (s: Record<string, any>) => delete s.shelters],
    ['fractional awareness pool', (s: Record<string, any>) => (s.awareness = '2.5')],
    ['missing awareness pool', (s: Record<string, any>) => delete s.awareness],
    ['negative awareness progress', (s: Record<string, any>) => (s.awarenessProgress = -1)],
    ['negative cooldown', (s: Record<string, any>) => (s.aktionen.cooldown.flyer = -1)],
    ['cooldown as text', (s: Record<string, any>) => (s.aktionen.cooldown.flyer = '5')],
    ['fractional runs', (s: Record<string, any>) => (s.aktionen.runs.flyer = 1.5)],
    ['missing Aktionen', (s: Record<string, any>) => delete s.aktionen],
    ['missing MegaMeat', (s: Record<string, any>) => delete s.megaMeat],
    ['fractional events started', (s: Record<string, any>) => (s.megaMeat.started = 0.5)],
    ['negative time to the next event', (s: Record<string, any>) => (s.megaMeat.nextIn = -5)],
    ['negative event time left', (s: Record<string, any>) => (s.megaMeat.active = { event: 'study', remaining: -1 })],
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
