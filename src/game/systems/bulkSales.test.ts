import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { BULK_SHARES } from '../content/buyers'
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

  it('costs the share of customers that the sale is of 1 minute of their spending', () => {
    // 200 soybeans at a fresh market: €529, about 88% of one minute at €10/s.
    const state = feeding(1_000, 10, 100, (s) => (s.stock.soybeans = new Decimal(200)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(529)
    expect(state.customers.toNumber()).toBe(118)
    expect(state.awareness.toNumber()).toBe(47)
  })

  it('rounds up, so a small sale still costs', () => {
    const state = feeding(1_000, 10, 100, (s) => (s.stock.soybeans = new Decimal(20)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(61)
    expect(state.customers.toNumber()).toBe(898)
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
    expect(bulkSaleCost(state, 'megaMeat', 'soybeans')).toEqual({ customers: 882, awareness: 53 })
    expect(bulkSaleCost(state, 'biogas', 'tofuWurst')).toEqual({ customers: 0, awareness: 0 })
    expect(state.customers.toNumber()).toBe(1_000)
  })
})

describe('flooded market', () => {
  // Floods are in euros of full price: €1,575 is 500 soybeans at €3.15.
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

  it('pays €61 for 20 soybeans at a fresh market and floods it by €63', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(20)))
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(61)
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(61)
    expect(state.megaMeatFlood.soybeans!.toNumber()).toBeCloseTo(63, 9)
  })

  it('shows 50% at a flood of €1,575, where 20 soybeans pay €31', () => {
    const state = flooded(1_575)
    state.stock.soybeans = new Decimal(20)
    expect(marketLevel(state, 'soybeans')).toBeCloseTo(0.5, 10)
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(31)
  })

  it('pays €1,730 for a fresh dump of 1,000 soybeans', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(1_000)))
    expect(bulkSaleValue(state, 'megaMeat', 'soybeans').toNumber()).toBe(1_730)
  })

  it('halves the flood in 20 s, leaving 67% and about 1:05 until 95%', () => {
    const state = flooded(1_575)
    recoverMarkets(state, 20)
    expect(state.megaMeatFlood.soybeans!.toNumber()).toBeCloseTo(787.5, 9)
    expect(marketLevel(state, 'soybeans')).toBeCloseTo(2 / 3, 9)
    expect(timeToRecover(state, 'soybeans', 0.95)).toBeCloseTo(65, 0)
    expect(timeToRecover(createInitialState(), 'soybeans', 0.95)).toBe(0)
  })

  it('falls the same in one tick or in 200 ticks of 0.1 s', () => {
    const once = flooded(1_575)
    recoverMarkets(once, 20)
    const often = flooded(1_575)
    for (let i = 0; i < 200; i++) recoverMarkets(often, 0.1)
    expect(often.megaMeatFlood.soybeans!.toNumber()).toBeCloseTo(once.megaMeatFlood.soybeans!.toNumber(), 6)
  })

  it('recovers through tick() and snaps a tiny flood to a fresh market', () => {
    const state = flooded(1_575)
    tick(state, 3_600)
    expect(state.megaMeatFlood.soybeans).toBeUndefined()
    expect(marketLevel(state, 'soybeans')).toBe(1)
  })

  it('floods wheat as fast in euros: 60 wheat pay €1,091 and halve the market', () => {
    const state = stateWith((s) => (s.stock.wheat = new Decimal(60)))
    expect(bulkSaleValue(state, 'megaMeat', 'wheat').toNumber()).toBe(1_091)
    bulkSell(state, 'megaMeat', 'wheat')
    expect(marketLevel(state, 'wheat')).toBeCloseTo(0.5, 9)
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

describe('selling a share of the stock', () => {
  const soy = (units: number) => stateWith((s) => (s.stock.soybeans = new Decimal(units)))

  it('sells 50% of 130 soybeans as 60 for €178', () => {
    const state = soy(130)
    expect(bulkSell(state, 'megaMeat', 'soybeans', 0.5)).toBe(true)
    expect(state.stock.soybeans.toNumber()).toBe(70)
    expect(state.money.toNumber()).toBe(178)
  })

  it('sells 10% of 500 soybeans as 40', () => {
    const state = soy(500)
    bulkSell(state, 'megaMeat', 'soybeans', 0.1)
    expect(state.stock.soybeans.toNumber()).toBe(460)
  })

  it('leaves a share smaller than a lot unavailable', () => {
    const state = soy(150)
    expect(canBulkSell(state, 'megaMeat', 'soybeans', 0.1)).toBe(false)
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans', 0.5).toNumber()).toBe(60)
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans', 1).toNumber()).toBe(140)
    for (const share of BULK_SHARES) {
      expect(canBulkSell(soy(19), 'megaMeat', 'soybeans', share), `${share}`).toBe(false)
    }
  })

  it('shows each share its own sale along the flooded market', () => {
    const state = soy(500)
    expect(BULK_SHARES.map((share) => bulkSaleValue(state, 'megaMeat', 'soybeans', share).toNumber())).toEqual([
      121, 617, 1_091,
    ])
    expect(BULK_SHARES.map((share) => bulkSaleUnits(state, 'megaMeat', 'soybeans', share).toNumber())).toEqual([
      40, 240, 500,
    ])
  })

  it('costs each share its own customers and awareness', () => {
    const state = stateWith((s) => {
      s.customers = new Decimal(1_000)
      s.customerIncome = new Decimal(10)
      s.stock.soybeans = new Decimal(500)
    })
    expect(bulkSaleCost(state, 'megaMeat', 'soybeans', 0.1)).toEqual({ customers: 202, awareness: 13 })
    // €1,091 would cost 1,819 customers; the 10 starting neighbours stay.
    expect(bulkSaleCost(state, 'megaMeat', 'soybeans', 1)).toEqual({ customers: 990, awareness: 110 })
  })

  it('sells everything when no share is given', () => {
    const state = soy(47)
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans').toNumber()).toBe(40)
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans', 1).toNumber()).toBe(40)
  })
})
