import { routeFromHash, type Route } from '../legal/route'

let route = $state<Route>(routeFromHash(location.hash))
let openedFromGame = false

window.addEventListener('hashchange', (event) => {
  const next = routeFromHash(location.hash)
  openedFromGame = routeFromHash(new URL(event.oldURL).hash) === 'game' && next !== 'game'
  route = next
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
