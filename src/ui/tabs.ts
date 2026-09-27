import type { GameState } from '../game/state'
import { firstAktionAt, isAktionenUnlocked } from '../game/systems/aktionen'
import { LEBENSHOF_UNLOCK_AT } from '../game/content/shelters'
import { isLebenshofUnlocked } from '../game/systems/rescue'
import { firstUpgradeAt, isUpgradesUnlocked } from '../game/systems/upgrades'

export const TABS = ['produktion', 'verkauf', 'upgrades', 'lebenshof', 'aktionen', 'einstellungen'] as const

export type TabId = (typeof TABS)[number]

/** Maps a location hash such as '#verkauf' to its tab; anything else is no tab. */
export function tabFromHash(hash: string): TabId | null {
  const name = hash.replace(/^#/, '').toLowerCase()
  return (TABS as readonly string[]).includes(name) ? (name as TabId) : null
}

export function isTabUnlocked(state: Readonly<GameState>, tab: TabId): boolean {
  switch (tab) {
    case 'upgrades':
      return isUpgradesUnlocked(state)
    case 'lebenshof':
      return isLebenshofUnlocked(state)
    case 'aktionen':
      return isAktionenUnlocked(state)
    default:
      return true
  }
}

/** Total earnings named in a locked tab's hint; null for tabs that are never locked. */
export function tabUnlockAt(tab: TabId): number | null {
  switch (tab) {
    case 'upgrades':
      return firstUpgradeAt()
    case 'lebenshof':
      return LEBENSHOF_UNLOCK_AT
    case 'aktionen':
      return firstAktionAt()
    default:
      return null
  }
}

/** The tab to show for a requested one: locked or missing tabs show Produktion. */
export function resolveTab(requested: TabId | null, state: Readonly<GameState>): TabId {
  return requested !== null && isTabUnlocked(state, requested) ? requested : 'produktion'
}
