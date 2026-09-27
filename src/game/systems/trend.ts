import type Decimal from 'break_eternity.js'
import { RESOURCES, type ResourceId } from '../content/resources'
import type { GameState } from '../state'
import { add, advance, sum } from './rollingWindow'

/** Game time over which the stock trend is measured. */
export const TREND_WINDOW_SECONDS = 10

/** Net change over the window that still counts as steady, so single whole-unit steps do not flicker. */
export const TREND_STEADY_UNITS = 1

export type Trend = 'rising' | 'falling' | 'steady'

/** Records what a tick changed in stock. Called only from tick(), so player actions never count. */
export function recordTrend(state: GameState, before: Readonly<Record<ResourceId, Decimal>>, seconds: number): void {
  advance(state.trend, seconds, TREND_WINDOW_SECONDS)
  for (const resource of RESOURCES) {
    const change = state.stock[resource].sub(before[resource])
    if (!change.eq(0)) {
      add(state.trend, resource, change)
    }
  }
}

/** Net stock change from passing time over the window. */
export function trendChange(state: Readonly<GameState>, resource: ResourceId): number {
  return sum(state.trend, resource, TREND_WINDOW_SECONDS)
}

export function stockTrend(state: Readonly<GameState>, resource: ResourceId): Trend {
  // A short input hovers near zero while it is used as fast as it arrives.
  if (state.shortage[resource] !== undefined) {
    return 'steady'
  }
  const net = trendChange(state, resource)
  return net > TREND_STEADY_UNITS ? 'rising' : net < -TREND_STEADY_UNITS ? 'falling' : 'steady'
}
