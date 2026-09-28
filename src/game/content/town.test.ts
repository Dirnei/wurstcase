import { describe, expect, it } from 'vitest'
import { DEMAND_KNEE, demandRate } from './town'

describe('demandRate', () => {
  it('has the knee at 750 customers', () => {
    expect(DEMAND_KNEE).toBe(750)
  })

  it.each([
    [10, 0.5],
    [750, 37.5],
    [1_500, 75],
    [6_000, 150],
  ])('places %i customers’ orders at %d per second', (customers, rate) => {
    expect(demandRate(customers)).toBeCloseTo(rate, 10)
  })

  it('adds the knee’s orders for every doubling, up to about 215 per second for the whole town', () => {
    expect(demandRate(20_000)).toBeCloseTo(215.1, 1)
    expect(demandRate(3_000) - demandRate(1_500)).toBeCloseTo(demandRate(750), 10)
  })

  it('multiplies the result by a factor', () => {
    expect(demandRate(1_500, 1.5)).toBeCloseTo(112.5, 10)
  })
})
