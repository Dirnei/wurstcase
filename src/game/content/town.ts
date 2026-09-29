/** The curious neighbours who buy from the player before anyone else does. */
export const STARTING_CUSTOMERS = 10

/** Orders each customer places per second, up to the demand knee. */
export const ORDERS_PER_CUSTOMER = 0.05

/**
 * Customers up to which each one places ORDERS_PER_CUSTOMER. Beyond it, demand grows more slowly:
 * every doubling of the customer count adds as many orders per second as the knee's customers
 * place (10 at a knee of 200). The balancing knob for how soon production overtakes demand.
 */
export const DEMAND_KNEE = 200

/**
 * Orders per second from this many customers, times a factor (upgrades, MegaMeat's scandal):
 * linear up to the knee, then one knee's worth more per doubling.
 */
export function demandRate(customers: number, factor = 1): number {
  const orders =
    customers <= DEMAND_KNEE
      ? customers * ORDERS_PER_CUSTOMER
      : DEMAND_KNEE * ORDERS_PER_CUSTOMER * (1 + Math.log2(customers / DEMAND_KNEE))
  return orders * factor
}

/** Open orders pile up to this many seconds of orders; beyond that, demand is lost. */
export const ORDER_CAP_SECONDS = 30

/** Unsold products beyond this many seconds of orders trigger the overproduction joke. */
export const OVERSTOCK_SECONDS = 120

/** The shop assistant: a one-time purchase that sells open orders automatically. */
export const ASSISTANT = { price: 150, unlockAt: 50 }

/** Seconds over which the customer income follows customer sales; a single sale fades within minutes. */
export const CUSTOMER_INCOME_SECONDS = 300

/** Act 1's town: customers never exceed it. */
export const POPULATION = 20_000

