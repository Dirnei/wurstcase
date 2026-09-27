import { BUILDINGS, type BuildingId } from '../content/buildings'
import { PRODUCT_PRICES, PRODUCTS_BY_PRICE } from '../content/products'
import type { ResourceId } from '../content/resources'
import { ORDERS_PER_CUSTOMER } from '../content/town'

/** Products per second the owned buildings turn out at steady state, each stage capped by its input. */
export function steadyOutput(buildings: Readonly<Record<BuildingId, number>>): Partial<Record<ResourceId, number>> {
  const flow: Partial<Record<ResourceId, number>> = {}
  // BUILDINGS lists every building after the one that makes its input.
  for (const building of BUILDINGS) {
    const capacity = buildings[building.id] * building.rate
    flow[building.output] = building.input
      ? Math.min(capacity, (flow[building.input.resource] ?? 0) / building.input.ratio)
      : capacity
  }
  return flow
}

/** Income per second at steady state: production, capped by demand, sold most expensive first. */
export function steadyIncome(buildings: Readonly<Record<BuildingId, number>>, customers: number): number {
  const flow = steadyOutput(buildings)
  let demand = customers * ORDERS_PER_CUSTOMER
  let income = 0
  for (const product of PRODUCTS_BY_PRICE) {
    const sold = Math.min(flow[product] ?? 0, demand)
    demand -= sold
    income += sold * PRODUCT_PRICES[product]
  }
  return income
}
