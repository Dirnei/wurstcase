import { BUILDINGS, type BuildingId } from '../content/buildings'
import type { ResourceId } from '../content/resources'
import { ORDERS_PER_CUSTOMER } from '../content/town'
import type { UpgradeId } from '../content/upgrades'
import { ordersFactor, productPrice, productsByPrice, rateFactor } from '../systems/upgrades'

/** Products per second the owned buildings turn out at steady state, each stage capped by its input. */
export function steadyOutput(
  buildings: Readonly<Record<BuildingId, number>>,
  upgrades: readonly UpgradeId[] = [],
): Partial<Record<ResourceId, number>> {
  const owned = { upgrades: [...upgrades] }
  const flow: Partial<Record<ResourceId, number>> = {}
  // BUILDINGS lists every building after the one that makes its input.
  for (const building of BUILDINGS) {
    const capacity = buildings[building.id] * building.rate * rateFactor(owned, building.id)
    flow[building.output] = building.input
      ? Math.min(capacity, (flow[building.input.resource] ?? 0) / building.input.ratio)
      : capacity
  }
  return flow
}

/** Income per second at steady state: production, capped by demand, sold most expensive first. */
export function steadyIncome(
  buildings: Readonly<Record<BuildingId, number>>,
  customers: number,
  upgrades: readonly UpgradeId[] = [],
): number {
  const owned = { upgrades: [...upgrades] }
  const flow = steadyOutput(buildings, upgrades)
  let demand = customers * ORDERS_PER_CUSTOMER * ordersFactor(owned)
  let income = 0
  for (const product of productsByPrice(owned)) {
    const sold = Math.min(flow[product] ?? 0, demand)
    demand -= sold
    income += sold * productPrice(owned, product)
  }
  return income
}
