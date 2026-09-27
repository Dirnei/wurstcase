import type { GameState } from './state'
import { convert } from './systems/awareness'
import { produce } from './systems/production'
import { takeOrders } from './systems/sales'
import { recordTrend } from './systems/trend'

/** Advances the game by the given seconds. The single simulation path for live play, offline progress and tests. */
export function tick(state: GameState, seconds: number): void {
  // Only what happens inside tick() counts for the stock trend, never the player's own actions.
  const before = { ...state.stock }
  state.playTime += seconds
  produce(state, seconds)
  convert(state, seconds)
  takeOrders(state, seconds)
  recordTrend(state, before, seconds)
}
