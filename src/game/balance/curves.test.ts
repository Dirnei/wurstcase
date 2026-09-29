import { describe, expect, it } from 'vitest'
import { POPULATION } from '../content/town'
import { animalCurve, bulkTable, chainSetPayback, costCurve, demandCeiling, paybackCurves } from './curves'

describe('costCurve', () => {
  it('lists the next price, the total spent and the income for 0 to 50 copies', () => {
    const curve = costCurve('soybeanField')
    expect(curve).toHaveLength(51)
    expect(curve[0]).toEqual({ owned: 0, nextPrice: 10, spent: 0, income: 0 })
    expect(curve[1]).toEqual({ owned: 1, nextPrice: 11, spent: 10, income: 1 })
    expect(curve[2].spent).toBe(21)
    for (let n = 1; n < curve.length; n++) {
      expect(curve[n].spent).toBeGreaterThan(curve[n - 1].spent)
    }
  })

  it('gives no jump for the count alone', () => {
    const curve = costCurve('soybeanField')
    expect(curve[24].income).toBe(24)
    expect(curve[25].income).toBe(25)
    expect(curve[25].spent - curve[24].spent).toBe(curve[24].nextPrice)
  })
})

describe('paybackCurves', () => {
  it('divides the price of each copy by the income it adds', () => {
    const curves = paybackCurves()
    const field = curves.find((c) => c.id === 'soybeanField')!
    const press = curves.find((c) => c.id === 'tofuPress')!
    expect(field.seconds).toHaveLength(50)
    expect(field.seconds[0]).toBe(10)
    expect(press.seconds[0]).toBeCloseTo(16.7, 1)
    expect(field.seconds[1]).toBe(11)
  })

  it('makes every copy pay back more slowly than the one before', () => {
    const field = paybackCurves().find((c) => c.id === 'soybeanField')!
    for (let n = 1; n < field.seconds.length; n++) expect(field.seconds[n]).toBeGreaterThan(field.seconds[n - 1])
  })
})

describe('demandCeiling', () => {
  it('shows what the customers pay for per product, and the kitchens it keeps busy', () => {
    const [ten] = demandCeiling([10, POPULATION])
    expect(ten.customers).toBe(10)
    expect(ten.income.tofuWurst).toBeCloseTo(1.5, 10)
    expect(ten.income.leverkas).toBeCloseTo(12.5, 10)
    expect(ten.kitchens.tofuWurst).toBeCloseTo(1, 10)
    expect(ten.kitchens.leverkas).toBeCloseTo(2, 10)
  })

  it('bends at the knee: 800 customers pay €90 per second for Tofu-Wurst, not €120', () => {
    const [beyond, town] = demandCeiling([800, POPULATION])
    expect(beyond.income.tofuWurst).toBeCloseTo(90, 10)
    // The whole town orders about 76 per second.
    expect(town.income.tofuWurst).toBeCloseTo(229.3, 1)
  })
})

describe('bulkTable', () => {
  it('compares bulk prices with the market value', () => {
    const soybeans = bulkTable().find((row) => row.resource === 'soybeans')!
    expect(soybeans.marketValue).toBeCloseTo(0.64, 10)
    expect(soybeans.buyers.megaMeat!.perUnit).toBeCloseTo(3.15, 10)
    expect(soybeans.buyers.megaMeat!.share).toBeCloseTo(4.92, 2)
    expect(soybeans.buyers.megaMeat!.capPerSecond).toBeCloseTo(54.6, 1)
    expect(soybeans.buyers.biogas!.capPerSecond).toBeUndefined()
    // The biogas plant's product markets flood too, with the same €1,575 and 20 s.
    const leverkas = bulkTable().find((row) => row.resource === 'leverkas')!
    expect(leverkas.buyers.biogas!.capPerSecond).toBeCloseTo(54.6, 1)
    expect(soybeans.buyers.biogas!.perUnit).toBeCloseTo(0.429, 3)
    expect(soybeans.buyers.biogas!.share).toBeCloseTo(0.67, 3)
  })

  it('leaves out what a buyer does not take', () => {
    const wurst = bulkTable().find((row) => row.resource === 'tofuWurst')!
    expect(wurst.buyers.megaMeat).toBeUndefined()
    expect(wurst.buyers.biogas).toBeDefined()
  })
})

describe('animalCurve', () => {
  it('lists the next price and the awareness of the herd', () => {
    const curve = animalCurve('chicken', 3)
    expect(curve.map((p) => p.nextPrice)).toEqual([50, 63, 79, 98])
    expect(curve.map((p) => p.awareness)).toEqual([0, 1, 2, 3])
  })
})

describe('chainSetPayback', () => {
  it('prices the first balanced soy set and what it earns', () => {
    const soy = chainSetPayback().find((c) => c.chain === 'soy')!
    expect(soy.sets).toHaveLength(25)
    expect(soy.sets[0].price).toBe(173)
    expect(soy.sets[0].income).toBeCloseTo(3, 10)
    expect(soy.sets[0].seconds).toBeCloseTo(57.7, 1)
  })

  it('gets slower for later sets, except where a set reaches a milestone', () => {
    for (const { chain, sets } of chainSetPayback()) {
      expect(sets[23].seconds, chain).toBeGreaterThan(sets[0].seconds)
      expect(sets[24].seconds, chain).toBeLessThan(sets[23].seconds)
    }
  })

  it('adds the chain milestone a set completes to its price', () => {
    // The 13th soy set takes the soy chain to 39 fields, 26 presses and 26 kitchens: 25 of each.
    const soy = chainSetPayback().find((c) => c.chain === 'soy')!
    expect(soy.sets[12].price - soy.sets[11].price).toBeGreaterThan(13_000)
  })

  it('lets each later chain start behind the one before and end ahead of it', () => {
    const [soy, oat, wheat] = chainSetPayback().map((c) => c.sets.map((set) => set.seconds))
    for (const [early, late] of [[soy, oat], [oat, wheat]]) {
      expect(early[0]).toBeLessThan(late[0])
      // The 25th set completes a chain milestone in every chain, so compare the set before it.
      expect(early[23]).toBeGreaterThan(late[23])
    }
  })
})
