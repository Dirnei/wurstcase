import { describe, expect, it } from 'vitest'
import { encodeSave } from '../game/save'
import { createInitialState } from '../game/state'
import { createSaveSlots, type StorageLike } from './slots'
import { scopedStorage, storagePrefix } from './storage-scope'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  const storage: StorageLike = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  }
  return { storage, data }
}

describe('storagePrefix', () => {
  it.each(['/preview/pr-12/', '/wurstcase/preview/pr-12/', '/preview/pr-12/index.html'])(
    'scopes %s to its pull request',
    (pathname) => {
      expect(storagePrefix(pathname)).toBe('pr-12:')
    },
  )

  it.each(['/', '/wurstcase/', '/preview/', '/preview/foo/'])('keeps the plain keys at %s', (pathname) => {
    expect(storagePrefix(pathname)).toBe('')
  })
})

describe('scopedStorage', () => {
  it('prefixes every key it reads and writes', () => {
    const { storage, data } = memoryStorage({ 'pr-3:vegle.theme': 'dark', 'vegle.theme': 'light' })
    const scoped = scopedStorage(storage, 'pr-3:')
    expect(scoped.getItem('vegle.theme')).toBe('dark')
    scoped.setItem('vegle.language', 'en')
    expect(data.get('pr-3:vegle.language')).toBe('en')
    expect(data.has('vegle.language')).toBe(false)
  })

  it('passes an empty prefix straight through', () => {
    const { storage } = memoryStorage()
    expect(scopedStorage(storage, '')).toBe(storage)
  })

  it('keeps the save slots of a preview away from the live save', () => {
    const live = encodeSave({ ...createInitialState(), playTime: 42 }, 1_790_000_000_000)
    const { storage, data } = memoryStorage({ 'vegle.save.0': live, 'vegle.save.latest': '0' })
    const slots = createSaveSlots(() => scopedStorage(storage, 'pr-12:'))
    expect(slots.load()).toEqual({ status: 'empty' })
    slots.write(encodeSave(createInitialState(), 1_790_000_000_001))
    expect(data.get('vegle.save.0')).toBe(live)
    expect(data.get('vegle.save.latest')).toBe('0')
    expect(data.has('vegle.save.1')).toBe(false)
    expect([...data.keys()].filter((key) => key.startsWith('pr-12:vegle.save.')).length).toBeGreaterThan(0)
  })
})
