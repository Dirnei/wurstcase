export type MegaMeatEventId = 'adCampaign' | 'study' | 'billboards'

/** Multipliers a counter-event applies; 1 means unaffected. */
export interface EventFactors {
  awareness: number
  conversion: number
  aktionCost: number
}

export interface MegaMeatEventDef {
  id: MegaMeatEventId
  /** Seconds of game time the event lasts unless it is fact-checked. */
  duration: number
  factors: Partial<EventFactors>
}

/** MegaMeat's counter-events in the order they start; after the last comes the first again. */
export const MEGAMEAT_EVENTS: readonly MegaMeatEventDef[] = [
  { id: 'adCampaign', duration: 120, factors: { awareness: 0.5 } },
  { id: 'study', duration: 60, factors: { conversion: 0 } },
  { id: 'billboards', duration: 90, factors: { aktionCost: 2 } },
]

export const MEGAMEAT_EVENT_IDS: readonly MegaMeatEventId[] = MEGAMEAT_EVENTS.map((event) => event.id)

/** Seconds from the player's first Aktion to MegaMeat's first counter-event. */
export const FIRST_EVENT_DELAY = 60

/** Seconds from the end of one counter-event to the start of the next. */
export const EVENT_PAUSE = 300

const BY_ID = new Map(MEGAMEAT_EVENTS.map((event) => [event.id, event]))

export function getMegaMeatEvent(id: MegaMeatEventId): MegaMeatEventDef {
  return BY_ID.get(id)!
}

export function isMegaMeatEventId(value: unknown): value is MegaMeatEventId {
  return typeof value === 'string' && BY_ID.has(value as MegaMeatEventId)
}
