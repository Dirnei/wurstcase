import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState } from '../state'
import { advanceCustomerIncome, recordCustomerSale } from './customerIncome'

describe('customer income', () => {
  it('starts at 0', () => {
    expect(createInitialState().customerIncome.toNumber()).toBe(0)
  })

  it('settles at a steady rate of customer sales', () => {
    const state = createInitialState()
    for (let second = 0; second < 30 * 60; second++) {
      recordCustomerSale(state, new Decimal(10))
      advanceCustomerIncome(state, 1)
    }
    expect(state.customerIncome.toNumber()).toBeCloseTo(10, 0)
    expect(Math.abs(state.customerIncome.toNumber() - 10)).toBeLessThan(0.1)
  })

  it('fades after sales stop', () => {
    const state = createInitialState()
    state.customerIncome = new Decimal(10)
    advanceCustomerIncome(state, 300)
    expect(state.customerIncome.toNumber()).toBeCloseTo(10 / Math.E, 6)
  })

  it('decays the same in one big step as in many small ones', () => {
    const big = createInitialState()
    const small = createInitialState()
    big.customerIncome = new Decimal(10)
    small.customerIncome = new Decimal(10)
    advanceCustomerIncome(big, 120)
    for (let i = 0; i < 1200; i++) advanceCustomerIncome(small, 0.1)
    expect(small.customerIncome.toNumber()).toBeCloseTo(big.customerIncome.toNumber(), 9)
  })
})
