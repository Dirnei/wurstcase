import { AKTIONEN } from '../game/content/aktionen'
import { SPECIES } from '../game/content/animals'
import { BUILDINGS } from '../game/content/buildings'
import { SHELTERS } from '../game/content/shelters'
import type { GameState } from '../game/state'
import { isAktionOffered } from '../game/systems/aktionen'
import { isUnlocked } from '../game/systems/buildings'
import { isShelterUnlocked, isSpeciesOffered } from '../game/systems/rescue'
import { offeredUpgrades } from '../game/systems/upgrades'
import type { TabId } from './tabs'

export type BadgeTab = Extract<TabId, 'produktion' | 'upgrades' | 'lebenshof' | 'aktionen'>

export const BADGE_TABS: readonly BadgeTab[] = ['produktion', 'upgrades', 'lebenshof', 'aktionen']

export type Availability = Record<BadgeTab, ReadonlySet<string>>

/** What each tab has to offer right now, as keys that are compared between visits. */
export function availability(state: Readonly<GameState>): Availability {
  const event = state.megaMeat.active
  return {
    produktion: new Set(BUILDINGS.filter((b) => isUnlocked(state, b.id)).map((b) => b.id)),
    upgrades: new Set(offeredUpgrades(state).map((u) => u.id)),
    lebenshof: new Set([
      ...SPECIES.filter((s) => isSpeciesOffered(state, s.id)).map((s) => `species:${s.id}`),
      ...SHELTERS.filter((s) => isShelterUnlocked(state, s.id)).map((s) => `shelter:${s.id}`),
    ]),
    aktionen: new Set([
      ...AKTIONEN.filter((a) => isAktionOffered(state, a.id)).map((a) => a.id),
      // The start count keeps a repeat of the same event from looking already seen.
      ...(event ? [`event:${state.megaMeat.started}`] : []),
    ]),
  }
}

/** True when `now` holds something that was not there when the tab was last open. */
export function hasNew(seen: ReadonlySet<string>, now: ReadonlySet<string>): boolean {
  for (const key of now) {
    if (!seen.has(key)) {
      return true
    }
  }
  return false
}
