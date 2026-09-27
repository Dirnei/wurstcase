import {
  EVENT_PAUSE,
  FIRST_EVENT_DELAY,
  getMegaMeatEvent,
  MEGAMEAT_EVENTS,
  type EventFactors,
} from '../content/megaMeatEvents'
import type { GameState } from '../state'

const NEUTRAL: EventFactors = { awareness: 1, conversion: 1, aktionCost: 1 }

/** Timers count down in float steps; this much left counts as run out, so 600 × 0.1 s is 60 s. */
const TIME_EPSILON = 1e-9

/** The multipliers of MegaMeat's active counter-event, all 1 when none is active. */
export function activeFactors(state: Readonly<GameState>): EventFactors {
  const active = state.megaMeat.active
  return active ? { ...NEUTRAL, ...getMegaMeatEvent(active.event).factors } : NEUTRAL
}

/** Runs MegaMeat's timers: ends the active event when its time is up, or starts the next one. */
export function advanceVillain(state: GameState, seconds: number): void {
  const villain = state.megaMeat
  if (villain.active) {
    villain.active.remaining -= seconds
    if (villain.active.remaining <= TIME_EPSILON) {
      endEvent(state)
    }
    return
  }
  if (villain.nextIn !== null) {
    villain.nextIn -= seconds
    if (villain.nextIn <= TIME_EPSILON) {
      const event = MEGAMEAT_EVENTS[villain.nextIndex]
      villain.active = { event: event.id, remaining: event.duration }
      villain.nextIndex = (villain.nextIndex + 1) % MEGAMEAT_EVENTS.length
      villain.started += 1
      villain.nextIn = null
    }
  }
}

/** MegaMeat notices the player's first campaign and answers a minute later. Later calls change nothing. */
export function onFirstAktion(state: GameState): void {
  const villain = state.megaMeat
  if (villain.started === 0 && villain.active === null && villain.nextIn === null) {
    villain.nextIn = FIRST_EVENT_DELAY
  }
}

/** Ends the active event, by running out or by a fact check, and schedules the next one. */
export function endEvent(state: GameState): void {
  if (state.megaMeat.active) {
    state.megaMeat.active = null
    state.megaMeat.nextIn = EVENT_PAUSE
  }
}
