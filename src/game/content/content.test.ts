import { describe, expect, it } from 'vitest'
import { BUILDINGS, BUILDING_IDS, CHAINS } from './buildings'
import { BUYERS, getBuyer } from './buyers'
import { MANUAL_ACTIONS } from './manual'
import { PRODUCT_PRICES, PRODUCTS_BY_PRICE } from './products'
import { INTERMEDIATES, PRODUCTS, RAW, RESOURCES, type ProductId, type ResourceId } from './resources'

/** What one unit earns once turned into its chain's product and sold to a customer. */
function veganValue(resource: ResourceId): number {
  if ((PRODUCTS as readonly string[]).includes(resource)) {
    return PRODUCT_PRICES[resource as ProductId]
  }
  const consumer = BUILDINGS.find((building) => building.input?.resource === resource)!
  return veganValue(consumer.output) / consumer.input!.ratio
}

describe('content', () => {
  it('uses only known resources', () => {
    for (const building of BUILDINGS) {
      expect(RESOURCES, building.id).toContain(building.output)
      if (building.input) {
        expect(RESOURCES, building.id).toContain(building.input.resource)
      }
    }
    for (const action of MANUAL_ACTIONS) {
      expect(RESOURCES, action.id).toContain(action.output.resource)
      if (action.input) {
        expect(RESOURCES, action.id).toContain(action.input.resource)
      }
    }
  })

  it('prices every product and makes Leverkas the most expensive', () => {
    for (const product of PRODUCTS) {
      expect(PRODUCT_PRICES[product], product).toBeGreaterThan(0)
    }
    expect(PRODUCT_PRICES.leverkas).toBe(Math.max(...Object.values(PRODUCT_PRICES)))
  })

  it('sells products highest price first', () => {
    expect(PRODUCTS_BY_PRICE).toEqual(['leverkas', 'haferCappuccino', 'tofuWurst'])
    expect([...PRODUCTS_BY_PRICE].sort()).toEqual([...PRODUCTS].sort())
  })

  it('has unique building ids in known chains', () => {
    expect(new Set(BUILDING_IDS).size).toBe(BUILDING_IDS.length)
    for (const building of BUILDINGS) {
      expect(CHAINS).toContain(building.chain)
    }
  })

  it('lists every building after the building that makes its input', () => {
    BUILDINGS.forEach((building, index) => {
      if (!building.input) {
        return
      }
      const supplier = BUILDINGS.findIndex((other) => other.output === building.input!.resource)
      expect(supplier, building.id).toBeGreaterThanOrEqual(0)
      expect(supplier, building.id).toBeLessThan(index)
    })
  })

  it('makes the soy chain available from the start', () => {
    for (const building of BUILDINGS.filter((b) => b.chain === 'soy')) {
      expect(building.unlockAt, building.id).toBe(0)
    }
  })

  it('lets MegaMeat buy raw ingredients and intermediates, and the biogas plant everything', () => {
    expect(Object.keys(getBuyer('megaMeat').lots).sort()).toEqual([...RAW, ...INTERMEDIATES].sort())
    expect(Object.keys(getBuyer('biogas').lots).sort()).toEqual([...RESOURCES].sort())
  })

  it('sells in lots of whole units for whole euros', () => {
    for (const buyer of BUYERS) {
      for (const [resource, lot] of Object.entries(buyer.lots)) {
        expect(Number.isInteger(lot.price) && lot.price > 0, `${buyer.id} ${resource}`).toBe(true)
        expect(Number.isInteger(lot.units) && lot.units > 0, `${buyer.id} ${resource}`).toBe(true)
      }
    }
  })

  it('pays less at the biogas plant than at MegaMeat, and both less than vegan food', () => {
    const megaMeat = getBuyer('megaMeat').lots
    const biogas = getBuyer('biogas').lots
    for (const resource of RESOURCES) {
      const gas = biogas[resource]!.price / biogas[resource]!.units
      expect(gas, resource).toBeLessThan(veganValue(resource))
      const meatLot = megaMeat[resource]
      if (meatLot) {
        const meat = meatLot.price / meatLot.units
        expect(gas, resource).toBeLessThan(meat)
        expect(meat, resource).toBeLessThan(veganValue(resource))
      }
    }
  })
})
