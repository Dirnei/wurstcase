import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState } from '../state'
import { canPerform, performManual } from './manual'

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
})
