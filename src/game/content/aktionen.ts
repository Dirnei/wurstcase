import type { SpeciesId } from './animals'

export type AktionId = 'flyer' | 'openFarmDay' | 'viralReel' | 'factCheck'

export interface AktionDef {
  id: AktionId
  /** Total euros earned in this game from which the Aktion is offered. */
  unlockAt: number
  /** A species that must live in the Lebenshof before the Aktion is offered. */
  requiresSpecies?: SpeciesId
  /** Awareness points taken from the pool, before counter-event factors. */
  cost: number
  /** Townspeople converted at once in an empty town; fewer as the town fills up. */
  customers?: number
  /** Seconds of game time before it can run again. */
  cooldown: number
  /** Ends MegaMeat's active counter-event instead of converting anyone; offered once one has started. */
  endsEvent?: boolean
}

export const AKTIONEN: readonly AktionDef[] = [
  { id: 'flyer', unlockAt: 1_000, cost: 100, customers: 20, cooldown: 30 },
  { id: 'openFarmDay', unlockAt: 5_000, cost: 1_500, customers: 300, cooldown: 120 },
  { id: 'viralReel', unlockAt: 15_000, requiresSpecies: 'pig', cost: 6_000, customers: 1_500, cooldown: 300 },
  { id: 'factCheck', unlockAt: 0, endsEvent: true, cost: 300, cooldown: 60 },
]

export const AKTION_IDS: readonly AktionId[] = AKTIONEN.map((aktion) => aktion.id)

const BY_ID = new Map(AKTIONEN.map((aktion) => [aktion.id, aktion]))

export function getAktion(id: AktionId): AktionDef {
  return BY_ID.get(id)!
}
