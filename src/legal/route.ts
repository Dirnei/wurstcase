export type Route = 'game' | 'impressum' | 'datenschutz'

/** Maps a location hash such as '#impressum' to a view; anything unknown shows the game. */
export function routeFromHash(hash: string): Route {
  const name = hash.replace(/^#/, '').toLowerCase()
  return name === 'impressum' || name === 'datenschutz' ? name : 'game'
}
