import { getSpecies, type SpeciesId } from '../content/animals'
import { BUILDINGS, type BuildingId } from '../content/buildings'
import { BUYERS, type BuyerId } from '../content/buyers'
import { KITCHENS, PRODUCT_PRICES } from '../content/products'
import { PRODUCTS, RESOURCES, type ProductId, type ResourceId } from '../content/resources'
import { ORDERS_PER_CUSTOMER } from '../content/town'
import { createInitialState } from '../state'
import { buildingPrice } from '../systems/buildings'
import { animalPrice } from '../systems/rescue'
import { buildingIncome, veganValue } from './value'

export const MAX_COPIES = 50

export interface CostPoint {
  owned: number
  /** Price of the next copy with this many owned. */
  nextPrice: number
  /** Total paid for this many copies. */
  spent: number
  /** Income per second of this many copies, if the chain and demand keep up. */
  income: number
}

/** Price and income of a building for 0 to maxCopies copies, from the game's own price rule. */
export function costCurve(id: BuildingId, maxCopies = MAX_COPIES): CostPoint[] {
  const state = createInitialState()
  const points: CostPoint[] = []
  let spent = 0
  for (let owned = 0; owned <= maxCopies; owned++) {
    state.buildings[id] = owned
    const nextPrice = buildingPrice(state, id).toNumber()
    points.push({ owned, nextPrice, spent, income: owned * buildingIncome(id) })
    spent += nextPrice
  }
  return points
}

/** Seconds each copy (1st to maxCopies-th) of every building takes to pay for itself. */
export function paybackCurves(maxCopies = MAX_COPIES): { id: BuildingId; seconds: number[] }[] {
  return BUILDINGS.map((building) => ({
    id: building.id,
    seconds: costCurve(building.id, maxCopies - 1).map((point) => point.nextPrice / buildingIncome(building.id)),
  }))
}

export interface DemandPoint {
  customers: number
  /** Income per second if every order is filled with this product. */
  income: Record<ProductId, number>
  /** Kitchens of this product that the demand keeps busy. */
  kitchens: Record<ProductId, number>
}

export function demandCeiling(customerCounts: readonly number[]): DemandPoint[] {
  return customerCounts.map((customers) => {
    const orders = customers * ORDERS_PER_CUSTOMER
    const perProduct = (value: (product: ProductId) => number) =>
      Object.fromEntries(PRODUCTS.map((product) => [product, value(product)])) as Record<ProductId, number>
    return {
      customers,
      income: perProduct((product) => orders * PRODUCT_PRICES[product]),
      kitchens: perProduct((product) => orders / KITCHENS.find((k) => k.output === product)!.rate),
    }
  })
}

export interface BulkRow {
  resource: ResourceId
  veganValue: number
  /** Price per unit, and as a share of the vegan value; missing if the buyer does not take it. */
  buyers: Partial<Record<BuyerId, { perUnit: number; share: number }>>
}

export function bulkTable(): BulkRow[] {
  return RESOURCES.map((resource) => {
    const value = veganValue(resource)
    const buyers: BulkRow['buyers'] = {}
    for (const buyer of BUYERS) {
      const lot = buyer.lots[resource]
      if (lot) {
        const perUnit = lot.price / lot.units
        buyers[buyer.id] = { perUnit, share: perUnit / value }
      }
    }
    return { resource, veganValue: value, buyers }
  })
}

export interface AnimalPoint {
  owned: number
  nextPrice: number
  /** Awareness per second of this many animals. */
  awareness: number
}

/** MegaMeat's price and the herd's awareness for 0 to maxAnimals animals of a species. */
export function animalCurve(species: SpeciesId, maxAnimals = MAX_COPIES): AnimalPoint[] {
  const state = createInitialState()
  const points: AnimalPoint[] = []
  for (let owned = 0; owned <= maxAnimals; owned++) {
    points.push({
      owned,
      nextPrice: animalPrice(state, species).toNumber(),
      awareness: owned * getSpecies(species).awareness,
    })
    state.residents.push({ species, name: 0 })
  }
  return points
}
