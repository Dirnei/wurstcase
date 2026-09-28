import { describe, expect, it } from 'vitest'
import { PRODUCT_PRICES } from '../content/products'
import { PRODUCTS } from '../content/resources'
import { buildingIncome, chainBalance, manualPass, marketValue, veganValue } from './value'

describe('veganValue', () => {
  it.each([
    ['soybeans', 1],
    ['tofu', 3],
    ['wheat', 6.25],
    ['seitan', 12.5],
    ['oats', 6],
    ['oatDrink', 12],
  ] as const)('values %s at €%d', (resource, value) => {
    expect(veganValue(resource)).toBeCloseTo(value, 10)
  })

  it('values products at their price', () => {
    for (const product of PRODUCTS) {
      expect(veganValue(product)).toBe(PRODUCT_PRICES[product])
    }
  })
})

describe('marketValue', () => {
  it.each([
    ['tofuWurst', 3],
    ['tofu', 2.4],
    ['soybeans', 0.64],
    ['seitan', 10],
    ['wheat', 4],
    ['oatDrink', 9.6],
    ['oats', 3.84],
  ] as const)('values %s working back from the product, 25%% less per step', (resource, value) => {
    expect(marketValue(resource)).toBeCloseTo(value, 10)
  })
})

describe('buildingIncome', () => {
  it('is the output per second times its vegan value', () => {
    expect(buildingIncome('soybeanField')).toBe(1)
    expect(buildingIncome('tofuPress')).toBe(1.5)
  })
})

describe('chainBalance', () => {
  const counts = (chain: 'soy' | 'wheat' | 'oat') => chainBalance(chain).buildings.map((b) => b.count)

  it('finds the smallest set that runs without stalls or surplus', () => {
    expect(counts('soy')).toEqual([3, 2, 2])
    expect(counts('wheat')).toEqual([1, 1, 1])
    expect(counts('oat')).toEqual([1, 1, 2])
  })

  it('reports the output and income of that set', () => {
    expect(chainBalance('soy')).toMatchObject({ product: 'tofuWurst', output: 1, income: 3 })
    expect(chainBalance('wheat')).toMatchObject({ product: 'leverkas', output: 0.25, income: 6.25 })
  })
})

describe('manualPass', () => {
  it('counts the clicks to make one product by hand', () => {
    expect(manualPass('soy')).toEqual({ clicks: 5, euros: 3 })
    expect(manualPass('wheat')).toEqual({ clicks: 7, euros: 25 })
    expect(manualPass('oat')).toEqual({ clicks: 4, euros: 12 })
  })
})
