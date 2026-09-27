import { describe, expect, it } from 'vitest'
import { BUILDING_IDS, type BuildingId } from '../content/buildings'
import { steadyIncome } from './steady'

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

  it('is limited by demand', () => {
    const soy = owned({ soybeanField: 3, tofuPress: 2, tofuWurstKitchen: 2 })
    expect(steadyIncome(soy, 10)).toBeCloseTo(1.5, 10)
  })

  it('earns nothing from a field without the rest of its chain', () => {
    expect(steadyIncome(owned({ soybeanField: 1 }), 100)).toBe(0)
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
    // 10 customers order 0.5 per second: 0.25 Leverkas (€25) and 0.25 Tofu-Wurst (€3).
    expect(steadyIncome(both, 10)).toBeCloseTo(0.25 * 25 + 0.25 * 3, 10)
  })
})
