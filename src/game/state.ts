/** The whole game in one plain, serializable object. Game systems mutate it through tick(). */
export interface GameState {
  /** Total seconds of game time played in this game, restored from the save across reloads. */
  playTime: number
}

export function createInitialState(): GameState {
  return { playTime: 0 }
}
