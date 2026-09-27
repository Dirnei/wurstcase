import Decimal from 'break_eternity.js'

/** Amounts collected over a short span of game time; missing keys count as 0. */
export interface Bucket<K extends string> {
  seconds: number
  values: Partial<Record<K, Decimal>>
}

/** Time is merged into buckets of about this length, so the history stays small at any tick rate. */
const BUCKET_SECONDS = 1

/** Float steps such as 10 × 0.1 s land just short of a whole second; this much counts as reached. */
const TIME_EPSILON = 1e-9

/**
 * Moves the window on by the given game time: extends the newest bucket while it is under a
 * second, otherwise starts an empty one, then drops buckets that lie completely outside the window.
 */
export function advance<K extends string>(buckets: Bucket<K>[], seconds: number, windowSeconds: number): void {
  const newest = buckets.at(-1)
  if (newest && newest.seconds < BUCKET_SECONDS - TIME_EPSILON) {
    newest.seconds += seconds
  } else {
    buckets.push({ seconds, values: {} })
  }

  let covered = 0
  for (let index = buckets.length - 1; index >= 0; index--) {
    if (covered >= windowSeconds - TIME_EPSILON) {
      buckets.splice(0, index + 1)
      break
    }
    covered += buckets[index].seconds
  }
}

/** Adds an amount to the newest bucket, starting one if the window is empty. */
export function add<K extends string>(buckets: Bucket<K>[], key: K, amount: Decimal | number): void {
  if (buckets.length === 0) {
    buckets.push({ seconds: 0, values: {} })
  }
  const newest = buckets[buckets.length - 1]
  newest.values[key] = (newest.values[key] ?? new Decimal(0)).add(amount)
}

/**
 * Sums a key over the window. A bucket reaching past the window's start counts only with its
 * share inside it, so one long step gives the same result as many short ones.
 */
export function sum<K extends string>(buckets: readonly Bucket<K>[], key: K, windowSeconds: number): number {
  let remaining = windowSeconds
  let total = 0
  for (let index = buckets.length - 1; index >= 0 && remaining > TIME_EPSILON; index--) {
    const bucket = buckets[index]
    const share = bucket.seconds <= remaining ? 1 : remaining / bucket.seconds
    total += (bucket.values[key]?.toNumber() ?? 0) * share
    remaining -= bucket.seconds
  }
  return total
}

/** Game time the buckets hold, at most the window: less than the window right after loading. */
export function covered<K extends string>(buckets: readonly Bucket<K>[], windowSeconds: number): number {
  const seconds = buckets.reduce((total, bucket) => total + bucket.seconds, 0)
  return Math.min(seconds, windowSeconds)
}
