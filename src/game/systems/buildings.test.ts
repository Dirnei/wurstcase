import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../state'
import { buildingPrice, buyBuilding, canBuy, isResourceShown, isUnlocked } from './buildings'

function withMoney(money: number, earned = money): GameState {
  return { ...createInitialState(), money: new Decimal(money), totalEarned: new Decimal(earned) }
}

describe('buildingPrice', () => {
  it('is the base price for the first copy', () => {
    expect(buildingPrice(createInitialState(), 'soybeanField').toNumber()).toBe(10)
  })

  it('rises by 15% per copy owned, rounded up to whole euros', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 1
    expect(buildingPrice(state, 'soybeanField').toNumber()).toBe(12)
    state.buildings.soybeanField = 2
    expect(buildingPrice(state, 'soybeanField').toNumber()).toBe(14)
  })

  it('stays finite for very many copies', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 10_000
    const price = buildingPrice(state, 'soybeanField')
    expect(price.gt(1e308)).toBe(true)
    expect(Number.isNaN(price.mag)).toBe(false)
  })
})

describe('buyBuilding', () => {
  it('subtracts the price and adds one building', () => {
    const state = withMoney(15)
    expect(buyBuilding(state, 'soybeanField')).toBe(true)
    expect(state.money.toNumber()).toBe(5)
    expect(state.buildings.soybeanField).toBe(1)
  })

  it('does not touch total earnings', () => {
    const state = withMoney(15)
    buyBuilding(state, 'soybeanField')
    expect(state.totalEarned.toNumber()).toBe(15)
  })

  it('refuses when the player cannot afford it', () => {
    const state = withMoney(9)
    expect(canBuy(state, 'soybeanField')).toBe(false)
    expect(buyBuilding(state, 'soybeanField')).toBe(false)
    expect(state.money.toNumber()).toBe(9)
    expect(state.buildings.soybeanField).toBe(0)
  })

  it('refuses a locked building even with enough money', () => {
    const state = withMoney(1_000, 199)
    expect(canBuy(state, 'wheatField')).toBe(false)
    expect(buyBuilding(state, 'wheatField')).toBe(false)
    expect(state.buildings.wheatField).toBe(0)
  })
})

describe('isUnlocked', () => {
  it('makes only the soy chain available in a new game', () => {
    const state = createInitialState()
    expect(isUnlocked(state, 'soybeanField')).toBe(true)
    expect(isUnlocked(state, 'tofuPress')).toBe(true)
    expect(isUnlocked(state, 'tofuWurstKitchen')).toBe(true)
    expect(isUnlocked(state, 'wheatField')).toBe(false)
    expect(isUnlocked(state, 'leverkasOven')).toBe(false)
    expect(isUnlocked(state, 'oatField')).toBe(false)
  })

  it('unlocks a building once total earnings reach its threshold', () => {
    expect(isUnlocked(withMoney(0, 199), 'wheatField')).toBe(false)
    expect(isUnlocked(withMoney(0, 200), 'wheatField')).toBe(true)
  })

  it('keeps a building unlocked after spending the money', () => {
    const state = withMoney(200)
    buyBuilding(state, 'wheatField')
    expect(state.money.lt(200)).toBe(true)
    expect(isUnlocked(state, 'wheatField')).toBe(true)
  })
})

describe('isResourceShown', () => {
  it('shows resources of unlocked buildings and hides the rest in a new game', () => {
    const state = createInitialState()
    expect(isResourceShown(state, 'soybeans')).toBe(true)
    expect(isResourceShown(state, 'tofuWurst')).toBe(true)
    expect(isResourceShown(state, 'wheat')).toBe(false)
    expect(isResourceShown(state, 'leverkas')).toBe(false)
  })

  it('shows a resource the player has in stock', () => {
    const state = createInitialState()
    state.stock.leverkas = new Decimal(1)
    expect(isResourceShown(state, 'leverkas')).toBe(true)
  })
})
