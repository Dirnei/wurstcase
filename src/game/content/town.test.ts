import { describe, expect, it } from 'vitest'
import { DEMAND_KNEE, demandRate } from './town'

describe('demandRate', () => {
  it('has the knee at 200 customers', () => {
    expect(DEMAND_KNEE).toBe(200)
  })

  it.each([
    [10, 0.5],
    [200, 10],
    [400, 20],
    [800, 30],
    [6_400, 60],
  ])('places %i customers’ orders at %d per second', (customers, rate) => {
    expect(demandRate(customers)).toBeCloseTo(rate, 10)
  })

  it('adds the knee’s orders for every doubling, up to about 76 per second for the whole town', () => {
    expect(demandRate(20_000)).toBeCloseTo(76.4, 1)
    expect(demandRate(800) - demandRate(400)).toBeCloseTo(demandRate(200), 10)
  })

  it('multiplies the result by a factor', () => {
    expect(demandRate(800, 1.5)).toBeCloseTo(45, 10)
  })
})
