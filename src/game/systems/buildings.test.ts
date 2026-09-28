import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { decodeSave, encodeSave } from '../save'
import { CHAINS, SET_GROWTH, setShare } from '../content/buildings'
import { createInitialState, type GameState } from '../state'
import { buildingPrice, buyBuilding, canBuy, isResourceShown, isUnlocked, nextLockedBuildings } from './buildings'

function withMoney(money: number, earned = money): GameState {
  return { ...createInitialState(), money: new Decimal(money), totalEarned: new Decimal(earned) }
}

describe('buildingPrice', () => {
  it('is the base price for the first copy', () => {
    expect(buildingPrice(createInitialState(), 'soybeanField').toNumber()).toBe(10)
  })

  it('rises by the chain set growth per share of a balanced set owned, rounded up to whole euros', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 1
    expect(buildingPrice(state, 'soybeanField').toNumber()).toBe(11)
    state.buildings.soybeanField = 2
    expect(buildingPrice(state, 'soybeanField').toNumber()).toBe(12)
    state.buildings.soybeanField = 24
    expect(buildingPrice(state, 'soybeanField').toNumber()).toBe(71)
    state.buildings.tofuPress = 1
    expect(buildingPrice(state, 'tofuPress').toNumber()).toBe(29)
    state.buildings.wheatField = 1
    expect(buildingPrice(state, 'wheatField').toNumber()).toBe(412)
  })

  it('multiplies every price in a chain by its set growth once per whole set owned', () => {
    const state = createInitialState()
    state.buildings.wheatField = 2
    state.buildings.leverkasOven = 1
    expect(buildingPrice(state, 'wheatField').toNumber()).toBe(424)
    expect(buildingPrice(state, 'leverkasOven').toNumber()).toBe(954)
  })

  it('grows more slowly per set in a later chain', () => {
    expect(CHAINS.map((chain) => SET_GROWTH[chain])).toEqual([1.13, 1.07, 1.06])
  })

  it('prices the buildings of a loaded save at the current rate', () => {
    const saved = withMoney(100)
    saved.buildings.soybeanField = 2
    const result = decodeSave(encodeSave(saved, 0))
    if (!result.ok) throw new Error('save did not load')
    expect(result.state.money.toNumber()).toBe(100)
    expect(result.state.buildings.soybeanField).toBe(2)
    expect(buildingPrice(result.state, 'soybeanField').toNumber()).toBe(12)
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
    const state = withMoney(100_000, 29_999)
    expect(canBuy(state, 'oatField')).toBe(false)
    expect(buyBuilding(state, 'oatField')).toBe(false)
    expect(state.buildings.oatField).toBe(0)
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
    expect(isUnlocked(withMoney(0, 29_999), 'oatField')).toBe(false)
    expect(isUnlocked(withMoney(0, 30_000), 'oatField')).toBe(true)
    expect(isUnlocked(withMoney(0, 139_999), 'wheatField')).toBe(false)
    expect(isUnlocked(withMoney(0, 140_000), 'wheatField')).toBe(true)
  })

  it('keeps a building unlocked after spending the money', () => {
    const state = withMoney(30_000)
    buyBuilding(state, 'oatField')
    expect(state.money.lt(30_000)).toBe(true)
    expect(isUnlocked(state, 'oatField')).toBe(true)
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

describe('nextLockedBuildings', () => {
  it('is the whole oat chain, in production order, in a new game', () => {
    expect(nextLockedBuildings(createInitialState())).toEqual(['oatField', 'oatMill', 'cafeBar'])
  })

  it('is the wheat field and seitan kitchen once the oat chain is unlocked', () => {
    expect(nextLockedBuildings(withMoney(0, 30_000))).toEqual(['wheatField', 'seitanKitchen'])
  })

  it('is the Leverkas oven, last of all, once the wheat chain is unlocked', () => {
    expect(nextLockedBuildings(withMoney(0, 140_000))).toEqual(['leverkasOven'])
  })

  it('is empty once everything is unlocked', () => {
    expect(nextLockedBuildings(withMoney(0, 1e9))).toEqual([])
  })
})

describe('setShare', () => {
  it('derives each building’s share of a balanced set from the rates and recipes', () => {
    expect(['soybeanField', 'tofuPress', 'tofuWurstKitchen'].map((id) => setShare(id as never))).toEqual([1.5, 1, 1])
    expect(['oatField', 'oatMill', 'cafeBar'].map((id) => setShare(id as never))).toEqual([2, 1.5, 1])
    expect(['wheatField', 'seitanKitchen', 'leverkasOven'].map((id) => setShare(id as never))).toEqual([2, 1.5, 1])
  })
})
