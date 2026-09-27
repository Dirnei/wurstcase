import Decimal from 'break_eternity.js'
import { PRODUCT_PRICES } from '../content/products'
import { PRODUCTS } from '../content/resources'
import type { GameState } from '../state'

// Temporary: sells everything at base price until sales-and-customers adds demand.

export function canSellAll(state: Readonly<GameState>): boolean {
  return PRODUCTS.some((product) => state.stock[product].gt(0))
}

export function sellAll(state: GameState): void {
  let earned = new Decimal(0)
  for (const product of PRODUCTS) {
    earned = earned.add(state.stock[product].mul(PRODUCT_PRICES[product]))
    state.stock[product] = new Decimal(0)
  }
  state.money = state.money.add(earned)
  state.totalEarned = state.totalEarned.add(earned)
}
