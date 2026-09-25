/** The whole game in one plain, serializable object. Game systems mutate it through tick(). */
export interface GameState {
  /** Seconds of game time advanced since the page loaded. */
  playTime: number
}

export function createInitialState(): GameState {
  return { playTime: 0 }
}
