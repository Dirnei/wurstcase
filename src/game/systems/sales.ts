import Decimal from 'break_eternity.js'
import { PRODUCTS } from '../content/resources'
import {
  ASSISTANT,
  demandRate,
  ORDER_CAP_SECONDS,
  OVERSTOCK_SECONDS,
} from '../content/town'
import type { GameState } from '../state'
import { scandalFactor } from './bulkSales'
import { recordSale } from './salesStats'
import { ordersFactor, productPrice, productsByPrice } from './upgrades'
import { recordCustomerSale } from './customerIncome'

/** Orders per second from all customers. */
/**
 * Orders per second from all customers: the demand curve on the customer count, then the orders
 * upgrades and MegaMeat's scandal on its result.
 */
export function orderRate(state: Readonly<GameState>): Decimal {
  return new Decimal(demandRate(state.customers.toNumber(), ordersFactor(state) * scandalFactor(state)))
}

/** The most open orders that can pile up. */
export function orderCap(state: Readonly<GameState>): Decimal {
  return orderRate(state).mul(ORDER_CAP_SECONDS).floor()
}

/**
 * Customers place whole orders over time. With the assistant, orders are sold before the cap
 * applies, so one long tick sells as much as many short ones.
 */
export function takeOrders(state: GameState, seconds: number): void {
  const gained = orderRate(state).mul(seconds).add(state.orderProgress)
  const whole = gained.floor()
  state.orderProgress = gained.sub(whole).toNumber()
  state.openOrders = state.openOrders.add(whole)

  if (state.assistant) {
    fillOrders(state)
  }

  const cap = orderCap(state)
  if (state.openOrders.gte(cap)) {
    // Demand beyond the cap is lost, and nothing is banked towards the next order.
    state.openOrders = cap
    state.orderProgress = 0
  }
}

/** Fills open orders from stock, most expensive product first. */
function fillOrders(state: GameState): void {
  for (const product of productsByPrice(state)) {
    const sold = Decimal.min(state.stock[product], state.openOrders)
    if (sold.lte(0)) {
      continue
    }
    const earned = sold.mul(productPrice(state, product))
    state.stock[product] = state.stock[product].sub(sold)
    state.openOrders = state.openOrders.sub(sold)
    state.money = state.money.add(earned)
    state.totalEarned = state.totalEarned.add(earned)
    recordCustomerSale(state, earned)
    recordSale(state, product, sold)
  }
}

/** What a sale by hand would earn right now. */
export function saleValue(state: Readonly<GameState>): Decimal {
  let orders = state.openOrders
  let value = new Decimal(0)
  for (const product of productsByPrice(state)) {
    const sold = Decimal.min(state.stock[product], orders)
    orders = orders.sub(sold)
    value = value.add(sold.mul(productPrice(state, product)))
  }
  return value
}

export function canSell(state: Readonly<GameState>): boolean {
  return state.openOrders.gt(0) && PRODUCTS.some((product) => state.stock[product].gt(0))
}

/** A sale by hand. */
export function sell(state: GameState): void {
  if (canSell(state)) {
    fillOrders(state)
  }
}

export function isAssistantOffered(state: Readonly<GameState>): boolean {
  return !state.assistant && state.totalEarned.gte(ASSISTANT.unlockAt)
}

export function canHireAssistant(state: Readonly<GameState>): boolean {
  return isAssistantOffered(state) && state.money.gte(ASSISTANT.price)
}

export function hireAssistant(state: GameState): boolean {
  if (!canHireAssistant(state)) {
    return false
  }
  state.money = state.money.sub(ASSISTANT.price)
  state.assistant = true
  return true
}

/** More products in stock than customers order in two minutes. */
export function isOverstocked(state: Readonly<GameState>): boolean {
  const inStock = PRODUCTS.reduce((sum, product) => sum.add(state.stock[product]), new Decimal(0))
  return inStock.gt(orderRate(state).mul(OVERSTOCK_SECONDS))
}
