import type { StorageLike } from './slots'

// The boot script in index.html repeats this pattern, so a preview's first frame reads its own
// theme. Keep the two in step.
const PREVIEW_PATH = /\/preview\/pr-(\d+)\//

/**
 * The key prefix for a page served from this path: a pull request preview (`/preview/pr-<N>/`)
 * keeps its storage apart from the live game and from other previews; every other path keeps
 * the plain keys, so existing saves stay where they are.
 */
export function storagePrefix(pathname: string): string {
  const match = PREVIEW_PATH.exec(pathname)
  return match ? `pr-${match[1]}:` : ''
}

/** The storage with every key prefixed; an empty prefix returns it unchanged. */
export function scopedStorage(storage: StorageLike, prefix: string): StorageLike {
  if (prefix === '') {
    return storage
  }
  return {
    getItem: (key) => storage.getItem(prefix + key),
    setItem: (key, value) => storage.setItem(prefix + key, value),
  }
}

/** The prefix of the page currently loaded. */
export const STORAGE_PREFIX = typeof location === 'undefined' ? '' : storagePrefix(location.pathname)
