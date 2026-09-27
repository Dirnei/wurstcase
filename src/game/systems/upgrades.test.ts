import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { UPGRADES, type UpgradeId } from '../content/upgrades'
import { createInitialState, type GameState } from '../state'
import {
  aktionCostFactor,
  animalPriceFactor,
  awarenessFactor,
  buyUpgrade,
  canBuyUpgrade,
  conversionFactor,
  isUpgradeOffered,
  manualFactor,
  offeredUpgrades,
  ordersFactor,
  priceBonus,
  productPrice,
  rateFactor,
  spaceBonus,
} from './upgrades'

function withMoney(money: number, earned = money): GameState {
  return { ...createInitialState(), money: new Decimal(money), totalEarned: new Decimal(earned) }
}

function owning(...ids: UpgradeId[]): GameState {
  const state = createInitialState()
  state.upgrades = [...ids]
  return state
}

describe('offers', () => {
  it('offers nothing in a new game', () => {
    expect(offeredUpgrades(createInitialState())).toEqual([])
  })

  it('offers strong hands from €30 earned', () => {
    expect(offeredUpgrades(withMoney(0, 29))).toEqual([])
    expect(offeredUpgrades(withMoney(0, 30)).map((u) => u.id)).toEqual(['strongHands'])
  })

  it('offers better seeds only from the fifth soybean field', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 4
    expect(isUpgradeOffered(state, 'betterSeeds')).toBe(false)
    state.buildings.soybeanField = 5
    expect(isUpgradeOffered(state, 'betterSeeds')).toBe(true)
  })

  it('keeps an offer after spending all money', () => {
    const state = withMoney(600)
    expect(isUpgradeOffered(state, 'mustard')).toBe(true)
    state.money = new Decimal(0)
    expect(isUpgradeOffered(state, 'mustard')).toBe(true)
  })

  it('lists offers cheapest first', () => {
    const state = withMoney(0, 1_000)
    state.buildings.soybeanField = 5
    expect(offeredUpgrades(state).map((u) => u.id)).toEqual(['strongHands', 'betterSeeds', 'mustard'])
  })

  it('offers all 17 when every condition is met', () => {
    const state = withMoney(0, 1e6)
    for (const id of Object.keys(state.buildings) as (keyof typeof state.buildings)[]) state.buildings[id] = 10
    state.shelters.stable = 5
    state.aktionen.runs.flyer = 5
    for (let i = 0; i < 5; i++) state.residents.push({ species: 'chicken', name: i }, { species: 'pig', name: i })
    expect(offeredUpgrades(state)).toHaveLength(UPGRADES.length)
  })
})

describe('buyUpgrade', () => {
  it('buys an offered upgrade for money without touching total earnings', () => {
    const state = withMoney(50)
    expect(canBuyUpgrade(state, 'strongHands')).toBe(true)
    expect(buyUpgrade(state, 'strongHands')).toBe(true)
    expect(state.money.toNumber()).toBe(10)
    expect(state.totalEarned.toNumber()).toBe(50)
    expect(state.upgrades).toEqual(['strongHands'])
    expect(isUpgradeOffered(state, 'strongHands')).toBe(false)
    expect(buyUpgrade(state, 'strongHands')).toBe(false)
    expect(state.upgrades).toEqual(['strongHands'])
  })

  it('cannot buy without enough money', () => {
    const state = withMoney(39, 100)
    expect(canBuyUpgrade(state, 'strongHands')).toBe(false)
    expect(buyUpgrade(state, 'strongHands')).toBe(false)
    expect(state.money.toNumber()).toBe(39)
  })
})

describe('effect lookups', () => {
  it('is neutral without upgrades', () => {
    const state = createInitialState()
    expect(rateFactor(state, 'soybeanField')).toBe(1)
    expect(manualFactor(state)).toBe(1)
    expect(priceBonus(state, 'leverkas')).toBe(0)
    expect(productPrice(state, 'leverkas')).toBe(25)
    expect(ordersFactor(state)).toBe(1)
    expect(awarenessFactor(state, 'chicken')).toBe(1)
    expect(conversionFactor(state)).toBe(1)
    expect(spaceBonus(state, 'stable')).toBe(0)
    expect(animalPriceFactor(state)).toBe(1)
    expect(aktionCostFactor(state)).toBe(1)
  })

  it('stacks factors and applies each effect kind', () => {
    expect(rateFactor(owning('betterSeeds', 'secondFarmer'), 'soybeanField')).toBe(3)
    expect(rateFactor(owning('betterSeeds', 'secondFarmer'), 'wheatField')).toBe(1.5)
    expect(rateFactor(owning('betterSeeds'), 'tofuPress')).toBe(1)
    expect(priceBonus(owning('leverkasRecipe'), 'leverkas')).toBe(10)
    expect(productPrice(owning('leverkasRecipe'), 'leverkas')).toBe(35)
    expect(ordersFactor(owning('loyaltyCard'))).toBe(1.5)
    expect(spaceBonus(owning('moreStraw'), 'stable')).toBe(2)
    expect(spaceBonus(owning('moreStraw'), 'pasture')).toBe(0)
    expect(animalPriceFactor(owning('negotiator'))).toBe(0.8)
    expect(aktionCostFactor(owning('instagram'))).toBe(0.75)
    expect(awarenessFactor(owning('henPhotoShoot'), 'chicken')).toBe(2)
    expect(awarenessFactor(owning('henPhotoShoot'), 'pig')).toBe(1)
    expect(conversionFactor(owning('localNewspaper'))).toBe(1.5)
    expect(manualFactor(owning('strongHands'))).toBe(2)
  })
})
