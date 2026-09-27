/** The curious neighbours who buy from the player before anyone else does. */
export const STARTING_CUSTOMERS = 10

/** Orders each customer places per second. */
export const ORDERS_PER_CUSTOMER = 0.05

/** Open orders pile up to this many seconds of orders; beyond that, demand is lost. */
export const ORDER_CAP_SECONDS = 30

/** Unsold products beyond this many seconds of orders trigger the overproduction joke. */
export const OVERSTOCK_SECONDS = 120

/** The shop assistant: a one-time purchase that sells open orders automatically. */
export const ASSISTANT = { price: 150, unlockAt: 50 }

/** Act 1's town: customers never exceed it. */
export const POPULATION = 20_000

/** Townspeople converted per second for each awareness per second, before saturation. */
export const CONVERSION_PER_AWARENESS = 0.02
