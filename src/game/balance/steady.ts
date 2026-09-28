import { BUILDINGS, type BuildingId } from '../content/buildings'
import { BUYERS, type BuyerId } from '../content/buyers'
import { RESOURCES, type ResourceId } from '../content/resources'
import { ORDERS_PER_CUSTOMER } from '../content/town'
import type { UpgradeId } from '../content/upgrades'
import { bestBuyer } from '../systems/bulkSales'
import { ordersFactor, productPrice, productsByPrice, rateFactor, yieldPerRun } from '../systems/upgrades'

/** Products per second the owned buildings turn out at steady state, each stage capped by its input. */
export function steadyOutput(
  buildings: Readonly<Record<BuildingId, number>>,
  upgrades: readonly UpgradeId[] = [],
): Partial<Record<ResourceId, number>> {
  const owned = { upgrades: [...upgrades] }
  const flow: Partial<Record<ResourceId, number>> = {}
  // BUILDINGS lists every building after the one that makes its input.
  for (const building of BUILDINGS) {
    const count = buildings[building.id]
    const capacity = count * building.rate * rateFactor(owned, building.id)
    const runs = building.input
      ? Math.min(capacity, (flow[building.input.resource] ?? 0) / building.input.ratio)
      : capacity
    flow[building.output] = runs * yieldPerRun(owned, building.id)
  }
  return flow
}

/**
 * What surplus earns per unit when it goes to the given buyer: its own lot where it takes the
 * resource, otherwise the best-paying buyer without a feed cost. Content, so computed once.
 */
const SURPLUS_PRICE = {} as Record<BuyerId, ReadonlyMap<ResourceId, number>>
for (const buyer of BUYERS) {
  SURPLUS_PRICE[buyer.id] = new Map(
    RESOURCES.map((resource) => {
      const lot = buyer.lots[resource]
      return [resource, lot ? lot.price / lot.units : (bestBuyer(resource, { withoutFeedCost: true })?.perUnit ?? 0)]
    }),
  )
}

/** Units per second of each resource that the next stage of its chain takes, at steady state. */
export function usedOutput(
  flow: Partial<Record<ResourceId, number>>,
  upgrades: readonly UpgradeId[] = [],
): Partial<Record<ResourceId, number>> {
  const owned = { upgrades: [...upgrades] }
  const used: Partial<Record<ResourceId, number>> = {}
  for (const building of BUILDINGS) {
    if (building.input) {
      const { resource, ratio } = building.input
      const runs = (flow[building.output] ?? 0) / yieldPerRun(owned, building.id)
      used[resource] = (used[resource] ?? 0) + runs * ratio
    }
  }
  return used
}

/**
 * Income per second at steady state: production, capped by demand, sold most expensive first;
 * whatever neither the next stage nor the customers take goes to the best-paying bulk buyer
 * whose sales cost no customers.
 */
export function steadyIncome(
  buildings: Readonly<Record<BuildingId, number>>,
  customers: number,
  upgrades: readonly UpgradeId[] = [],
  surplusBuyer: BuyerId = 'biogas',
): number {
  const owned = { upgrades: [...upgrades] }
  const flow = steadyOutput(buildings, upgrades)
  const taken = usedOutput(flow, upgrades)
  let demand = customers * ORDERS_PER_CUSTOMER * ordersFactor(owned)
  let income = 0
  for (const product of productsByPrice(owned)) {
    const sold = Math.min(flow[product] ?? 0, demand)
    demand -= sold
    taken[product] = sold
    income += sold * productPrice(owned, product)
  }
  for (const resource of RESOURCES) {
    const surplus = (flow[resource] ?? 0) - (taken[resource] ?? 0)
    if (surplus > 0) {
      income += surplus * SURPLUS_PRICE[surplusBuyer].get(resource)!
    }
  }
  return income
}
