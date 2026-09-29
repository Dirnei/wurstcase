import type { SpeciesId } from './animals'

export type AktionId = 'flyer' | 'openFarmDay' | 'viralReel' | 'factCheck'

export interface AktionDef {
  id: AktionId
  /** Total euros earned in this game from which the Aktion is offered, once the Aktionen tab is unlocked. */
  unlockAt: number
  /** A species that must live in the Lebenshof before the Aktion is offered. */
  requiresSpecies?: SpeciesId
  /** Awareness points taken from the pool, before counter-event factors. */
  cost: number
  /** Townspeople converted at once in an empty town; fewer as the town fills up. */
  customers?: number
  /** Seconds of game time before it can run again. */
  cooldown: number
  /**
   * Campaigns only: the cost is multiplied by this for every run so far. It outgrows the reach, so
   * each campaign wins fewer customers per point run by run and the bigger ones take over.
   */
  costGrowth?: number
  /** Campaigns only: the customers won are multiplied by this for every run so far. */
  reachGrowth?: number
  /** Ends MegaMeat's active counter-event instead of converting anyone; offered once one has started. */
  endsEvent?: boolean
}

/** Awareness the pool must hold once before the Aktionen tab, and with it the flyers, unlocks. */
export const AKTIONEN_UNLOCK_AWARENESS = 50

export const AKTIONEN: readonly AktionDef[] = [
  // The flyers come with the Aktionen tab, which the first 50 awareness unlocks.
  { id: 'flyer', unlockAt: 0, cost: 100, customers: 20, cooldown: 30, costGrowth: 1.25, reachGrowth: 1.1 },
  { id: 'openFarmDay', unlockAt: 5_000, cost: 1_500, customers: 150, cooldown: 120, costGrowth: 1.25, reachGrowth: 1.1 },
  { id: 'viralReel', unlockAt: 15_000, requiresSpecies: 'pig', cost: 6_000, customers: 750, cooldown: 300, costGrowth: 1.25, reachGrowth: 1.1 },
  { id: 'factCheck', unlockAt: 0, endsEvent: true, cost: 300, cooldown: 60 },
]

export const AKTION_IDS: readonly AktionId[] = AKTIONEN.map((aktion) => aktion.id)

const BY_ID = new Map(AKTIONEN.map((aktion) => [aktion.id, aktion]))

export function getAktion(id: AktionId): AktionDef {
  return BY_ID.get(id)!
}
