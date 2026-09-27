import { describe, expect, it } from 'vitest'
import { POPULATION } from '../content/town'
import { animalCurve, bulkTable, costCurve, demandCeiling, paybackCurves } from './curves'

describe('costCurve', () => {
  it('lists the next price, the total spent and the income for 0 to 50 copies', () => {
    const curve = costCurve('soybeanField')
    expect(curve).toHaveLength(51)
    expect(curve[0]).toEqual({ owned: 0, nextPrice: 10, spent: 0, income: 0 })
    expect(curve[1]).toEqual({ owned: 1, nextPrice: 11, spent: 10, income: 1 })
    expect(curve[2].spent).toBe(21)
    for (let n = 1; n < curve.length; n++) {
      expect(curve[n].spent).toBeGreaterThan(curve[n - 1].spent)
      expect(curve[n].income).toBe(n)
    }
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
})

describe('bulkTable', () => {
  it('compares bulk prices with the vegan value', () => {
    const soybeans = bulkTable().find((row) => row.resource === 'soybeans')!
    expect(soybeans.veganValue).toBe(1)
    expect(soybeans.buyers.megaMeat).toEqual({ perUnit: 0.1, share: 0.1 })
    expect(soybeans.buyers.biogas).toEqual({ perUnit: 0.05, share: 0.05 })
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
    expect(curve.map((p) => p.nextPrice)).toEqual([50, 60, 72, 87])
    expect(curve.map((p) => p.awareness)).toEqual([0, 1, 2, 3])
  })
})
