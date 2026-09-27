/** Most sale amounts floating at once; a newer one replaces the oldest. */
export const MAX_FLOATS = 5

/** How long an amount floats before it is gone. */
export const FLOAT_MS = 900

export interface Float {
  id: number
  text: string
  startedAt: number
}

let nextId = 0

export function push(list: readonly Float[], text: string, now: number): Float[] {
  return [...list, { id: nextId++, text, startedAt: now }].slice(-MAX_FLOATS)
}

export function expire(list: readonly Float[], now: number): Float[] {
  return list.filter((float) => now - float.startedAt <= FLOAT_MS)
}
