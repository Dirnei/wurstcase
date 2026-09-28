import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../state'
import { tick } from '../tick'
import {
  bestBuyer,
  bulkSaleCost,
  bulkSaleUnits,
  bulkSaleValue,
  bulkSell,
  canBulkSell,
  fullPrice,
  hasLot,
  lotFor,
  marketLevel,
  recoverMarkets,
  timeToRecover,
} from './bulkSales'
import { isUnlocked } from './buildings'

function stateWith(setup: (state: GameState) => void): GameState {
  const state = createInitialState()
  setup(state)
  return state
}

describe('bulkSell', () => {
  it('sells whole lots and keeps the rest', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(47)))
    expect(bulkSell(state, 'megaMeat', 'soybeans')).toBe(true)
    expect(state.stock.soybeans.toNumber()).toBe(7)
    expect(state.money.toNumber()).toBe(121)
    expect(state.totalEarned.toNumber()).toBe(121)
    expect(state.unitsSold.megaMeat.toNumber()).toBe(40)
  })

  it('is unavailable below one lot and then changes nothing', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(19)))
    expect(canBulkSell(state, 'megaMeat', 'soybeans')).toBe(false)
    expect(bulkSell(state, 'megaMeat', 'soybeans')).toBe(false)
    expect(state.stock.soybeans.toNumber()).toBe(19)
    expect(state.money.toNumber()).toBe(0)
    expect(state.unitsSold.megaMeat.toNumber()).toBe(0)
  })

  it('uses the biogas plant’s own lots', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(37)))
    bulkSell(state, 'biogas', 'soybeans')
    expect(state.stock.soybeans.toNumber()).toBe(2)
    expect(state.money.toNumber()).toBe(15)
    expect(state.unitsSold.biogas.toNumber()).toBe(35)
  })

  it('counts towards unlocks', () => {
    const state = stateWith((s) => {
      s.totalEarned = new Decimal(29_950)
      s.stock.soybeans = new Decimal(20)
    })
    expect(isUnlocked(state, 'oatField')).toBe(false)
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.totalEarned.toNumber()).toBe(30_011)
    expect(isUnlocked(state, 'oatField')).toBe(true)
  })

  it('previews units and earnings without changing anything', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(47)))
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans').toNumber()).toBe(40)
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(121)
    expect(state.stock.soybeans.toNumber()).toBe(47)
    expect(state.money.toNumber()).toBe(0)
  })

  it('lets only the biogas plant buy finished products', () => {
    const state = stateWith((s) => (s.stock.tofuWurst = new Decimal(40)))
    expect(hasLot('megaMeat', 'tofuWurst')).toBe(false)
    expect(canBulkSell(state, 'megaMeat', 'tofuWurst')).toBe(false)
    expect(bulkSell(state, 'megaMeat', 'tofuWurst')).toBe(false)
    expect(state.stock.tofuWurst.toNumber()).toBe(40)

    expect(hasLot('biogas', 'tofuWurst')).toBe(true)
    expect(bulkSell(state, 'biogas', 'tofuWurst')).toBe(true)
    expect(state.stock.tofuWurst.toNumber()).toBe(0)
    expect(state.money.toNumber()).toBe(80)
    expect(state.unitsSold.biogas.toNumber()).toBe(40)
  })

  it('counts units sold per buyer', () => {
    const state = stateWith((s) => {
      s.stock.soybeans = new Decimal(30)
      s.stock.wheat = new Decimal(40)
      s.stock.tofu = new Decimal(20)
    })
    bulkSell(state, 'megaMeat', 'soybeans')
    bulkSell(state, 'megaMeat', 'wheat')
    bulkSell(state, 'biogas', 'tofu')
    expect(state.unitsSold.megaMeat.toNumber()).toBe(60)
    expect(state.unitsSold.biogas.toNumber()).toBe(20)
  })
})

