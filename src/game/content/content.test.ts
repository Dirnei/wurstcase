import { describe, expect, it } from 'vitest'
import de from '../../i18n/de.json'
import en from '../../i18n/en.json'
import { NAME_POOL_SIZE, SPECIES, SPECIES_IDS } from './animals'
import { BUILDINGS, BUILDING_IDS, CHAINS } from './buildings'
import { BUYERS, getBuyer } from './buyers'
import { MANUAL_ACTIONS } from './manual'
import { PRODUCT_PRICES, PRODUCTS_BY_PRICE } from './products'
import { INTERMEDIATES, PRODUCTS, RAW, RESOURCES, type ProductId, type ResourceId } from './resources'
import { LEBENSHOF_UNLOCK_AT, SHELTER_IDS, SHELTERS } from './shelters'

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

  it('has one manual action per building that does the same step', () => {
    for (const building of BUILDINGS) {
      const actions = MANUAL_ACTIONS.filter((action) => action.building === building.id)
      expect(actions, building.id).toHaveLength(1)
      const [action] = actions
      expect(action.chain, action.id).toBe(building.chain)
      expect(action.output, action.id).toEqual({ resource: building.output, amount: 1 })
      expect(action.input, action.id).toEqual(
        building.input && { resource: building.input.resource, amount: building.input.ratio },
      )
    }
    expect(MANUAL_ACTIONS).toHaveLength(BUILDINGS.length)
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

  it('has unique species and shelter ids', () => {
    expect(new Set(SPECIES_IDS).size).toBe(SPECIES_IDS.length)
    expect(new Set(SHELTER_IDS).size).toBe(SHELTER_IDS.length)
  })

  it('gives every species and shelter a positive price, unlock, space and awareness', () => {
    for (const species of SPECIES) {
      for (const value of [species.basePrice, species.unlockAt, species.space, species.awareness]) {
        expect(value, species.id).toBeGreaterThan(0)
      }
    }
    for (const shelter of SHELTERS) {
      for (const value of [shelter.basePrice, shelter.unlockAt, shelter.space]) {
        expect(value, shelter.id).toBeGreaterThan(0)
      }
    }
  })

  it('has a full name pool for every species in both languages', () => {
    for (const dictionary of [de, en] as Record<string, string>[]) {
      for (const species of SPECIES_IDS) {
        for (let index = 0; index < NAME_POOL_SIZE; index++) {
          expect(dictionary[`animal.${species}.name.${index}`], `${species} ${index}`).toBeTruthy()
        }
        expect(dictionary[`animal.${species}.name.${NAME_POOL_SIZE}`], species).toBeUndefined()
      }
    }
  })

  it('lists species by price', () => {
    const prices = SPECIES.map((species) => species.basePrice)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('unlocks the Lebenshof no later than the cheapest species and shelter', () => {
    expect(LEBENSHOF_UNLOCK_AT).toBeLessThanOrEqual(Math.min(...SPECIES.map((s) => s.unlockAt)))
    expect(LEBENSHOF_UNLOCK_AT).toBeLessThanOrEqual(Math.min(...SHELTERS.map((s) => s.unlockAt)))
  })
})
