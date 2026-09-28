import { describe, expect, it } from 'vitest'
import { BUILDING_IDS, type BuildingId } from '../content/buildings'
import { steadyIncome, steadyOutput, usedOutput } from './steady'

function owned(counts: Partial<Record<BuildingId, number>>): Record<BuildingId, number> {
  return { ...Object.fromEntries(BUILDING_IDS.map((id) => [id, 0])), ...counts } as Record<BuildingId, number>
}

describe('steadyIncome', () => {
  it('is limited by the slowest stage', () => {
    const soy = owned({ soybeanField: 1, tofuPress: 1, tofuWurstKitchen: 1 })
    expect(steadyIncome(soy, 100)).toBeCloseTo(1, 10)
  })

  it('runs a balanced chain at full speed when demand allows', () => {
    const soy = owned({ soybeanField: 3, tofuPress: 2, tofuWurstKitchen: 2 })
    expect(steadyIncome(soy, 100)).toBeCloseTo(3, 10)
  })

  it('sells what the customers do not order to the biogas plant', () => {
    const soy = owned({ soybeanField: 3, tofuPress: 2, tofuWurstKitchen: 2 })
    // 10 customers order 0.5 Tofu-Wurst per second (€3); the other 0.5 go for €1.50 each.
    expect(steadyIncome(soy, 10)).toBeCloseTo(0.5 * 3 + 0.5 * 1.5, 10)
  })

  it('sells the output of a field without the rest of its chain to the biogas plant', () => {
    expect(steadyIncome(owned({ soybeanField: 3 }), 100)).toBeCloseTo(3 * 0.3, 10)
  })

  it('sells only what the next stage does not use', () => {
    // 4 soybeans per second and the press uses 1.5; with no kitchen, its 0.5 tofu go to the biogas
    // plant at €1.50 each. MegaMeat would pay more but costs customers.
    const state = owned({ soybeanField: 4, tofuPress: 1 })
    expect(steadyIncome(state, 100)).toBeCloseTo(2.5 * 0.3 + 0.5 * 1.5, 10)
  })

  it('serves Leverkas before Tofu-Wurst when demand is short', () => {
    const both = owned({
      soybeanField: 3,
      tofuPress: 2,
      tofuWurstKitchen: 2,
      wheatField: 1,
      seitanKitchen: 1,
      leverkasOven: 1,
    })
    // 10 customers order 0.5 per second: 0.25 Leverkas (€25) and 0.25 Tofu-Wurst (€3); the other
    // 0.75 Tofu-Wurst go to the biogas plant for €1.50 each.
    expect(steadyIncome(both, 10)).toBeCloseTo(0.25 * 25 + 0.25 * 3 + 0.75 * 1.5, 10)
  })
})

describe('steadyOutput', () => {
  it('makes more from the same input with a yield upgrade', () => {
    const short = steadyOutput(owned({ soybeanField: 1, tofuPress: 1 }), ['hydraulicPress'])
    expect(short.tofu).toBeCloseTo(2 / 3, 10)
    const full = steadyOutput(owned({ soybeanField: 3, tofuPress: 1 }), ['hydraulicPress'])
    expect(full.tofu).toBeCloseTo(1, 10)
  })

  it('counts input per run, not per unit, as used', () => {
    const flow = steadyOutput(owned({ soybeanField: 3, tofuPress: 1 }), ['hydraulicPress'])
    expect(usedOutput(flow, ['hydraulicPress']).soybeans).toBeCloseTo(1.5, 10)
  })

  it('gives no bonus for the count alone', () => {
    expect(steadyOutput(owned({ soybeanField: 25 })).soybeans).toBe(25)
  })

  it('doubles a building type with its milestone upgrade', () => {
    expect(steadyOutput(owned({ soybeanField: 25 }), ['soyChain25']).soybeans).toBe(50)
  })

  it('stacks milestone upgrades with other rate upgrades', () => {
    expect(steadyOutput(owned({ soybeanField: 25 }), ['soyChain25', 'betterSeeds']).soybeans).toBe(100)
  })
})

describe('steadyIncome with upgrades', () => {
  it('applies rate and price upgrades', () => {
    const soy = owned({ soybeanField: 1, tofuPress: 1, tofuWurstKitchen: 1 })
    // Better seeds lift the field to 2 soybeans/s, so the press runs at its full 0.5 tofu/s and the
    // other 0.5 soybeans/s go to the biogas plant.
    expect(steadyIncome(soy, 100, ['betterSeeds'])).toBeCloseTo(1.5 + 0.5 * 0.3, 10)
    const wheat = owned({ wheatField: 1, seitanKitchen: 1, leverkasOven: 1 })
    expect(steadyIncome(wheat, 100, ['leverkasRecipe'])).toBeCloseTo(0.25 * 35, 10)
  })

  it('raises the demand limit with the loyalty card', () => {
    const soy = owned({ soybeanField: 3, tofuPress: 2, tofuWurstKitchen: 2 })
    expect(steadyIncome(soy, 10, ['loyaltyCard'])).toBeCloseTo(0.75 * 3 + 0.25 * 1.5, 10)
  })
})
