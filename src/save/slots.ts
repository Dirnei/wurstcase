import { decodeSave, type DecodeResult } from '../game/save'
import type { GameState } from '../game/state'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type LoadResult =
  | { status: 'loaded'; state: GameState; savedAt: number; restoredFromBackup: boolean }
  | { status: 'empty' }
  | { status: 'unreadable' }
  | { status: 'too-new' }
  | { status: 'storage-unavailable' }

export interface SaveSlots {
  load(): LoadResult
  /** Returns false if nothing was written (storage failure, or a newer-format save must be kept). */
  write(json: string): boolean
  readonly storageAvailable: boolean
}

type Slot = 0 | 1

const SLOT_KEYS = ['vegle.save.0', 'vegle.save.1'] as const
const LATEST_KEY = 'vegle.save.latest'
const UNREADABLE_KEY = 'vegle.save.unreadable'

/**
 * Two alternating save slots plus a pointer to the one written last, so a damaged newest save
 * falls back to the previous one. `getStorage` is a function because merely accessing
 * `localStorage` can throw when the browser blocks storage.
 */
export function createSaveSlots(getStorage: () => StorageLike): SaveSlots {
  let storage: StorageLike | undefined
  let available = true
  let writable = true
  // The slot holding the save this session continues from; the next write goes to the other one.
  let current: Slot | null = null

  function access<T>(use: (storage: StorageLike) => T): T | undefined {
    try {
      storage ??= getStorage()
      return use(storage)
    } catch {
      available = false
      return undefined
    }
  }

  return {
    get storageAvailable() {
      return available
    },

    load() {
      const raw = access((s) => [s.getItem(SLOT_KEYS[0]), s.getItem(SLOT_KEYS[1]), s.getItem(LATEST_KEY)])
      if (!raw) {
        return { status: 'storage-unavailable' }
      }
      const [raw0, raw1, pointerText] = raw
      const results = [raw0, raw1].map((text) => (text === null ? null : decodeSave(text)))

      if (results.some((result) => result?.ok === false && result.reason === 'too-new')) {
        writable = false
        return { status: 'too-new' }
      }

      const valid = (slot: Slot) => (results[slot]?.ok ? (results[slot] as Loaded) : null)
      const pointer: Slot | null = pointerText === '0' ? 0 : pointerText === '1' ? 1 : null
      let chosen: Slot | null = null
      if (pointer !== null) {
        chosen = valid(pointer) ? pointer : valid(other(pointer)) ? other(pointer) : null
      } else {
        const candidates = ([0, 1] as const).filter((slot) => valid(slot))
        chosen = candidates.sort((a, b) => valid(b)!.savedAt - valid(a)!.savedAt)[0] ?? null
      }

      if (chosen !== null) {
        current = chosen
        const { state, savedAt } = valid(chosen)!
        // The other slot held data that could not be read: the player continues from a backup.
        const otherBroken = results[other(chosen)] !== null && !valid(other(chosen))
        const pointerMissed = pointer !== null && pointer !== chosen
        return { status: 'loaded', state, savedAt, restoredFromBackup: pointerMissed || (pointer === null && otherBroken) }
      }

      if (raw0 === null && raw1 === null) {
        return { status: 'empty' }
      }
      // Keep the first unreadable data around so a new game can never destroy it.
      access((s) => {
        if (s.getItem(UNREADABLE_KEY) === null) {
          s.setItem(UNREADABLE_KEY, JSON.stringify({ [SLOT_KEYS[0]]: raw0, [SLOT_KEYS[1]]: raw1 }))
        }
      })
      return { status: 'unreadable' }
    },

    write(json) {
      if (!writable) {
        return false
      }
      const target: Slot = current === null ? 0 : other(current)
      const written = access((s) => {
        s.setItem(SLOT_KEYS[target], json)
        s.setItem(LATEST_KEY, String(target))
        return true
      })
      if (!written) {
        return false
      }
      available = true
      current = target
      return true
    },
  }
}

type Loaded = Extract<DecodeResult, { ok: true }>

function other(slot: Slot): Slot {
  return slot === 0 ? 1 : 0
}
