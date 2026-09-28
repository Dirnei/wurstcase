/** The storeroom: the same room for every good, growing with each level the player buys. */
export const STOREROOM = {
  /** Units of each good the storeroom holds at level 1. */
  baseRoom: 500,
  /** Each level multiplies the room by this. */
  roomGrowth: 2,
  /** Price in euros of the first expansion (level 1 → 2). */
  basePrice: 100,
  /** Each expansion costs this much more than the one before. */
  priceGrowth: 3,
} as const
