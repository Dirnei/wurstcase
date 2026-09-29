import { describe, expect, it } from 'vitest'
import { BUILDING_IDS, type BuildingId } from '../content/buildings'
import { steadyIncome, steadyOutput, usedOutput } from './steady'

/**
 * What a steady surplus of `rate` products per second at `price` earns at the biogas plant, whose
 * product markets flood: the flood settles at rate × price × τ euros, τ = 20 s ÷ ln 2, K = €1,575.
 */
function biogas(rate: number, price: number): number {
  const settled = rate * price * (20 / Math.LN2)
  return rate * price * (1_575 / (1_575 + settled))
}

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
    // 10 customers order 0.5 Tofu-Wurst per second (€3); the other 0.5 go for €2 each, less the flood.
    expect(steadyIncome(soy, 10)).toBeCloseTo(0.5 * 3 + biogas(0.5, 2), 10)
  })

  it('sells the output of a field without the rest of its chain to the biogas plant', () => {
    expect(steadyIncome(owned({ soybeanField: 3 }), 100)).toBeCloseTo((3 * 3) / 7, 10)
  })

  it('sells only what the next stage does not use', () => {
    // 4 soybeans per second and the press uses 1.5; with no kitchen, its 0.5 tofu go to the biogas
    // plant at €1.60 each. MegaMeat would pay more but costs customers.
    const state = owned({ soybeanField: 4, tofuPress: 1 })
    expect(steadyIncome(state, 100)).toBeCloseTo((2.5 * 3) / 7 + 0.5 * 1.6, 10)
  })

  it('serves Leverkas before Tofu-Wurst when demand is short', () => {
    const both = owned({
      soybeanField: 3,
      tofuPress: 2,
      tofuWurstKitchen: 2,
      wheatField: 4,
      seitanKitchen: 3,
      leverkasOven: 2,
    })
    // 10 customers order 0.5 per second, all of it Leverkas (€25) from the balanced wheat set; the
    // 1 Tofu-Wurst per second goes to the biogas plant for €2 each, less the flood.
    expect(steadyIncome(both, 10)).toBeCloseTo(0.5 * 25 + biogas(1, 2), 10)
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
    expect(steadyIncome(soy, 100, ['betterSeeds'])).toBeCloseTo(1.5 + (0.5 * 3) / 7, 10)
    const wheat = owned({ wheatField: 4, seitanKitchen: 3, leverkasOven: 2 })
    expect(steadyIncome(wheat, 100, ['leverkasRecipe'])).toBeCloseTo(0.5 * 35, 10)
  })

  it('raises the demand limit with the loyalty card', () => {
    const soy = owned({ soybeanField: 3, tofuPress: 2, tofuWurstKitchen: 2 })
    expect(steadyIncome(soy, 10, ['loyaltyCard'])).toBeCloseTo(0.75 * 3 + biogas(0.25, 2), 10)
  })
})

describe('steadyIncome under a demand factor', () => {
  it('sells half the orders to customers when the demand factor is 0.5', () => {
    // The balanced soy line makes 1 Tofu-Wurst per second; 10 customers order 0.5 per second, halved to 0.25.
    const soy = owned({ soybeanField: 3, tofuPress: 2, tofuWurstKitchen: 2 })
    const full = steadyIncome(soy, 10)
    const halved = steadyIncome(soy, 10, [], 'biogas', 0.5)
    // The quarter of a Tofu-Wurst per second no longer ordered goes to the biogas plant instead of €3.
    expect(full).toBeCloseTo(0.5 * 3 + biogas(0.5, 2), 10)
    expect(halved).toBeCloseTo(0.25 * 3 + biogas(0.75, 2), 10)
  })
})

describe('steadyIncome with flooded biogas products', () => {
  it('earns at most about €55 per second from surplus Leverkas at the biogas plant', () => {
    // 100 balanced wheat sets make 25 Leverkas per second; with no customers all of it is surplus.
    const wheat = owned({ wheatField: 200, seitanKitchen: 150, leverkasOven: 100 })
    const income = steadyIncome(wheat, 0)
    expect(income).toBeLessThan((1_575 * Math.LN2) / 20)
    expect(income).toBeCloseTo(biogas(25, 17), 10)
  })
})

describe('steadyIncome and the demand curve', () => {
  it('sells 800 customers only the curve’s 30 orders per second', () => {
    // 150 Tofu-Wurst per second from a big soy line; the other 120 go to the biogas plant.
    const soy = owned({ soybeanField: 450, tofuPress: 300, tofuWurstKitchen: 300 })
    expect(steadyIncome(soy, 800)).toBeCloseTo(30 * 3 + biogas(120, 2), 10)
  })
})
