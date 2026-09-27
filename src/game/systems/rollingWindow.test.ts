import { describe, expect, it } from 'vitest'
import { add, advance, sum, type Bucket } from './rollingWindow'

type Key = 'a' | 'b'
const WINDOW = 60

describe('rollingWindow', () => {
  it('sums to 0 when empty', () => {
    expect(sum<Key>([], 'a', WINDOW)).toBe(0)
  })

  it('creates a bucket when adding to an empty window', () => {
    const buckets: Bucket<Key>[] = []
    add(buckets, 'a', 3)
    expect(buckets).toHaveLength(1)
    expect(sum(buckets, 'a', WINDOW)).toBe(3)
    expect(sum(buckets, 'b', WINDOW)).toBe(0)
  })

  it('sums everything inside the window', () => {
    const buckets: Bucket<Key>[] = []
    for (let second = 0; second < 60; second++) {
      advance(buckets, 1, WINDOW)
      add(buckets, 'a', 1)
    }
    expect(sum(buckets, 'a', WINDOW)).toBe(60)
  })

  it('drops values older than the window', () => {
    const buckets: Bucket<Key>[] = []
    add(buckets, 'a', 5)
    advance(buckets, 1, WINDOW)
    for (let second = 0; second < 60; second++) {
      advance(buckets, 1, WINDOW)
    }
    expect(sum(buckets, 'a', WINDOW)).toBe(0)
  })

  it('counts only the share of a long bucket inside the window', () => {
    const buckets: Bucket<Key>[] = []
    advance(buckets, 120, WINDOW)
    add(buckets, 'a', 120)
    expect(sum(buckets, 'a', WINDOW)).toBe(60)
  })

  it('gives the same result for many small steps and one long one', () => {
    const small: Bucket<Key>[] = []
    for (let i = 0; i < 600; i++) {
      advance(small, 0.1, WINDOW)
      add(small, 'a', 0.1)
    }
    const long: Bucket<Key>[] = []
    advance(long, 60, WINDOW)
    add(long, 'a', 60)
    expect(sum(small, 'a', WINDOW)).toBeCloseTo(sum(long, 'a', WINDOW), 6)
  })

  it('keeps at most window + 1 buckets', () => {
    const buckets: Bucket<Key>[] = []
    for (let i = 0; i < 10_000; i++) {
      advance(buckets, 0.1, WINDOW)
      add(buckets, 'b', 1)
    }
    expect(buckets.length).toBeLessThanOrEqual(WINDOW + 1)
  })
})
