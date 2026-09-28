import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { BUILDINGS } from '../content/buildings'
import type { ResourceId } from '../content/resources'
import type { UpgradeId } from '../content/upgrades'
import { createInitialState, type GameState } from '../state'
import { produce } from './production'

function stateWith(setup: (state: GameState) => void): GameState {
  const state = createInitialState()
  setup(state)
  return state
}

const stock = (state: GameState, resource: ResourceId) => state.stock[resource].toNumber()

describe('produce', () => {
  it('lets fields produce their raw ingredient', () => {
    const state = stateWith((s) => (s.buildings.soybeanField = 2))
    produce(state, 10)
    expect(stock(state, 'soybeans')).toBe(20)
  })

  it('gives no bonus for the count alone', () => {
    const state = stateWith((s) => (s.buildings.soybeanField = 25))
    produce(state, 1)
    expect(stock(state, 'soybeans')).toBe(25)
  })

  it("doubles a building type's output with each milestone upgrade owned", () => {
    const cases: [number, UpgradeId[], number][] = [
      [25, ['soyChain25'], 50],
      [50, ['soyChain25', 'soyChain50'], 200],
      [100, ['soyChain25', 'soyChain50', 'soyChain100'], 800],
    ]
    for (const [owned, upgrades, made] of cases) {
      const state = stateWith((s) => {
        s.buildings.soybeanField = owned
        s.upgrades = upgrades
        s.storeroom = 10
      })
      produce(state, 1)
      expect(stock(state, 'soybeans'), `${owned} fields`).toBe(made)
    }
  })

  it('takes input at the multiplied rate', () => {
    const state = stateWith((s) => {
      s.buildings.tofuPress = 26
      s.upgrades = ['soyChain25']
      s.stock.soybeans = new Decimal(200)
    })
    produce(state, 1)
    expect(stock(state, 'tofu')).toBe(26)
    expect(stock(state, 'soybeans')).toBe(122)
  })

  it('processes at full speed when input is plentiful', () => {
    const state = stateWith((s) => {
      s.buildings.tofuPress = 1
      s.stock.soybeans = new Decimal(100)
    })
    produce(state, 10)
    expect(stock(state, 'tofu')).toBe(5)
    expect(stock(state, 'soybeans')).toBe(85)
    expect(state.waiting).toEqual({})
  })

  it('makes only whole units and keeps the rest as progress', () => {
    const state = stateWith((s) => {
      s.buildings.tofuPress = 1
      s.stock.soybeans = new Decimal(100)
    })
    produce(state, 1)
    expect(stock(state, 'tofu')).toBe(0)
    expect(stock(state, 'soybeans')).toBe(100)
    expect(state.progress.tofuPress).toBeCloseTo(0.5, 9)

    produce(state, 1)
    expect(stock(state, 'tofu')).toBe(1)
    expect(stock(state, 'soybeans')).toBe(97)
  })

  it('makes nothing and waits for the input when it is missing', () => {
    const state = stateWith((s) => (s.buildings.tofuPress = 1))
    produce(state, 2)
    expect(stock(state, 'tofu')).toBe(0)
    expect(state.waiting).toEqual({ tofuPress: 'soybeans' })
  })

  it('does not start a unit without its whole input', () => {
    const state = stateWith((s) => {
      s.buildings.tofuPress = 1
      s.stock.soybeans = new Decimal(2)
    })
    produce(state, 2)
    expect(stock(state, 'tofu')).toBe(0)
    expect(stock(state, 'soybeans')).toBe(2)
    expect(state.waiting).toEqual({ tofuPress: 'soybeans' })
  })

  it('does not bank progress while waiting', () => {
    const state = stateWith((s) => (s.buildings.tofuPress = 1))
    produce(state, 60)
    expect(state.progress.tofuPress).toBe(1)

    state.stock.soybeans = new Decimal(30)
    produce(state, 0.1)
    expect(stock(state, 'tofu')).toBe(1)
    expect(stock(state, 'soybeans')).toBe(27)
  })

  it('stops waiting once supply returns', () => {
    const state = stateWith((s) => (s.buildings.tofuPress = 1))
    produce(state, 2)
    expect(state.waiting.tofuPress).toBe('soybeans')
    state.stock.soybeans = new Decimal(100)
    produce(state, 1)
    expect(state.waiting).toEqual({})
  })

  it('keeps every stock whole and never negative', () => {
    const state = stateWith((s) => {
      s.buildings.soybeanField = 1
      s.buildings.tofuPress = 7
      s.buildings.tofuWurstKitchen = 3
      s.buildings.wheatField = 2
      s.buildings.seitanKitchen = 3
      s.buildings.leverkasOven = 1
      s.stock.soybeans = new Decimal(4)
    })
    for (let i = 0; i < 200; i++) {
      produce(state, 0.037 + (i % 7) * 0.05)
    }
    for (const amount of Object.values(state.stock)) {
      expect(amount.gte(0)).toBe(true)
      expect(amount.floor().eq(amount), amount.toString()).toBe(true)
    }
  })

  it('passes output down the chain within the same tick', () => {
    const state = stateWith((s) => {
      s.buildings.soybeanField = 3
      s.buildings.tofuPress = 1
      s.buildings.tofuWurstKitchen = 1
    })
    produce(state, 2)
    // 6 soybeans; the press makes 1 tofu from 3 of them; the kitchen turns it into 1 Tofu-Wurst.
    expect(stock(state, 'soybeans')).toBe(3)
    expect(stock(state, 'tofu')).toBe(0)
    expect(stock(state, 'tofuWurst')).toBe(1)
  })

  it('agrees within one unit per building type for one big tick and many small ticks', () => {
    const setup = (s: GameState) => {
      s.buildings.soybeanField = 1
      s.buildings.tofuPress = 1
      s.buildings.tofuWurstKitchen = 1
      s.buildings.wheatField = 1
      s.buildings.seitanKitchen = 2
      s.buildings.leverkasOven = 1
      s.stock.soybeans = new Decimal(10)
    }
    const once = stateWith(setup)
    produce(once, 60)
    const split = stateWith(setup)
    for (let i = 0; i < 600; i++) {
      produce(split, 0.1)
    }

    expect(once.waiting.tofuPress).toBe('soybeans')
    for (const [resource, amount] of Object.entries(once.stock)) {
      const touching = BUILDINGS.filter(
        (b) => once.buildings[b.id] > 0 && (b.output === resource || b.input?.resource === resource),
      ).length
      const difference = split.stock[resource as ResourceId].sub(amount).abs().toNumber()
      expect(difference, resource).toBeLessThanOrEqual(touching)
    }
    expect(stock(once, 'tofuWurst')).toBeGreaterThan(0)
  })
})

