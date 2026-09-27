import { describe, expect, it } from 'vitest'
import de from '../../i18n/de.json'
import en from '../../i18n/en.json'
import { AKTION_IDS, AKTIONEN } from './aktionen'
import { NAME_POOL_SIZE, SPECIES, SPECIES_IDS } from './animals'
import { BUILDINGS, BUILDING_IDS, CHAINS } from './buildings'
import { BUYERS, getBuyer } from './buyers'
import { HINTS, SATIRE } from './headlines'
import { MANUAL_ACTIONS } from './manual'
import { MEGAMEAT_EVENT_IDS, MEGAMEAT_EVENTS } from './megaMeatEvents'
import { UPGRADE_IDS, UPGRADES } from './upgrades'
import { PRODUCT_PRICES, PRODUCTS_BY_PRICE } from './products'
import { veganValue } from '../balance/value'
import { INTERMEDIATES, PRODUCTS, RAW, RESOURCES, type ProductId } from './resources'
import { LEBENSHOF_UNLOCK_AT, SHELTER_IDS, SHELTERS } from './shelters'

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

  it('has valid Aktionen', () => {
    expect(new Set(AKTION_IDS).size).toBe(AKTION_IDS.length)
    for (const aktion of AKTIONEN) {
      expect(aktion.cost, aktion.id).toBeGreaterThan(0)
      expect(aktion.cooldown, aktion.id).toBeGreaterThan(0)
      expect(Boolean(aktion.endsEvent) !== Boolean(aktion.customers), aktion.id).toBe(true)
      if (aktion.requiresSpecies) {
        expect(SPECIES_IDS, aktion.id).toContain(aktion.requiresSpecies)
      }
    }
    expect(AKTIONEN.filter((aktion) => aktion.endsEvent)).toHaveLength(1)
  })

  it('has counter-events that last and change something', () => {
    expect(new Set(MEGAMEAT_EVENT_IDS).size).toBe(MEGAMEAT_EVENT_IDS.length)
    for (const event of MEGAMEAT_EVENTS) {
      expect(event.duration, event.id).toBeGreaterThan(0)
      expect(Object.keys(event.factors).length, event.id).toBeGreaterThan(0)
    }
  })

  it('writes hints only about known buildings and Aktionen', () => {
    expect(new Set(HINTS.map((hint) => hint.id)).size).toBe(HINTS.length)
    for (const hint of HINTS) {
      expect(hint.when.length, hint.id).toBeGreaterThan(0)
      for (const clause of hint.when) {
        if ('owned' in clause) expect(BUILDING_IDS, hint.id).toContain(clause.owned)
        if ('unlocked' in clause) expect(BUILDING_IDS, hint.id).toContain(clause.unlocked)
        if ('aktionNeverRun' in clause) expect(AKTION_IDS, hint.id).toContain(clause.aktionNeverRun)
      }
    }
  })

  it('has enough satirical headlines, several from the start', () => {
    expect(new Set(SATIRE.map((s) => s.id)).size).toBe(SATIRE.length)
    expect(SATIRE.length).toBeGreaterThanOrEqual(12)
    expect(SATIRE.filter((s) => s.unlockAt === 0).length).toBeGreaterThanOrEqual(4)
    expect(Math.max(...SATIRE.map((s) => s.unlockAt))).toBeLessThanOrEqual(20_000)
  })

  it('has every ticker, Aktion and event text in both languages', () => {
    const keys = [
      ...SATIRE.map((s) => `headline.satire.${s.id}`),
      ...HINTS.map((h) => `headline.hint.${h.id}`),
      ...MEGAMEAT_EVENT_IDS.flatMap((id) => [
        `headline.event.${id}`,
        `event.${id}.name`,
        `event.${id}.description`,
        `event.${id}.effect`,
      ]),
      ...AKTION_IDS.map((id) => `aktion.${id}.name`),
      ...UPGRADE_IDS.flatMap((id) => [`upgrade.${id}.name`, `upgrade.${id}.line`]),
      ...UPGRADES.map((u) => `upgrade.effect.${u.effect.kind}`),
    ]
    for (const dictionary of [de, en] as Record<string, string>[]) {
      for (const key of keys) {
        expect(dictionary[key], key).toBeTruthy()
      }
    }
  })

  it('has valid upgrades', () => {
    expect(new Set(UPGRADE_IDS).size).toBe(UPGRADE_IDS.length)
    expect(UPGRADES).toHaveLength(17)
    for (const upgrade of UPGRADES) {
      expect(Number.isInteger(upgrade.price) && upgrade.price > 0, upgrade.id).toBe(true)
      expect(upgrade.when.length, upgrade.id).toBeGreaterThan(0)
      for (const clause of upgrade.when) {
        if ('owned' in clause) expect(BUILDING_IDS, upgrade.id).toContain(clause.owned)
        if ('shelters' in clause) expect(SHELTER_IDS, upgrade.id).toContain(clause.shelters)
        if ('residents' in clause && clause.residents !== 'any') expect(SPECIES_IDS, upgrade.id).toContain(clause.residents)
        if ('aktionRuns' in clause) expect(AKTION_IDS, upgrade.id).toContain(clause.aktionRuns)
      }
      const effect = upgrade.effect
      if ('factor' in effect) expect(effect.factor, upgrade.id).toBeGreaterThan(0)
      if (effect.kind === 'manual') expect(Number.isInteger(effect.factor), upgrade.id).toBe(true)
      if ('add' in effect) expect(Number.isInteger(effect.add) && effect.add > 0, upgrade.id).toBe(true)
      if (effect.kind === 'rate') for (const id of effect.buildings) expect(BUILDING_IDS, upgrade.id).toContain(id)
    }
  })

  it('keeps the product order when every price upgrade is owned', () => {
    const upgraded = (product: ProductId) =>
      PRODUCT_PRICES[product] +
      UPGRADES.reduce((sum, u) => sum + (u.effect.kind === 'price' && u.effect.product === product ? u.effect.add : 0), 0)
    const order = [...PRODUCTS].sort((a, b) => upgraded(b) - upgraded(a))
    expect(order).toEqual(PRODUCTS_BY_PRICE)
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
