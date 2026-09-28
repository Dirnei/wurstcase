import Decimal from 'break_eternity.js'
import { CUSTOMER_INCOME_SECONDS } from '../content/town'
import type { GameState } from '../state'

/**
 * The customer income is an exponentially decaying sum: each sale adds euros / T, and it decays by
 * e^(-seconds / T). At a steady rate it settles at that rate, and it is exact for any tick length.
 */
export function recordCustomerSale(state: GameState, euros: Decimal): void {
  state.customerIncome = state.customerIncome.add(euros.div(CUSTOMER_INCOME_SECONDS))
}

export function advanceCustomerIncome(state: GameState, seconds: number): void {
  state.customerIncome = state.customerIncome.mul(Math.exp(-seconds / CUSTOMER_INCOME_SECONDS))
}
