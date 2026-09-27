export type Route = 'game' | 'impressum' | 'datenschutz' | 'dev'

const ROUTES: readonly Route[] = ['impressum', 'datenschutz', 'dev']

/** Maps a location hash such as '#impressum' to a view; anything unknown shows the game. */
export function routeFromHash(hash: string): Route {
  const name = hash.replace(/^#/, '').toLowerCase()
  return (ROUTES as readonly string[]).includes(name) ? (name as Route) : 'game'
}
