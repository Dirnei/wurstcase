import type Decimal from 'break_eternity.js'
import { PRODUCTS, type ProductId } from '../content/resources'
import { ORDERS_PER_CUSTOMER } from '../content/town'
import type { GameState } from '../state'
import { add, advance, covered, sum } from './rollingWindow'
import { ordersFactor, productPrice } from './upgrades'

/** Game time over which sales to customers are averaged. */
export const SALES_WINDOW_SECONDS = 60

/** Right after loading, sales count as spread over at least this much game time. */
export const MIN_SALES_SECONDS = 10

/** Counts units sold to customers; called from the one place that fills their orders. */
export function recordSale(state: GameState, product: ProductId, units: Decimal | number): void {
  add(state.sales, product, units)
}

/** Moves the sales window on with game time; called from tick(). */
export function advanceSalesStats(state: GameState, seconds: number): void {
  advance(state.sales, seconds, SALES_WINDOW_SECONDS)
}

/** Orders all customers place per minute. */
export function demandPerMinute(state: Readonly<GameState>): Decimal {
  return state.customers.mul(ORDERS_PER_CUSTOMER * ordersFactor(state) * 60)
}

/**
 * Units of a product sold to customers per minute, averaged over the game time the window covers,
 * so the figure is close to right soon after loading. That time counts as at least
 * MIN_SALES_SECONDS, so a single sale right after loading does not look like a huge rate.
 */
export function soldPerMinute(state: Readonly<GameState>, product: ProductId): number {
  const seconds = Math.max(covered(state.sales, SALES_WINDOW_SECONDS), MIN_SALES_SECONDS)
  return (sum(state.sales, product, SALES_WINDOW_SECONDS) * 60) / seconds
}

/** Euros from customer sales in the last minute, from units sold at the current (upgraded) prices. */
export function incomePerMinute(state: Readonly<GameState>): number {
  return PRODUCTS.reduce((total, product) => total + soldPerMinute(state, product) * productPrice(state, product), 0)
}
