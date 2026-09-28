import { BUILDINGS, type BuildingId } from '../content/buildings'
import { BUYERS, getBuyer, type BuyerId } from '../content/buyers'
import { RESOURCES, type ResourceId } from '../content/resources'
import { ORDERS_PER_CUSTOMER } from '../content/town'
import type { UpgradeId } from '../content/upgrades'
import { bestBuyer, hasLot, isFlooded, unitPrice } from '../systems/bulkSales'
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
 * What a steady surplus of this many units per second earns: at the given buyer where it takes the
 * resource, otherwise at the best-paying buyer without a feed cost. A flooded market (MegaMeat's,
 * the biogas plant's products) settles at a flood of rate × full × τ euros, with τ = H ÷ ln 2,
 * where it pays full × K ÷ (K + flood) per unit, so its income approaches K ÷ τ however much is sold.
 */
function surplusIncome(owned: { upgrades: UpgradeId[] }, buyer: BuyerId, resource: ResourceId, rate: number): number {
  const target = hasLot(buyer, resource) ? buyer : bestBuyer(owned, resource, { withoutFeedCost: true })?.buyer
  // Without floods passed in, unitPrice is the fresh market's price.
  const full = target ? (unitPrice(owned, target, resource) ?? 0) : 0
  const flood = target && isFlooded(target, resource) ? getBuyer(target).flood! : undefined
  if (!flood) {
    return rate * full
  }
  const settled = rate * full * (flood.halfLifeSeconds / Math.LN2)
  return rate * full * (flood.halfPriceEuros / (flood.halfPriceEuros + settled))
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
  /** Multiplies the orders, e.g. the MegaMeat scandal factor. */
  demandFactor = 1,
): number {
  const owned = { upgrades: [...upgrades] }
  const flow = steadyOutput(buildings, upgrades)
  const taken = usedOutput(flow, upgrades)
  let demand = customers * ORDERS_PER_CUSTOMER * ordersFactor(owned) * demandFactor
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
      income += surplusIncome(owned, surplusBuyer, resource, surplus)
    }
  }
  return income
}
