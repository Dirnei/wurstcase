import type { GameState } from './state'
import { produce } from './systems/production'

/** Advances the game by the given seconds. The single simulation path for live play, offline progress and tests. */
export function tick(state: GameState, seconds: number): void {
  state.playTime += seconds
  produce(state, seconds)
}
