import type { GameState } from './state'

/** Advances the game by the given seconds. The single simulation path for live play, offline progress and tests. */
export function tick(state: GameState, seconds: number): void {
  state.playTime += seconds
}
