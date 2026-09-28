import { describe, expect, it } from 'vitest'
import { createInitialState } from '../state'
import { milestoneFactor, nextMilestone, outputFactor } from './ownedMilestones'

describe('milestoneFactor', () => {
  it('doubles output at 25, 50 and 100 copies owned', () => {
    expect(milestoneFactor(0)).toBe(1)
    expect(milestoneFactor(24)).toBe(1)
    expect(milestoneFactor(25)).toBe(2)
    expect(milestoneFactor(49)).toBe(2)
    expect(milestoneFactor(50)).toBe(4)
    expect(milestoneFactor(100)).toBe(8)
    expect(milestoneFactor(180)).toBe(8)
  })
})

describe('nextMilestone', () => {
  it('is the next threshold and the factor it brings', () => {
    expect(nextMilestone(0)).toEqual({ at: 25, factor: 2 })
    expect(nextMilestone(24)).toEqual({ at: 25, factor: 2 })
    expect(nextMilestone(25)).toEqual({ at: 50, factor: 4 })
    expect(nextMilestone(99)).toEqual({ at: 100, factor: 8 })
  })

  it('is null once every milestone is reached', () => {
    expect(nextMilestone(100)).toBeNull()
  })
})

describe('outputFactor', () => {
  it('multiplies the milestone factor with rate upgrades', () => {
    const state = createInitialState()
    state.buildings.soybeanField = 25
    state.upgrades = ['betterSeeds']
    expect(outputFactor(state, 'soybeanField')).toBe(4)
    expect(outputFactor(state, 'tofuPress')).toBe(1)
  })
})