describe('MegaMeat outbids vegan food', () => {
  it('buys in lots of 20, raw at the chain product × 1.05 and intermediates at half that', () => {
    const state = createInitialState()
    const resources = ['soybeans', 'tofu', 'oats', 'oatDrink', 'wheat', 'seitan'] as const
    expect(Object.fromEntries(resources.map((r) => [r, lotFor(state, 'megaMeat', r)]))).toEqual({
      soybeans: { units: 20, price: 63 },
      tofu: { units: 20, price: 31 },
      oats: { units: 20, price: 252 },
      oatDrink: { units: 20, price: 126 },
      wheat: { units: 20, price: 525 },
      seitan: { units: 20, price: 262 },
    })
  })

  it('follows price upgrades', () => {
    const state = stateWith((s) => (s.upgrades = ['mustard']))
    expect(lotFor(state, 'megaMeat', 'soybeans')).toEqual({ units: 20, price: 84 })
    expect(lotFor(state, 'megaMeat', 'tofu')).toEqual({ units: 20, price: 42 })
  })

  it('has no lot for products, and leaves the biogas lots alone', () => {
    const state = createInitialState()
    expect(lotFor(state, 'megaMeat', 'tofuWurst')).toBeUndefined()
    expect(lotFor(state, 'biogas', 'soybeans')).toEqual({ units: 7, price: 3 })
  })
})

describe('bestBuyer', () => {
  it('is MegaMeat for what both buy and the biogas plant for products', () => {
    const state = createInitialState()
    expect(bestBuyer(state, 'soybeans')).toMatchObject({ buyer: 'megaMeat' })
    expect(bestBuyer(state, 'soybeans')!.perUnit).toBeCloseTo(3.15, 10)
    expect(bestBuyer(state, 'tofuWurst')).toEqual({ buyer: 'biogas', perUnit: 2 })
  })

  it('can leave out buyers that cost customers', () => {
    expect(bestBuyer(createInitialState(), 'soybeans', { withoutFeedCost: true })).toEqual({ buyer: 'biogas', perUnit: 3 / 7 })
  })
})

