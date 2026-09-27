import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { RESOURCES } from './content/resources'
import { createInitialState, type GameState } from './state'
import { runAktion } from './systems/aktionen'
import { bulkSell } from './systems/bulkSales'
import { performManual } from './systems/manual'
import { demandPerMinute, soldPerMinute } from './systems/salesStats'
import { stockTrend } from './systems/trend'
import { tick } from './tick'

/** Advances the game in live-loop steps of 0.1 s. */
function runFor(state: GameState, seconds: number): void {
  for (let i = 0; i < seconds * 10; i++) {
    tick(state, 0.1)
  }
}

function expectRelativelyEqual(actual: number, expected: number): void {
  const tolerance = 1e-9 * Math.max(Math.abs(actual), Math.abs(expected))
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance)
}

describe('tick', () => {
  it('starts a new game with no play time, money, stock or buildings', () => {
    const state = createInitialState()
    expect(state.playTime).toBe(0)
    expect(state.money.eq(0)).toBe(true)
    expect(state.totalEarned.eq(0)).toBe(true)
    expect(Object.values(state.stock).every((amount) => amount.eq(0))).toBe(true)
    expect(Object.values(state.buildings).every((count) => count === 0)).toBe(true)
    expect(state.waiting).toEqual({})
    expect(state.customers.toNumber()).toBe(10)
    expect(state.openOrders.toNumber()).toBe(0)
    expect(state.orderProgress).toBe(0)
    expect(state.assistant).toBe(false)
    expect(state.unitsSold.megaMeat.toNumber()).toBe(0)
    expect(state.unitsSold.biogas.toNumber()).toBe(0)
    expect(state.residents).toEqual([])
    expect(state.shelters).toEqual({ stable: 0, pasture: 0 })
    expect(state.conversionProgress).toBe(0)
    expect(state.awareness.toNumber()).toBe(0)
    expect(state.awarenessProgress).toBe(0)
    expect(state.aktionen.cooldown).toEqual({ flyer: 0, openFarmDay: 0, viralReel: 0, factCheck: 0 })
    expect(state.aktionen.runs).toEqual({ flyer: 0, openFarmDay: 0, viralReel: 0, factCheck: 0 })
    expect(state.megaMeat).toEqual({ active: null, nextIn: null, nextIndex: 0, started: 0 })
  })

  it('advances play time by the given seconds', () => {
    const state = createInitialState()
    tick(state, 2.5)
    expect(state.playTime).toBe(2.5)
  })

  it('gives the same result for one big step and many small steps', () => {
    const once = createInitialState()
    tick(once, 1)

    const split = createInitialState()
    for (let i = 0; i < 10; i++) {
      tick(split, 0.1)
    }

    expectRelativelyEqual(split.playTime, once.playTime)
  })

  it('builds orders four times as fast with 40 customers as with 10', () => {
    const ten = createInitialState()
    tick(ten, 10)
    const forty = createInitialState()
    forty.customers = new Decimal(40)
    tick(forty, 10)
    expect(ten.openOrders.toNumber()).toBe(5)
    expect(forty.openOrders.toNumber()).toBe(20)
  })

  it('converts townspeople through the Lebenshof while time passes', () => {
    const state = createInitialState()
    state.residents.push({ species: 'cow', name: 0 })
    tick(state, 60)
    expect(state.customers.toNumber()).toBeGreaterThan(10)
  })

  it('never loses a resident over 12 hours', () => {
    const state = createInitialState()
    state.residents.push(
      { species: 'chicken', name: 3 },
      { species: 'chicken', name: 7 },
      { species: 'pig', name: 0 },
      { species: 'cow', name: 11 },
      { species: 'chicken', name: 3 },
    )
    const before = structuredClone(state.residents)
    for (let i = 0; i < 12 * 60; i++) {
      tick(state, 60)
    }
    expect(state.residents).toEqual(before)
  })

  it('answers the first flyers with the ad campaign a minute later, which slows the pool', () => {
    const state = createInitialState()
    state.totalEarned = new Decimal(1_000)
    state.awareness = new Decimal(100)
    for (let i = 0; i < 10; i++) {
      state.residents.push({ species: 'chicken', name: i })
    }
    expect(runAktion(state, 'flyer')).toBe(true)
    runFor(state, 59.9)
    expect(state.megaMeat.active).toBeNull()
    const poolBefore = state.awareness.toNumber()
    runFor(state, 0.1)
    expect(state.megaMeat.active?.event).toBe('adCampaign')
    const atStart = state.awareness.toNumber()
    runFor(state, 10)
    expect(atStart - poolBefore).toBeLessThanOrEqual(1)
    expect(state.awareness.toNumber() - atStart).toBe(50)
  })

  it('sells no Tofu-Wurst while Leverkas and Hafer-Cappuccino cover all orders', () => {
    const state = createInitialState()
    state.assistant = true
    state.buildings.leverkasOven = 2
    state.buildings.cafeBar = 2
    state.stock.seitan = new Decimal(1_000)
    state.stock.oatDrink = new Decimal(1_000)
    state.stock.tofuWurst = new Decimal(50)
    runFor(state, 60)
    expect(soldPerMinute(state, 'tofuWurst')).toBe(0)
    expect(soldPerMinute(state, 'leverkas') + soldPerMinute(state, 'haferCappuccino')).toBeGreaterThan(25)
    expect(demandPerMinute(state).toNumber()).toBe(30)
  })

  it('shows every stock as steady in a new game', () => {
    const state = createInitialState()
    for (const resource of RESOURCES) {
      expect(stockTrend(state, resource)).toBe('steady')
    }
  })

  it('shows soybeans rising while a field fills the stock', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 1
    runFor(state, 10)
    expect(stockTrend(state, 'soybeans')).toBe('rising')
  })

  it('shows tofu falling and Tofu-Wurst rising while kitchens use up tofu', () => {
    const state = createInitialState()
    state.stock.tofu = new Decimal(100)
    state.buildings.tofuWurstKitchen = 2
    runFor(state, 10)
    expect(stockTrend(state, 'tofu')).toBe('falling')
    expect(stockTrend(state, 'tofuWurst')).toBe('rising')
  })

  it('ignores player actions between ticks', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 1
    state.totalEarned = new Decimal(100)
    runFor(state, 10)
    expect(stockTrend(state, 'soybeans')).toBe('rising')
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.stock.soybeans.lt(10)).toBe(true)
    tick(state, 0.1)
    expect(stockTrend(state, 'soybeans')).toBe('rising')

    const idle = createInitialState()
    runFor(idle, 5)
    for (let i = 0; i < 20; i++) {
      performManual(idle, 'harvestSoybeans')
      tick(idle, 0.1)
    }
    expect(stockTrend(idle, 'soybeans')).toBe('steady')
  })

  it('agrees within one order for one big and many small ticks while the assistant sells', () => {
    const setup = () => {
      const state = createInitialState()
      state.buildings.soybeanField = 3
      state.buildings.tofuPress = 1
      state.buildings.tofuWurstKitchen = 1
      state.stock.tofuWurst = new Decimal(4)
      state.assistant = true
      return state
    }
    const once = setup()
    tick(once, 60)
    const split = setup()
    for (let i = 0; i < 600; i++) {
      tick(split, 0.1)
    }

    expect(once.money.toNumber()).toBeGreaterThan(0)
    expect(split.openOrders.sub(once.openOrders).abs().toNumber()).toBeLessThanOrEqual(1)
    expect(split.money.sub(once.money).abs().toNumber()).toBeLessThanOrEqual(3)
  })
})
