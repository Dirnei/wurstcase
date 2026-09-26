import { describe, expect, it } from 'vitest'
import { encodeSave } from '../game/save'
import { createSaveSlots, type StorageLike } from './slots'

const T = 1_790_000_000_000

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  const storage: StorageLike = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  }
  return { storage, data }
}

const save = (playTime: number, savedAt = T) => encodeSave({ playTime }, savedAt)
const tooNew = JSON.stringify({ format: 99, savedAt: T, state: {} })

describe('createSaveSlots', () => {
  it('reports an empty store on first visit', () => {
    const { storage } = memoryStorage()
    expect(createSaveSlots(() => storage).load()).toEqual({ status: 'empty' })
  })

  it('alternates slots and moves the latest pointer on each write', () => {
    const { storage, data } = memoryStorage()
    const slots = createSaveSlots(() => storage)
    slots.load()
    slots.write(save(1))
    slots.write(save(2))
    slots.write(save(3))
    expect(data.get('vegle.save.0')).toBe(save(3))
    expect(data.get('vegle.save.1')).toBe(save(2))
    expect(data.get('vegle.save.latest')).toBe('0')
  })

  it('loads the slot the pointer names', () => {
    const { storage } = memoryStorage({
      'vegle.save.0': save(10, T + 5),
      'vegle.save.1': save(20, T),
      'vegle.save.latest': '1',
    })
    expect(createSaveSlots(() => storage).load()).toEqual({
      status: 'loaded',
      state: { playTime: 20 },
      savedAt: T,
      restoredFromBackup: false,
    })
  })

  it('falls back to the other slot when the newest is corrupted', () => {
    const { storage } = memoryStorage({
      'vegle.save.0': save(10),
      'vegle.save.1': '{broken',
      'vegle.save.latest': '1',
    })
    expect(createSaveSlots(() => storage).load()).toMatchObject({
      status: 'loaded',
      state: { playTime: 10 },
      restoredFromBackup: true,
    })
  })

  it('never overwrites the only intact backup after restoring from it', () => {
    const { storage, data } = memoryStorage({
      'vegle.save.0': save(10),
      'vegle.save.1': '{broken',
      'vegle.save.latest': '1',
    })
    const slots = createSaveSlots(() => storage)
    slots.load()
    slots.write(save(11))
    expect(data.get('vegle.save.0')).toBe(save(10))
    expect(data.get('vegle.save.1')).toBe(save(11))
    expect(data.get('vegle.save.latest')).toBe('1')
  })

  it('picks the newest valid save when there is no pointer', () => {
    const { storage } = memoryStorage({
      'vegle.save.0': save(10, T + 100),
      'vegle.save.1': save(20, T),
    })
    expect(createSaveSlots(() => storage).load()).toMatchObject({ state: { playTime: 10 } })
  })

  it('keeps a copy of unreadable saves that later writes never overwrite', () => {
    const { storage, data } = memoryStorage({
      'vegle.save.0': '{broken-0',
      'vegle.save.1': '{broken-1',
      'vegle.save.latest': '0',
    })
    const slots = createSaveSlots(() => storage)
    expect(slots.load()).toEqual({ status: 'unreadable' })
    const copy = data.get('vegle.save.unreadable')
    expect(JSON.parse(copy!)).toEqual({ 'vegle.save.0': '{broken-0', 'vegle.save.1': '{broken-1' })

    slots.write(save(1))
    slots.write(save(2))
    expect(data.get('vegle.save.unreadable')).toBe(copy)
  })

  it('keeps the first unreadable copy when saves break again later', () => {
    const { storage, data } = memoryStorage({
      'vegle.save.0': '{a',
      'vegle.save.unreadable': 'first failure',
    })
    createSaveSlots(() => storage).load()
    expect(data.get('vegle.save.unreadable')).toBe('first failure')
  })

  it('refuses to load or overwrite a save from a newer format', () => {
    const { storage, data } = memoryStorage({
      'vegle.save.0': tooNew,
      'vegle.save.1': save(10),
      'vegle.save.latest': '0',
    })
    const slots = createSaveSlots(() => storage)
    expect(slots.load()).toEqual({ status: 'too-new' })
    expect(slots.write(save(99))).toBe(false)
    expect(data.get('vegle.save.0')).toBe(tooNew)
    expect(data.get('vegle.save.1')).toBe(save(10))
  })

  it('survives blocked storage without throwing', () => {
    const slots = createSaveSlots(() => {
      throw new Error('SecurityError')
    })
    expect(slots.load()).toEqual({ status: 'storage-unavailable' })
    expect(slots.write(save(1))).toBe(false)
    expect(slots.storageAvailable).toBe(false)
  })

  it('reports a failed write, e.g. when storage is full', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const slots = createSaveSlots(() => storage)
    slots.load()
    expect(slots.write(save(1))).toBe(false)
    expect(slots.storageAvailable).toBe(false)
  })
})
