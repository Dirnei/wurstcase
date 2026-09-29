import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../state'
import {
  canHireAssistant,
  canSell,
  hireAssistant,
  isOverstocked,
  orderCap,
  orderRate,
  saleValue,
  sell,
  takeOrders,
} from './sales'

function stateWith(setup: (state: GameState) => void): GameState {
  const state = createInitialState()
  setup(state)
  return state
}

const orders = (state: GameState) => state.openOrders.toNumber()

describe('takeOrders', () => {
  it('lets 10 customers place 5 orders in 10 seconds', () => {
    const state = createInitialState()
    takeOrders(state, 10)
    expect(orders(state)).toBe(5)
  })

  it('counts whole orders only', () => {
    const state = createInitialState()
    takeOrders(state, 1)
    expect(orders(state)).toBe(0)
    expect(state.orderProgress).toBeCloseTo(0.5, 9)
  })

  it('caps open orders at 30 seconds of orders without banking more', () => {
    const state = createInitialState()
    expect(orderCap(state).toNumber()).toBe(15)
    takeOrders(state, 300)
    expect(orders(state)).toBe(15)
    expect(state.orderProgress).toBe(0)

    state.openOrders = new Decimal(0)
    takeOrders(state, 1)
    expect(orders(state)).toBe(0)
  })
})

describe('sell', () => {
  it('records what customers pay into the customer income', () => {
    const state = stateWith((s) => {
      s.openOrders = new Decimal(5)
      s.stock.tofuWurst = new Decimal(10)
    })
    sell(state)
    // €15 folded in over the 300-second smoothing.
    expect(state.customerIncome.toNumber()).toBeCloseTo(15 / 300, 10)
  })

  it('fills orders with the most expensive products first', () => {
    const state = stateWith((s) => {
      s.openOrders = new Decimal(5)
      s.stock.tofuWurst = new Decimal(10)
      s.stock.leverkas = new Decimal(2)
    })
    sell(state)
    expect(state.stock.leverkas.toNumber()).toBe(0)
    expect(state.stock.tofuWurst.toNumber()).toBe(7)
    expect(state.money.toNumber()).toBe(59)
    expect(state.totalEarned.toNumber()).toBe(59)
    expect(orders(state)).toBe(0)
  })

  it('sells only what is in stock and keeps the remaining orders', () => {
    const state = stateWith((s) => {
      s.openOrders = new Decimal(8)
      s.stock.tofuWurst = new Decimal(3)
    })
    sell(state)
    expect(state.money.toNumber()).toBe(9)
    expect(orders(state)).toBe(5)
    expect(state.stock.tofuWurst.toNumber()).toBe(0)
  })

  it('previews the earnings without changing anything', () => {
    const state = stateWith((s) => {
      s.openOrders = new Decimal(5)
      s.stock.tofuWurst = new Decimal(10)
      s.stock.leverkas = new Decimal(2)
    })
    expect(saleValue(state).toNumber()).toBe(59)
    expect(orders(state)).toBe(5)
    expect(state.stock.leverkas.toNumber()).toBe(2)
    expect(state.money.toNumber()).toBe(0)
  })

  it('is unavailable without open orders or without products', () => {
    const noOrders = stateWith((s) => (s.stock.tofuWurst = new Decimal(3)))
    expect(canSell(noOrders)).toBe(false)
    const noProducts = stateWith((s) => {
      s.openOrders = new Decimal(3)
      s.stock.tofu = new Decimal(3)
    })
    expect(canSell(noProducts)).toBe(false)
    sell(noProducts)
    expect(orders(noProducts)).toBe(3)
  })
})

