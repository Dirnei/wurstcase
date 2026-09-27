/**
 * Whether the developer page may be shown: always under the development server, otherwise only
 * when the server's dev.json says so. Anything missing or unreadable counts as off.
 */
export async function devToolsEnabled(isDevServer: boolean = import.meta.env.DEV): Promise<boolean> {
  if (isDevServer) {
    return true
  }
  try {
    const response = await fetch('./dev.json', { cache: 'no-cache' })
    if (!response.ok) {
      return false
    }
    const config: unknown = await response.json()
    return typeof config === 'object' && config !== null && (config as { enabled?: unknown }).enabled === true
  } catch {
    return false
  }
}
