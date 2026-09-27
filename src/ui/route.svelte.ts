import { routeFromHash, type Route } from '../legal/route'
import { readGame } from './game.svelte'
import { resolveTab, tabFromHash, type TabId } from './tabs'

let route = $state<Route>(routeFromHash(location.hash))
let requestedTab = $state<TabId | null>(tabFromHash(location.hash))
let openedFromGame = false

window.addEventListener('hashchange', (event) => {
  const next = routeFromHash(location.hash)
  openedFromGame = routeFromHash(new URL(event.oldURL).hash) === 'game' && next !== 'game'
  route = next
  requestedTab = tabFromHash(location.hash)
})

export function currentRoute(): Route {
  return route
}

/** Returns to the game: via history when a legal page was opened from it, else by clearing the hash. */
export function backToGame(): void {
  if (openedFromGame) {
    history.back()
    return
  }
  history.pushState(null, '', location.pathname + location.search)
  route = 'game'
}

/** The tab on show: the one in the address, or Produktion when that one is missing or locked. */
export function currentTab(): TabId {
  return readGame((state) => resolveTab(requestedTab, state))
}

/** Puts the tab on show into the address when it differs, so a later unlock never switches tabs by itself. */
export function syncTabAddress(): void {
  const shown = currentTab()
  if (route === 'game' && requestedTab !== shown) {
    history.replaceState(null, '', `#${shown}`)
    requestedTab = shown
  }
}
