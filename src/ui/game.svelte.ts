import { createInitialState, type GameState } from '../game/state'
import { tick } from '../game/tick'

// The state stays a plain object outside Svelte's reactivity; this counter tells the UI it changed.
const state: GameState = createInitialState()
let version = $state(0)

export function advance(seconds: number): void {
  tick(state, seconds)
  version++
}

/** Reads a game value reactively: components using it re-render after every tick. */
export function readGame<T>(select: (state: Readonly<GameState>) => T): T {
  void version
  return select(state)
}