describe('shortage', () => {
  it('marks the input of a waiting building as short', () => {
    const state = stateWith((s) => (s.buildings.tofuPress = 1))
    produce(state, 2)
    expect(state.shortage.soybeans).toBeGreaterThan(0)
    expect(state.shortage.tofu).toBeUndefined()
  })

  it('stays marked while a press keeps running short', () => {
    const state = stateWith((s) => {
      s.buildings.soybeanField = 1
      s.buildings.tofuPress = 1
    })
    produce(state, 2)
    let alternated = false
    for (let i = 0; i < 200; i++) {
      produce(state, 0.1)
      alternated ||= state.waiting.tofuPress === undefined
      expect(state.shortage.soybeans, `tick ${i}`).toBeGreaterThan(0)
    }
    expect(alternated).toBe(true)
  })

  it('clears 3 seconds after the last shortage, not earlier', () => {
    const state = stateWith((s) => (s.buildings.tofuPress = 1))
    produce(state, 2)
    state.stock.soybeans = new Decimal(1000)
    for (let i = 0; i < 29; i++) {
      produce(state, 0.1)
    }
    expect(state.shortage.soybeans).toBeGreaterThan(0)
    produce(state, 0.2)
    expect(state.shortage).toEqual({})
  })
})

describe('upgrade effects on production', () => {
  it('makes more output from the same input with a yield upgrade', () => {
    const state = createInitialState()
    state.buildings.tofuPress = 1
    state.upgrades = ['hydraulicPress']
    state.stock.soybeans = new Decimal(100)
    produce(state, 10)
    expect(state.stock.tofu.toNumber()).toBe(10)
    expect(state.stock.soybeans.toNumber()).toBe(85)
  })

  it('counts runs, not units, against the input', () => {
    const state = createInitialState()
    state.buildings.tofuPress = 2
    state.upgrades = ['hydraulicPress']
    state.stock.soybeans = new Decimal(30)
    produce(state, 10)
    expect(state.stock.soybeans.toNumber()).toBe(0)
    expect(state.stock.tofu.toNumber()).toBe(20)
  })

  it('stacks yield with rate upgrades', () => {
    const state = createInitialState()
    state.buildings.tofuPress = 1
    state.upgrades = ['hydraulicPress', 'soyChain25']
    state.stock.soybeans = new Decimal(100)
    produce(state, 1)
    expect(state.stock.tofu.toNumber()).toBe(2)
    expect(state.stock.soybeans.toNumber()).toBe(97)
  })

  it('doubles soybean fields with better seeds', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 5
    state.upgrades = ['betterSeeds']
    produce(state, 1)
    expect(state.stock.soybeans.toNumber()).toBe(10)
  })
})

