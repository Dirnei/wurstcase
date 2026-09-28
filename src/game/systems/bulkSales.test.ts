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
  advanceScandal,
  scandalFadeSeconds,
  scandalFactor,
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
    // €80 at the fresh price, paid along the flooded product market.
    expect(state.money.toNumber()).toBe(78)
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

  it('costs awareness and raises the scandal, but takes no customers', () => {
    const state = feeding(1_000, 10, 100, (s) => (s.stock.soybeans = new Decimal(200)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(529)
    expect(state.customers.toNumber()).toBe(1_000)
    expect(state.awareness.toNumber()).toBe(47)
    expect(state.megaMeatScandal.toNumber()).toBe(529)
  })

  it('rounds the awareness up, so a small sale still costs', () => {
    const state = feeding(1_000, 10, 100, (s) => (s.stock.soybeans = new Decimal(20)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.money.toNumber()).toBe(61)
    expect(state.customers.toNumber()).toBe(1_000)
    expect(state.awareness.toNumber()).toBe(93)
    expect(state.megaMeatScandal.toNumber()).toBe(61)
  })

  it('keeps every customer and never drops below no awareness', () => {
    const state = feeding(12, 10, 5, (s) => (s.stock.seitan = new Decimal(120)))
    bulkSell(state, 'megaMeat', 'seitan')
    expect(state.customers.toNumber()).toBe(12)
    expect(state.awareness.toNumber()).toBe(0)
  })

  it('keeps every customer while customers spend nothing', () => {
    const state = feeding(30, 0, 100, (s) => (s.stock.soybeans = new Decimal(20)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.customers.toNumber()).toBe(30)
  })

  it('costs nothing at the biogas plant', () => {
    const state = feeding(50, 10, 100, (s) => (s.stock.tofuWurst = new Decimal(30)))
    bulkSell(state, 'biogas', 'tofuWurst')
    expect(state.money.toNumber()).toBe(58)
    expect(state.customers.toNumber()).toBe(50)
    expect(state.awareness.toNumber()).toBe(100)
    expect(state.megaMeatScandal.toNumber()).toBe(0)
  })

  it('previews the awareness and the reach campaigns lose, without changing anything', () => {
    const state = feeding(1_000, 10, 100, (s) => {
      s.stock.soybeans = new Decimal(20)
      s.stock.tofuWurst = new Decimal(30)
    })
    // €61: 7 awareness, and campaigns win 10,000 ÷ 10,061 of their customers, 0.6% fewer: shown as 1%.
    expect(bulkSaleCost(state, 'megaMeat', 'soybeans')).toEqual({ awareness: 7, scandalLoss: 1 })
    expect(bulkSaleCost(state, 'biogas', 'tofuWurst')).toEqual({ awareness: 0, scandalLoss: 0 })
    expect(state.megaMeatScandal.toNumber()).toBe(0)
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

  it('costs each share its own awareness and reach', () => {
    const state = stateWith((s) => {
      s.customers = new Decimal(1_000)
      s.customerIncome = new Decimal(10)
      s.stock.soybeans = new Decimal(500)
    })
    expect(bulkSaleCost(state, 'megaMeat', 'soybeans', 0.1)).toEqual({ awareness: 13, scandalLoss: 2 })
    expect(bulkSaleCost(state, 'megaMeat', 'soybeans', 1)).toEqual({ awareness: 110, scandalLoss: 10 })
  })

  it('sells everything when no share is given', () => {
    const state = soy(47)
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans').toNumber()).toBe(40)
    expect(bulkSaleUnits(state, 'megaMeat', 'soybeans', 1).toNumber()).toBe(40)
  })
})

describe('MegaMeat scandal', () => {
  const scandal = (euros: number) => stateWith((s) => (s.megaMeatScandal = new Decimal(euros)))

  it('adds up the euros of every MegaMeat sale', () => {
    const state = scandal(4_000)
    state.stock.soybeans = new Decimal(500)
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(state.megaMeatScandal.toNumber()).toBe(5_091)
    expect(scandalFactor(state)).toBeCloseTo(0.6626, 4)
  })

  it('halves campaign reach at €10,000 and costs 29% at €4,000', () => {
    expect(scandalFactor(createInitialState())).toBe(1)
    expect(scandalFactor(scandal(10_000))).toBeCloseTo(0.5, 10)
    expect(scandalFactor(scandal(4_000))).toBeCloseTo(0.714, 3)
  })

  it('halves in 600 s, and the loss is below 5% about 32 minutes later', () => {
    const state = scandal(10_000)
    advanceScandal(state, 600)
    expect(state.megaMeatScandal.toNumber()).toBeCloseTo(5_000, 6)
    expect(scandalFactor(state)).toBeCloseTo(2 / 3, 6)
    expect(scandalFadeSeconds(state) / 60).toBeCloseTo(32.5, 1)
    expect(scandalFadeSeconds(scandal(10_000)) / 60).toBeCloseTo(42.5, 1)
    expect(scandalFadeSeconds(scandal(90))).toBe(0)
  })

  it('falls the same in one tick or in 6,000 ticks of 0.1 s', () => {
    const once = scandal(10_000)
    advanceScandal(once, 600)
    const often = scandal(10_000)
    for (let i = 0; i < 6_000; i++) advanceScandal(often, 0.1)
    expect(often.megaMeatScandal.toNumber()).toBeCloseTo(once.megaMeatScandal.toNumber(), 4)
  })

  it('falls through tick() and snaps a tiny scandal to 0', () => {
    const state = scandal(10_000)
    tick(state, 14_400)
    expect(state.megaMeatScandal.toNumber()).toBe(0)
  })

  it('is not raised by the biogas plant', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(1_000)))
    bulkSell(state, 'biogas', 'soybeans')
    expect(state.megaMeatScandal.toNumber()).toBe(0)
  })
})

describe('biogas product markets flood', () => {
  it('pays €1,152 for 100 fresh Leverkas and drops the market to 48%', () => {
    const state = stateWith((s) => (s.stock.leverkas = new Decimal(100)))
    expect(bulkSaleValue(state, 'biogas', 'leverkas').toNumber()).toBe(1_152)
    bulkSell(state, 'biogas', 'leverkas')
    expect(state.money.toNumber()).toBe(1_152)
    expect(state.biogasFlood.leverkas!.toNumber()).toBeCloseTo(1_700, 9)
    expect(marketLevel(state, 'leverkas', 'biogas')).toBeCloseTo(0.481, 3)
  })

  it('leaves raw ingredients and intermediates unflooded at the biogas plant', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(1_000)))
    bulkSell(state, 'biogas', 'soybeans')
    expect(lotFor(state, 'biogas', 'soybeans')).toEqual({ units: 7, price: 3 })
    expect(state.biogasFlood).toEqual({})
    expect(state.megaMeatFlood).toEqual({})
    expect(marketLevel(state, 'tofuWurst', 'biogas')).toBe(1)
  })

  it('keeps the biogas and MegaMeat markets apart', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(1_000)))
    bulkSell(state, 'megaMeat', 'soybeans')
    expect(marketLevel(state, 'tofuWurst', 'biogas')).toBe(1)
    expect(state.biogasFlood).toEqual({})
  })

  it('recovers like MegaMeat’s, the same in one tick or many', () => {
    const once = stateWith((s) => (s.biogasFlood.leverkas = new Decimal(1_575)))
    recoverMarkets(once, 20)
    expect(once.biogasFlood.leverkas!.toNumber()).toBeCloseTo(787.5, 6)
    expect(timeToRecover(once, 'leverkas', 0.95, 'biogas') / 60).toBeCloseTo(65 / 60, 1)
    const often = stateWith((s) => (s.biogasFlood.leverkas = new Decimal(1_575)))
    for (let i = 0; i < 200; i++) recoverMarkets(often, 0.1)
    expect(often.biogasFlood.leverkas!.toNumber()).toBeCloseTo(787.5, 4)
  })
})
