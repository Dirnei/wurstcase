import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { HINTS, SATIRE } from '../content/headlines'
import { createInitialState, type GameState } from '../state'
import { createTickerMemory, hintApplies, nextHeadline } from './ticker'

/** A repeating sequence of pseudo-random numbers, so runs are reproducible. */
function sequence(...values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length]
}

function headlines(state: GameState, count: number, random = sequence(0.1, 0.7, 0.4, 0.9, 0.2)): string[] {
  let memory = createTickerMemory()
  const keys: string[] = []
  for (let i = 0; i < count; i++) {
    const next = nextHeadline(state, memory, random)
    keys.push(next.key)
    memory = next.memory
  }
  return keys
}

/** A state in which no tutorial hint applies. */
function settled(earned = 0): GameState {
  const state = createInitialState()
  state.totalEarned = new Decimal(earned)
  state.buildings.soybeanField = 1
  state.buildings.tofuPress = 1
  return state
}

const hint = (id: string) => HINTS.find((h) => h.id === id)!

describe('nextHeadline', () => {
  it('shows the soybean field hint within the first two headlines of a new game', () => {
    expect(headlines(createInitialState(), 2)).toContain('headline.hint.soybeanField')
  })

  it('moves on to the tofu press hint once a field is owned', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 1
    const keys = headlines(state, 6)
    expect(keys).not.toContain('headline.hint.soybeanField')
    expect(keys).toContain('headline.hint.tofuPress')
  })

  it('shows hints in every other slot while one applies', () => {
    const keys = headlines(createInitialState(), 6)
    expect(keys.filter((_, i) => i % 2 === 1).every((key) => key.startsWith('headline.hint.'))).toBe(true)
    expect(keys.filter((_, i) => i % 2 === 0).every((key) => key.startsWith('headline.satire.'))).toBe(true)
  })

  it('alternates between hints when several apply', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 1
    state.totalEarned = new Decimal(200)
    const hints = headlines(state, 8).filter((key) => key.startsWith('headline.hint.'))
    expect(new Set(hints).size).toBeGreaterThan(1)
    hints.forEach((key, i) => i > 0 && expect(key).not.toBe(hints[i - 1]))
  })

  it('shows only satire when no hint applies', () => {
    expect(headlines(settled(), 10).every((key) => key.startsWith('headline.satire.'))).toBe(true)
  })

  it('never shows satire above the total earned', () => {
    const allowed = SATIRE.filter((s) => s.unlockAt <= 0).map((s) => `headline.satire.${s.id}`)
    for (const key of headlines(settled(0), 40, Math.random)) {
      expect(allowed).toContain(key)
    }
  })

  it('does not repeat a satirical headline within the next 3', () => {
    const keys = headlines(settled(0), 40, Math.random)
    for (let i = 0; i + 3 < keys.length; i++) {
      expect(new Set(keys.slice(i, i + 4)).size).toBe(4)
    }
  })
})

describe('hintApplies', () => {
  it('checks owned buildings', () => {
    const state = createInitialState()
    expect(hintApplies(state, hint('soybeanField'))).toBe(true)
    expect(hintApplies(state, hint('tofuPress'))).toBe(false)
    state.buildings.soybeanField = 1
    expect(hintApplies(state, hint('soybeanField'))).toBe(false)
    expect(hintApplies(state, hint('tofuPress'))).toBe(true)
  })

  it('checks unlocked buildings', () => {
    const state = createInitialState()
    expect(hintApplies(state, hint('wheat'))).toBe(false)
    state.totalEarned = new Decimal(200)
    expect(hintApplies(state, hint('wheat'))).toBe(true)
    state.buildings.wheatField = 1
    expect(hintApplies(state, hint('wheat'))).toBe(false)
  })

  it('checks whether the assistant is offered', () => {
    const state = createInitialState()
    expect(hintApplies(state, hint('assistant'))).toBe(false)
    state.totalEarned = new Decimal(50)
    expect(hintApplies(state, hint('assistant'))).toBe(true)
    state.assistant = true
    expect(hintApplies(state, hint('assistant'))).toBe(false)
  })

  it('checks for an empty Lebenshof', () => {
    const state = createInitialState()
    expect(hintApplies(state, hint('lebenshof'))).toBe(false)
    state.totalEarned = new Decimal(100)
    expect(hintApplies(state, hint('lebenshof'))).toBe(true)
    state.residents.push({ species: 'chicken', name: 0 })
    expect(hintApplies(state, hint('lebenshof'))).toBe(false)
  })

  it('checks for an offered Aktion that was never run', () => {
    const state = createInitialState()
    expect(hintApplies(state, hint('flyer'))).toBe(false)
    state.totalEarned = new Decimal(1_000)
    expect(hintApplies(state, hint('flyer'))).toBe(true)
    state.aktionen.runs.flyer = 1
    expect(hintApplies(state, hint('flyer'))).toBe(false)
  })

  it('checks whether a fact check can run', () => {
    const state = createInitialState()
    state.awareness = new Decimal(1_000)
    state.megaMeat = { active: { event: 'study', remaining: 30 }, nextIn: null, nextIndex: 2, started: 2 }
    expect(hintApplies(state, hint('factCheck'))).toBe(true)
    state.awareness = new Decimal(10)
    expect(hintApplies(state, hint('factCheck'))).toBe(false)
  })
})
