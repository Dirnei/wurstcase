import { STEP_MARKUP } from '../content/buyers'
import { BUILDINGS, getBuilding, type BuildingDef, type BuildingId, type ChainId } from '../content/buildings'
import { PRODUCT_PRICES } from '../content/products'
import { PRODUCTS, type ProductId, type ResourceId } from '../content/resources'

const isProduct = (resource: ResourceId): resource is ProductId =>
  (PRODUCTS as readonly string[]).includes(resource)

/** The building that uses a resource as its input. */
function consumerOf(resource: ResourceId): BuildingDef {
  return BUILDINGS.find((building) => building.input?.resource === resource)!
}

/** What one unit earns once turned into its chain's product and sold to a customer. */
export function veganValue(resource: ResourceId): number {
  if (isProduct(resource)) {
    return PRODUCT_PRICES[resource]
  }
  const consumer = consumerOf(resource)
  return veganValue(consumer.output) / consumer.input!.ratio
}

/** What one unit is worth on the market: its product's price, less the markup of each step still to come. */
export function marketValue(resource: ResourceId): number {
  if (isProduct(resource)) {
    return PRODUCT_PRICES[resource]
  }
  const consumer = consumerOf(resource)
  return marketValue(consumer.output) / consumer.input!.ratio / (1 + STEP_MARKUP)
}

/** Income per second of one building, assuming the rest of its chain and the demand keep up. */
export function buildingIncome(id: BuildingId): number {
  const building = getBuilding(id)
  return building.rate * veganValue(building.output)
}

/** A chain's buildings in production order: field, processing, kitchen. */
export function chainBuildings(chain: ChainId): BuildingDef[] {
  return BUILDINGS.filter((building) => building.chain === chain)
}

export interface ChainBalance {
  chain: ChainId
  buildings: { id: BuildingId; count: number }[]
  product: ProductId
  /** Products per second of the balanced set. */
  output: number
  income: number
}

const MAX_MULTIPLIER = 1000
const EPSILON = 1e-9

/** The smallest whole set of a chain's buildings that runs without stalls or surplus. */
export function chainBalance(chain: ChainId): ChainBalance {
  const buildings = chainBuildings(chain)
  // Start from one kitchen and work back up the chain in fractional counts.
  const fractional = new Map<BuildingId, number>()
  let need = 0
  for (const building of [...buildings].reverse()) {
    const count = fractional.size === 0 ? 1 : need / building.rate
    fractional.set(building.id, count)
    need = building.input ? count * building.rate * building.input.ratio : 0
  }
  const counts = [...fractional.values()]
  let multiplier = 1
  while (
    multiplier < MAX_MULTIPLIER &&
    counts.some((count) => Math.abs(count * multiplier - Math.round(count * multiplier)) > EPSILON)
  ) {
    multiplier += 1
  }
  const kitchen = buildings[buildings.length - 1]
  const product = kitchen.output as ProductId
  const output = Math.round(fractional.get(kitchen.id)! * multiplier) * kitchen.rate
  return {
    chain,
    buildings: buildings.map((building) => ({
      id: building.id,
      count: Math.round(fractional.get(building.id)! * multiplier),
    })),
    product,
    output,
    income: output * PRODUCT_PRICES[product],
  }
}

/** The clicks to make one of a chain's products by hand, and what it sells for. */
export function manualPass(chain: ChainId): { clicks: number; euros: number } {
  const kitchen = chainBuildings(chain).at(-1)!
  const clicksFor = (building: BuildingDef): number => {
    if (!building.input) {
      return 1
    }
    const supplier = BUILDINGS.find((other) => other.output === building.input!.resource)!
    return 1 + building.input.ratio * clicksFor(supplier)
  }
  return { clicks: clicksFor(kitchen), euros: PRODUCT_PRICES[kitchen.output as ProductId] }
}
