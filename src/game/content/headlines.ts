import type { AktionId } from './aktionen'
import type { BuildingId } from './buildings'

/** Real seconds each ticker headline stays before the next one. */
export const HEADLINE_SECONDS = 15

/** A satirical headline (text key headline.satire.<id>), shown from a total-earnings threshold. */
export interface SatireDef {
  id: string
  unlockAt: number
}

export const SATIRE: readonly SatireDef[] = [
  { id: 'chickensSpace', unlockAt: 0 },
  { id: 'wurstProtection', unlockAt: 0 },
  { id: 'grandmaTofu', unlockAt: 0 },
  { id: 'soyFieldCows', unlockAt: 0 },
  { id: 'megaMeatQuarter', unlockAt: 200 },
  { id: 'seitanMartialArt', unlockAt: 500 },
  { id: 'bbqClub', unlockAt: 1_000 },
  { id: 'pensionerLeverkas', unlockAt: 1_500 },
  { id: 'tractorQueue', unlockAt: 3_000 },
  { id: 'baristaChampionship', unlockAt: 5_000 },
  { id: 'lobbyistCorridors', unlockAt: 8_000 },
  { id: 'butcherRolls', unlockAt: 12_000 },
  { id: 'cowFollowers', unlockAt: 20_000 },
]

/** One condition of a tutorial hint; all clauses of a hint must hold. */
export type HintClause =
  | { owned: BuildingId; is: 'none' | 'some' }
  | { unlocked: BuildingId }
  | { assistantOffered: true }
  /** The Lebenshof is unlocked and nobody lives there yet. */
  | { lebenshofEmpty: true }
  /** The Aktion is offered and has never been run. */
  | { aktionNeverRun: AktionId }
  | { canFactCheck: true }

/** A tutorial hint (text key headline.hint.<id>); earlier hints win when several apply. */
export interface HintDef {
  id: string
  when: readonly HintClause[]
}

export const HINTS: readonly HintDef[] = [
  { id: 'soybeanField', when: [{ owned: 'soybeanField', is: 'none' }] },
  { id: 'tofuPress', when: [{ owned: 'soybeanField', is: 'some' }, { owned: 'tofuPress', is: 'none' }] },
  { id: 'assistant', when: [{ assistantOffered: true }] },
  { id: 'lebenshof', when: [{ lebenshofEmpty: true }] },
  { id: 'wheat', when: [{ unlocked: 'wheatField' }, { owned: 'wheatField', is: 'none' }] },
  { id: 'flyer', when: [{ aktionNeverRun: 'flyer' }] },
  { id: 'factCheck', when: [{ canFactCheck: true }] },
]
