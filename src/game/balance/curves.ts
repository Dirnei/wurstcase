import { getSpecies, type SpeciesId } from '../content/animals'
import { BUILDINGS, CHAINS, type BuildingId, type ChainId } from '../content/buildings'
import { BUYERS, type BuyerId } from '../content/buyers'
import { KITCHENS, PRODUCT_PRICES } from '../content/products'
import { PRODUCTS, RESOURCES, type ProductId, type ResourceId } from '../content/resources'
import { ORDERS_PER_CUSTOMER } from '../content/town'
import { CHAIN_MILESTONES, type UpgradeId } from '../content/upgrades'
import type { GameState } from '../state'
import { createInitialState } from '../state'
import { buildingPrice } from '../systems/buildings'
import { fullPrice, isFlooded, lotFor } from '../systems/bulkSales'
import { animalPrice } from '../systems/rescue'
import { steadyOutput } from './steady'
import { buildingIncome, chainBalance, marketValue, veganValue } from './value'

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

/** Income per second of this many copies of a building, without upgrades. */
function incomeOf(id: BuildingId, owned: number): number {
  return owned * buildingIncome(id)
}

/** Chain milestones on offer with these buildings; the chain set chart assumes each is bought at once. */
function completedMilestones(buildings: GameState['buildings']): UpgradeId[] {
  return CHAIN_MILESTONES.filter(({ upgrade }) =>
    upgrade.when.every((clause) => 'owned' in clause && buildings[clause.owned] >= clause.atLeast),
  ).map(({ upgrade }) => upgrade.id)
}

const milestonePrice = (id: UpgradeId) => CHAIN_MILESTONES.find((m) => m.upgrade.id === id)!.upgrade.price

/** Price and income of a building for 0 to maxCopies copies, from the game's own price rule. */
export function costCurve(id: BuildingId, maxCopies = MAX_COPIES): CostPoint[] {
  const state = createInitialState()
  const points: CostPoint[] = []
  let spent = 0
  for (let owned = 0; owned <= maxCopies; owned++) {
    state.buildings[id] = owned
    const nextPrice = buildingPrice(state, id).toNumber()
    points.push({ owned, nextPrice, spent, income: incomeOf(id, owned) })
    spent += nextPrice
  }
  return points
}

/** Seconds each copy (1st to maxCopies-th) of every building takes to pay for itself. */
export function paybackCurves(maxCopies = MAX_COPIES): { id: BuildingId; seconds: number[] }[] {
  return BUILDINGS.map((building) => ({
    id: building.id,
    seconds: costCurve(building.id, maxCopies - 1).map(
      (point) => point.nextPrice / (incomeOf(building.id, point.owned + 1) - point.income),
    ),
  }))
}

export const MAX_SETS = 25

export interface SetPoint {
  /** Price of the k-th balanced set with k - 1 sets owned. */
  price: number
  /** Income per second the set adds, if demand keeps up. */
  income: number
  seconds: number
}

/**
 * Payback of the 1st to maxSets-th balanced set of every chain: all its buildings at their own
 * prices, and the product output the set adds at the customer price, milestones included.
 */
export function chainSetPayback(maxSets = MAX_SETS): { chain: ChainId; sets: SetPoint[] }[] {
  return CHAINS.map((chain) => {
    const balance = chainBalance(chain)
    const state = createInitialState()
    const income = () =>
      (steadyOutput(state.buildings, completedMilestones(state.buildings))[balance.product] ?? 0) *
      PRODUCT_PRICES[balance.product]
    const sets: SetPoint[] = []
    for (let k = 0; k < maxSets; k++) {
      const before = income()
      const ownedBefore = completedMilestones(state.buildings)
      let price = 0
      for (const { id, count } of balance.buildings) {
        for (let i = 0; i < count; i++) {
          price += buildingPrice(state, id).toNumber()
          state.buildings[id] += 1
        }
      }
      for (const id of completedMilestones(state.buildings)) {
        if (!ownedBefore.includes(id)) price += milestonePrice(id)
      }
      const added = income() - before
      sets.push({ price, income: added, seconds: price / added })
    }
    return { chain, sets }
  })
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
  marketValue: number
  /**
   * Price per unit (for a flooded market: at a fresh market), as a share of the market value, and
   * for a flooded market the most it pays per second; missing if the buyer does not take it.
   */
  buyers: Partial<Record<BuyerId, { perUnit: number; share: number; capPerSecond?: number }>>
}

/** The table at base product prices: MegaMeat's pegged prices are read with no upgrades owned. */
export function bulkTable(): BulkRow[] {
  const base = { upgrades: [] }
  return RESOURCES.map((resource) => {
    const value = marketValue(resource)
    const buyers: BulkRow['buyers'] = {}
    for (const buyer of BUYERS) {
      const lot = lotFor(base, buyer.id, resource)
      if (lot) {
        const full = buyer.id === 'megaMeat' ? fullPrice(base, resource) : undefined
        const perUnit = full ?? lot.price / lot.units
        // A flooded market pays at most K ÷ τ per second, with τ = H ÷ ln 2 and K in euros.
        const capPerSecond =
          isFlooded(buyer.id, resource) && (buyer.flood!.halfPriceEuros * Math.LN2) / buyer.flood!.halfLifeSeconds
        buyers[buyer.id] = { perUnit, share: perUnit / value, ...(capPerSecond ? { capPerSecond } : {}) }
      }
    }
    return { resource, marketValue: value, buyers }
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
