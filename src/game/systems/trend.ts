import type Decimal from 'break_eternity.js'
import { RESOURCES, type ResourceId } from '../content/resources'
import type { GameState } from '../state'

/** Game time over which the stock trend is measured. */
export const TREND_WINDOW_SECONDS = 10

/** Net change over the window that still counts as steady, so single whole-unit steps do not flicker. */
export const TREND_STEADY_UNITS = 1

/** Ticks are merged into buckets of about this length, so the history stays small at any tick rate. */
const BUCKET_SECONDS = 1

export type Trend = 'rising' | 'falling' | 'steady'

/** Records what a tick changed in stock. Called only from tick(), so player actions never count. */
export function recordTrend(state: GameState, before: Readonly<Record<ResourceId, Decimal>>, seconds: number): void {
  const newest = state.trend.at(-1)
  if (newest && newest.seconds < BUCKET_SECONDS) {
    newest.seconds += seconds
    for (const resource of RESOURCES) {
      newest.change[resource] = newest.change[resource].add(state.stock[resource].sub(before[resource]))
    }
  } else {
    state.trend.push({
      seconds,
      change: Object.fromEntries(
        RESOURCES.map((resource) => [resource, state.stock[resource].sub(before[resource])]),
      ) as Record<ResourceId, Decimal>,
    })
  }

  // Drop buckets that lie completely outside the window.
  let covered = 0
  for (let index = state.trend.length - 1; index >= 0; index--) {
    if (covered >= TREND_WINDOW_SECONDS) {
      state.trend.splice(0, index + 1)
      break
    }
    covered += state.trend[index].seconds
  }
}

/** Net stock change from passing time over the window; only the in-window share of the oldest bucket counts. */
export function trendChange(state: Readonly<GameState>, resource: ResourceId): number {
  let remaining = TREND_WINDOW_SECONDS
  let net = 0
  for (let index = state.trend.length - 1; index >= 0 && remaining > 0; index--) {
    const bucket = state.trend[index]
    const share = bucket.seconds <= remaining ? 1 : remaining / bucket.seconds
    net += bucket.change[resource].toNumber() * share
    remaining -= bucket.seconds
  }
  return net
}

export function stockTrend(state: Readonly<GameState>, resource: ResourceId): Trend {
  // A short input hovers near zero while it is used as fast as it arrives.
  if (state.shortage[resource] !== undefined) {
    return 'steady'
  }
  const net = trendChange(state, resource)
  return net > TREND_STEADY_UNITS ? 'rising' : net < -TREND_STEADY_UNITS ? 'falling' : 'steady'
}
