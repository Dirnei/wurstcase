import { availability, BADGE_TABS, hasNew, type Availability, type BadgeTab } from './badges'
import { onReplace, readGame } from './game.svelte'
import type { TabId } from './tabs'

// Plain object on purpose: it is only written by markSeen, and badges re-read it on every tick anyway.
// Seeded with what is available at start-up, so a reload shows no badges.
const seen: Availability = readGame(availability)

function isBadgeTab(tab: TabId): tab is BadgeTab {
  return (BADGE_TABS as readonly TabId[]).includes(tab)
}

/** Takes what the current game offers as seen, as at start-up; runs whenever the game is replaced. */
export function resetSeen(): void {
  Object.assign(seen, readGame(availability))
}

onReplace(resetSeen)

/** Records what the open tab offers right now; call it whenever the open tab or the game changes. */
export function markSeen(tab: TabId): void {
  if (isBadgeTab(tab)) {
    seen[tab] = readGame(availability)[tab]
  }
}

/** Whether a tab other than the open one has something new since the player last had it open. */
export function hasBadge(tab: TabId, open: TabId): boolean {
  return isBadgeTab(tab) && tab !== open && hasNew(seen[tab], readGame(availability)[tab])
}
