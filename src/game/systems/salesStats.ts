import type Decimal from 'break_eternity.js'
import { PRODUCT_PRICES } from '../content/products'
import { PRODUCTS, type ProductId } from '../content/resources'
import { ORDERS_PER_CUSTOMER } from '../content/town'
import type { GameState } from '../state'
import { add, advance, sum } from './rollingWindow'

/** Game time over which sales to customers are averaged. */
export const SALES_WINDOW_SECONDS = 60

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
  return state.customers.mul(ORDERS_PER_CUSTOMER * 60)
}

/**
 * Units of a product sold to customers in the last minute. Always divided by the full window, so
 * a sale right after loading does not look like a huge rate.
 */
export function soldPerMinute(state: Readonly<GameState>, product: ProductId): number {
  return (sum(state.sales, product, SALES_WINDOW_SECONDS) * 60) / SALES_WINDOW_SECONDS
}

/** Euros from customer sales in the last minute; prices are fixed, so it follows from units sold. */
export function incomePerMinute(state: Readonly<GameState>): number {
  return PRODUCTS.reduce((total, product) => total + soldPerMinute(state, product) * PRODUCT_PRICES[product], 0)
}