describe('price of feeding MegaMeat', () => {
  function feeding(customers: number, income: number, awareness: number, setup: (state: GameState) => void): GameState {
    return stateWith((s) => {
      s.customers = new Decimal(customers)
      s.customerIncome = new Decimal(income)
      s.awareness = new Decimal(awareness)
      setup(s)
    })
  }

  it('costs the share of customers that the sale is of 8 minutes of their spending', () => {
    // 200 soybeans at a fresh market: €529, about 11% of eight minutes at €10/s.
    const state = feeding(1_000, 10, 100, (s) => (s.stock.soybeans = new Decimal(200)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(529)
    expect(state.customers.toNumber()).toBe(889)
    expect(state.awareness.toNumber()).toBe(47)
  })

  it('rounds up, so a small sale still costs', () => {
    const state = feeding(1_000, 10, 100, (s) => (s.stock.soybeans = new Decimal(20)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(61)
    expect(state.customers.toNumber()).toBe(987)
    expect(state.awareness.toNumber()).toBe(93)
  })

  it('never drops below the starting neighbours or below no awareness', () => {
    const state = feeding(12, 10, 5, (s) => (s.stock.seitan = new Decimal(120)))
    bulkSell(state, 'megaMeat', 'seitan')
    expect(state.customers.toNumber()).toBe(10)
    expect(state.awareness.toNumber()).toBe(0)
  })

  it('costs every customer above the neighbours while customers spend nothing', () => {
    const state = feeding(30, 0, 100, (s) => (s.stock.soybeans = new Decimal(20)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.customers.toNumber()).toBe(10)
  })

  it('costs nothing at the biogas plant', () => {
    const state = feeding(50, 10, 100, (s) => (s.stock.tofuWurst = new Decimal(30)))
    bulkSell(state, 'biogas', 'tofuWurst')
    expect(state.money.toNumber()).toBe(60)
    expect(state.customers.toNumber()).toBe(50)
    expect(state.awareness.toNumber()).toBe(100)
  })

  it('previews the cost of a sale without changing anything', () => {
    const state = feeding(1_000, 10, 100, (s) => {
      s.stock.soybeans = new Decimal(200)
      s.stock.tofuWurst = new Decimal(30)
    })
    expect(bulkSaleCost(state, 'megaMeat', 'soybeans')).toEqual({ customers: 111, awareness: 53 })
    expect(bulkSaleCost(state, 'biogas', 'tofuWurst')).toEqual({ customers: 0, awareness: 0 })
    expect(state.customers.toNumber()).toBe(1_000)
  })
})

describe('flooded market', () => {
  const flooded = (flood: number) => stateWith((s) => (s.megaMeatFlood.soybeans = new Decimal(flood)))

  it('names the full prices per unit at base product prices and with mustard', () => {
    const base = createInitialState()
    const full = Object.fromEntries(
      (['soybeans', 'tofu', 'oats', 'oatDrink', 'wheat', 'seitan'] as const).map((r) => [r, fullPrice(base, r)]),
    )
    expect(full.soybeans).toBeCloseTo(3.15, 10)
    expect(full.tofu).toBeCloseTo(1.575, 10)
    expect(full.oats).toBeCloseTo(12.6, 10)
    expect(full.oatDrink).toBeCloseTo(6.3, 10)
    expect(full.wheat).toBeCloseTo(26.25, 10)
    expect(full.seitan).toBeCloseTo(13.125, 10)
    expect(fullPrice(stateWith((s) => (s.upgrades = ['mustard'])), 'soybeans')).toBeCloseTo(4.2, 10)
    expect(fullPrice(base, 'tofuWurst')).toBeUndefined()
  })

  it('pays €61 for 20 soybeans at a fresh market and floods it by 20', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(20)))
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(61)
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(61)
    expect(state.megaMeatFlood.soybeans!.toNumber()).toBe(20)
  })

  it('shows 50% at a flood of 500, where 20 soybeans pay €31', () => {
    const state = flooded(500)
    state.stock.soybeans = new Decimal(20)
    expect(marketLevel(state, 'soybeans')).toBeCloseTo(0.5, 10)
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(31)
  })

  it('pays €1,730 for a fresh dump of 1,000 soybeans', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(1_000)))
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(1_730)
  })

  it('halves the flood in 20 s, leaving 67% and about 1:05 until 95%', () => {
    const state = flooded(500)
    recoverMarkets(state, 20)
    expect(state.megaMeatFlood.soybeans!.toNumber()).toBeCloseTo(250, 9)
    expect(marketLevel(state, 'soybeans')).toBeCloseTo(2 / 3, 9)
    expect(timeToRecover(state, 'soybeans', 0.95)).toBeCloseTo(65, 0)
    expect(timeToRecover(createInitialState(), 'soybeans', 0.95)).toBe(0)
  })

  it('falls the same in one tick or in 200 ticks of 0.1 s', () => {
    const once = flooded(500)
    recoverMarkets(once, 20)
    const often = flooded(500)
    for (let i = 0; i < 200; i++) recoverMarkets(often, 0.1)
    expect(often.megaMeatFlood.soybeans!.toNumber()).toBeCloseTo(once.megaMeatFlood.soybeans!.toNumber(), 6)
  })

  it('recovers through tick() and snaps a tiny flood to a fresh market', () => {
    const state = flooded(500)
    tick(state, 3_600)
    expect(state.megaMeatFlood.soybeans).toBeUndefined()
    expect(marketLevel(state, 'soybeans')).toBe(1)
  })

  it('keeps each market separate', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(1_000)))
    bulkSell(state, 'megaMeat', 'soybeans')
    for (const resource of ['tofu', 'oats', 'wheat'] as const) {
      expect(marketLevel(state, resource), resource).toBe(1)
    }
  })

  it('never floods at the biogas plant', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(1_000)))
    bulkSell(state, 'biogas', 'soybeans')
    expect(lotFor(state, 'biogas', 'soybeans')).toEqual({ units: 7, price: 3 })
    expect(state.megaMeatFlood.soybeans).toBeUndefined()
  })
})
