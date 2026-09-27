import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { getBuilding } from '../content/buildings'
import { createInitialState, type GameState } from '../state'
import { MANUAL_ACTIONS, type ManualActionId } from '../content/manual'
import { canPerform, isManualUnlocked, performManual } from './manual'

describe('manual actions', () => {
  it('harvests one soybean per click', () => {
    const state = createInitialState()
    for (let i = 0; i < 3; i++) {
      performManual(state, 'harvestSoybeans')
    }
    expect(state.stock.soybeans.toNumber()).toBe(3)
  })

  it('presses 3 soybeans into 1 tofu', () => {
    const state = createInitialState()
    state.stock.soybeans = new Decimal(3)
    expect(performManual(state, 'pressTofu')).toBe(true)
    expect(state.stock.soybeans.toNumber()).toBe(0)
    expect(state.stock.tofu.toNumber()).toBe(1)
  })

  it('makes 1 Tofu-Wurst from 1 tofu', () => {
    const state = createInitialState()
    state.stock.tofu = new Decimal(1)
    performManual(state, 'makeTofuWurst')
    expect(state.stock.tofu.toNumber()).toBe(0)
    expect(state.stock.tofuWurst.toNumber()).toBe(1)
  })

  it('is unavailable without enough input and then changes nothing', () => {
    const state = createInitialState()
    state.stock.soybeans = new Decimal(2)
    expect(canPerform(state, 'pressTofu')).toBe(false)
    expect(performManual(state, 'pressTofu')).toBe(false)
    expect(state.stock.soybeans.toNumber()).toBe(2)
    expect(state.stock.tofu.toNumber()).toBe(0)
  })

  it('can always harvest', () => {
    expect(canPerform(createInitialState(), 'harvestSoybeans')).toBe(true)
  })

  it('unlocks only the soy actions in a new game', () => {
    const state = createInitialState()
    const unlocked = MANUAL_ACTIONS.filter((action) => isManualUnlocked(state, action.id))
    expect(unlocked.map((action) => action.chain)).toEqual(['soy', 'soy', 'soy'])
  })

  it('unlocks each step with its building', () => {
    const state = earned(getBuilding('wheatField').unlockAt)
    expect(isManualUnlocked(state, 'harvestWheat')).toBe(true)
    expect(isManualUnlocked(state, 'makeSeitan')).toBe(true)
    expect(isManualUnlocked(state, 'bakeLeverkas')).toBe(false)
  })

  it('changes nothing when locked, even with enough input', () => {
    const state = createInitialState()
    state.stock.seitan = new Decimal(2)
    expect(canPerform(state, 'bakeLeverkas')).toBe(false)
    expect(performManual(state, 'bakeLeverkas')).toBe(false)
    expect(performManual(state, 'harvestOats')).toBe(false)
    expect(state.stock.seitan.toNumber()).toBe(2)
    expect(state.stock.leverkas.toNumber()).toBe(0)
    expect(state.stock.oats.toNumber()).toBe(0)
  })

  it('makes a Leverkas by hand from 4 wheat', () => {
    const state = earned(getBuilding('leverkasOven').unlockAt)
    clicks(state, 'harvestWheat', 4)
    clicks(state, 'makeSeitan', 2)
    clicks(state, 'bakeLeverkas', 1)
    expect(state.stock.wheat.toNumber()).toBe(0)
    expect(state.stock.seitan.toNumber()).toBe(0)
    expect(state.stock.leverkas.toNumber()).toBe(1)
  })

  it('makes a Hafer-Cappuccino by hand from 2 oats', () => {
    const state = earned(getBuilding('cafeBar').unlockAt)
    clicks(state, 'harvestOats', 2)
    clicks(state, 'makeOatDrink', 1)
    clicks(state, 'makeHaferCappuccino', 1)
    expect(state.stock.oats.toNumber()).toBe(0)
    expect(state.stock.oatDrink.toNumber()).toBe(0)
    expect(state.stock.haferCappuccino.toNumber()).toBe(1)
  })
})

function earned(amount: number) {
  return { ...createInitialState(), totalEarned: new Decimal(amount) }
}

function clicks(state: GameState, id: ManualActionId, times: number) {
  for (let i = 0; i < times; i++) {
    expect(performManual(state, id), id).toBe(true)
  }
}

describe('upgrade effects on manual actions', () => {
  it('presses two tofu per click with strong hands', () => {
    const state = createInitialState()
    state.upgrades = ['strongHands']
    state.stock.soybeans = new Decimal(6)
    expect(performManual(state, 'pressTofu')).toBe(true)
    expect(state.stock.soybeans.toNumber()).toBe(0)
    expect(state.stock.tofu.toNumber()).toBe(2)
  })

  it('makes as many whole units as the stock covers', () => {
    const state = createInitialState()
    state.upgrades = ['strongHands']
    state.stock.soybeans = new Decimal(4)
    expect(canPerform(state, 'pressTofu')).toBe(true)
    performManual(state, 'pressTofu')
    expect(state.stock.soybeans.toNumber()).toBe(1)
    expect(state.stock.tofu.toNumber()).toBe(1)
  })

  it('harvests two soybeans per click with strong hands', () => {
    const state = createInitialState()
    state.upgrades = ['strongHands']
    performManual(state, 'harvestSoybeans')
    expect(state.stock.soybeans.toNumber()).toBe(2)
  })
})