describe('storeroom room', () => {
  it('waits without using input when the output is full', () => {
    const state = stateWith((s) => {
      s.buildings.tofuPress = 1
      s.progress.tofuPress = 0.99
      s.stock.tofu = new Decimal(500)
      s.stock.soybeans = new Decimal(30)
    })
    produce(state, 1)
    expect(stock(state, 'tofu')).toBe(500)
    expect(stock(state, 'soybeans')).toBe(30)
    expect(state.progress.tofuPress).toBe(1)
    expect(state.blocked.tofuPress).toBe('tofu')
    expect(state.full.tofu).toBeDefined()
    expect(state.shortage.soybeans).toBeUndefined()
  })

  it('does not run when the whole run would overshoot the room', () => {
    const state = stateWith((s) => {
      s.buildings.tofuPress = 1
      s.upgrades = ['hydraulicPress']
      s.progress.tofuPress = 0.99
      s.stock.tofu = new Decimal(499)
      s.stock.soybeans = new Decimal(30)
    })
    produce(state, 1)
    expect(stock(state, 'tofu')).toBe(499)
    expect(stock(state, 'soybeans')).toBe(30)
    expect(state.blocked.tofuPress).toBe('tofu')
  })

  it('stops fields at the room', () => {
    const state = stateWith((s) => (s.buildings.soybeanField = 3))
    for (let second = 0; second < 1000; second++) {
      produce(state, 1)
    }
    expect(stock(state, 'soybeans')).toBe(500)
    expect(state.progress.soybeanField).toBe(1)
  })

  it('marks a good full at the room and clears it 3 seconds after it was last full', () => {
    const state = stateWith((s) => {
      s.buildings.soybeanField = 1
      s.stock.soybeans = new Decimal(499)
    })
    produce(state, 1)
    expect(stock(state, 'soybeans')).toBe(500)
    expect(state.full.soybeans).toBeDefined()

    produce(state, 1) // the field waits
    state.stock.soybeans = new Decimal(400) // sold
    produce(state, 1)
    produce(state, 1)
    expect(state.full.soybeans, 'held for 3 s after the last wait').toBeDefined()
    produce(state, 1)
    expect(state.full.soybeans).toBeUndefined()
  })

  it('marks stock above the room as full without anything waiting on it', () => {
    const state = stateWith((s) => (s.stock.tofuWurst = new Decimal(2000)))
    produce(state, 1)
    expect(state.full.tofuWurst).toBeDefined()
  })

  it('keeps stock above the room and lets its buildings wait until it drops below', () => {
    const state = stateWith((s) => {
      s.buildings.tofuWurstKitchen = 1
      s.stock.tofu = new Decimal(100)
      s.stock.tofuWurst = new Decimal(2000)
    })
    produce(state, 10)
    expect(stock(state, 'tofuWurst')).toBe(2000)
    expect(stock(state, 'tofu')).toBe(100)
    state.stock.tofuWurst = new Decimal(400)
    produce(state, 1)
    expect(stock(state, 'tofuWurst')).toBeGreaterThan(400)
  })
})
