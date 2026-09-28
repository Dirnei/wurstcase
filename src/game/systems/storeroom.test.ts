import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../state'
import { canExpand, expandStoreroom, expansionPrice, isFull, roomFor, storeroomRoom } from './storeroom'

function stateWith(setup: (state: GameState) => void): GameState {
  const state = createInitialState()
  setup(state)
  return state
}

describe('storeroom', () => {
  it('starts a new game at level 1', () => {
    expect(createInitialState().storeroom).toBe(1)
  })

  it('doubles the room with every level', () => {
    expect(storeroomRoom(createInitialState()).toNumber()).toBe(500)
    expect(storeroomRoom(stateWith((s) => (s.storeroom = 4))).toNumber()).toBe(4000)
  })

  it('triples the expansion price with every level', () => {
    expect(expansionPrice(createInitialState()).toNumber()).toBe(100)
    expect(expansionPrice(stateWith((s) => (s.storeroom = 3))).toNumber()).toBe(900)
  })

  it('keeps room and price whole and exact across many levels', () => {
    for (let level = 1; level <= 30; level++) {
      const state = stateWith((s) => (s.storeroom = level))
      expect(storeroomRoom(state).toNumber(), `room at ${level}`).toBe(500 * 2 ** (level - 1))
      expect(expansionPrice(state).toNumber(), `price at ${level}`).toBe(100 * 3 ** (level - 1))
    }
  })

  it('leaves the free room per good', () => {
    const state = stateWith((s) => (s.stock.soybeans = new Decimal(120)))
    expect(roomFor(state, 'soybeans').toNumber()).toBe(380)
    expect(roomFor(state, 'tofu').toNumber()).toBe(500)
  })

  it('never has negative room when stock is above it', () => {
    const state = stateWith((s) => (s.stock.tofuWurst = new Decimal(2000)))
    expect(roomFor(state, 'tofuWurst').toNumber()).toBe(0)
    expect(state.stock.tofuWurst.toNumber()).toBe(2000)
  })

  it('counts a good as full at or above the room', () => {
    expect(isFull(stateWith((s) => (s.stock.soybeans = new Decimal(499))), 'soybeans')).toBe(false)
    expect(isFull(stateWith((s) => (s.stock.soybeans = new Decimal(500))), 'soybeans')).toBe(true)
    expect(isFull(stateWith((s) => (s.stock.soybeans = new Decimal(2000))), 'soybeans')).toBe(true)
  })

  it('expands by one level when the player can pay', () => {
    const state = stateWith((s) => (s.money = new Decimal(150)))
    expect(canExpand(state)).toBe(true)
    expect(expandStoreroom(state)).toBe(true)
    expect(state.storeroom).toBe(2)
    expect(state.money.toNumber()).toBe(50)
    expect(storeroomRoom(state).toNumber()).toBe(1000)
  })

  it('changes nothing when the player cannot pay', () => {
    const state = stateWith((s) => (s.money = new Decimal(99)))
    expect(canExpand(state)).toBe(false)
    expect(expandStoreroom(state)).toBe(false)
    expect(state.storeroom).toBe(1)
    expect(state.money.toNumber()).toBe(99)
  })
})