describe('shop assistant', () => {
  it('is not offered below its unlock threshold', () => {
    const state = stateWith((s) => {
      s.money = new Decimal(1000)
      s.totalEarned = new Decimal(49)
    })
    expect(canHireAssistant(state)).toBe(false)
    expect(hireAssistant(state)).toBe(false)
    expect(state.assistant).toBe(false)
  })

  it('costs its price once and cannot be hired twice', () => {
    const state = stateWith((s) => {
      s.money = new Decimal(160)
      s.totalEarned = new Decimal(50)
    })
    expect(hireAssistant(state)).toBe(true)
    expect(state.assistant).toBe(true)
    expect(state.money.toNumber()).toBe(10)
    state.money = new Decimal(1000)
    expect(canHireAssistant(state)).toBe(false)
    expect(hireAssistant(state)).toBe(false)
    expect(state.money.toNumber()).toBe(1000)
  })

  it('needs enough money', () => {
    const state = stateWith((s) => {
      s.money = new Decimal(149)
      s.totalEarned = new Decimal(500)
    })
    expect(canHireAssistant(state)).toBe(false)
  })

  it('fills open orders on its own, most expensive first', () => {
    const state = stateWith((s) => {
      s.assistant = true
      s.openOrders = new Decimal(2)
      s.stock.leverkas = new Decimal(1)
      s.stock.tofuWurst = new Decimal(5)
    })
    takeOrders(state, 0.1)
    expect(state.stock.leverkas.toNumber()).toBe(0)
    expect(state.stock.tofuWurst.toNumber()).toBe(4)
    expect(state.money.toNumber()).toBe(28)
    expect(orders(state)).toBe(0)
  })

  it('sells a long tick of orders before the cap applies', () => {
    const state = stateWith((s) => {
      s.assistant = true
      s.stock.tofuWurst = new Decimal(100)
    })
    takeOrders(state, 60)
    expect(state.stock.tofuWurst.toNumber()).toBe(70)
    expect(orders(state)).toBe(0)
  })
})

describe('isOverstocked', () => {
  it('is true beyond 2 minutes of orders in stock', () => {
    const at = (units: number) =>
      isOverstocked(
        stateWith((s) => {
          s.stock.tofuWurst = new Decimal(units - 1)
          s.stock.leverkas = new Decimal(1)
        }),
      )
    expect(at(61)).toBe(true)
    expect(at(60)).toBe(false)
  })

  it('ignores raw ingredients and intermediates', () => {
    expect(isOverstocked(stateWith((s) => (s.stock.soybeans = new Decimal(1000))))).toBe(false)
  })
})

describe('upgrade effects on sales', () => {
  it('sells Leverkas at the upgraded price, most expensive first', () => {
    const state = createInitialState()
    state.upgrades = ['leverkasRecipe']
    state.stock.leverkas = new Decimal(2)
    state.stock.tofuWurst = new Decimal(5)
    state.openOrders = new Decimal(2)
    sell(state)
    expect(state.money.toNumber()).toBe(70)
    expect(state.stock.tofuWurst.toNumber()).toBe(5)
  })

  it('builds orders faster with the loyalty card', () => {
    const state = createInitialState()
    state.upgrades = ['loyaltyCard']
    takeOrders(state, 10)
    expect(state.openOrders.toNumber()).toBe(7)
  })
})

describe('MegaMeat scandal and orders', () => {
  it('halves the orders at a scandal of €10,000, and the cap with them', () => {
    // 1,600 customers sit at the curve's 40 per second.
    const state = stateWith((s) => {
      s.customers = new Decimal(1_600)
      s.megaMeatScandal = new Decimal(10_000)
    })
    takeOrders(state, 10)
    expect(state.openOrders.toNumber()).toBe(200)
    expect(orderCap(state).toNumber()).toBe(600)
  })
})

describe('demand curve', () => {
  const customers = (count: number, setup: (state: GameState) => void = () => {}) =>
    stateWith((s) => {
      s.customers = new Decimal(count)
      setup(s)
    })

  it('orders 100 in 10 s at the knee of 200 customers', () => {
    const state = customers(200)
    takeOrders(state, 10)
    expect(state.openOrders.toNumber()).toBe(100)
  })

  it('meets the flat rate at twice the knee, then falls behind it: 800 customers order 300 in 10 s, not 400', () => {
    const twice = customers(400)
    takeOrders(twice, 10)
    expect(twice.openOrders.toNumber()).toBe(200)
    expect(orderCap(twice).toNumber()).toBe(600)
    const state = customers(800)
    takeOrders(state, 10)
    expect(state.openOrders.toNumber()).toBe(300)
    expect(orderCap(state).toNumber()).toBe(900)
  })

  it('adds the same for each doubling: 6,400 customers order 600 in 10 s', () => {
    const state = customers(6_400)
    takeOrders(state, 10)
    expect(state.openOrders.toNumber()).toBe(600)
  })

  it('applies the loyalty card to the curve’s result: 800 customers order 45 per second', () => {
    expect(orderRate(customers(800, (s) => (s.upgrades = ['loyaltyCard']))).toNumber()).toBeCloseTo(45, 10)
  })

  it('applies the loyalty card and the scandal to the curve’s result', () => {
    const state = customers(6_400, (s) => {
      s.upgrades = ['loyaltyCard']
      s.megaMeatScandal = new Decimal(10_000)
    })
    // 60 × 1.5 × ½ per second.
    expect(orderRate(state).toNumber()).toBeCloseTo(45, 10)
    expect(orderCap(state).toNumber()).toBe(1_350)
  })
})
