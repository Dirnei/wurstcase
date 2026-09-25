import { describe, expect, it } from 'vitest'
import { formatDuration } from './duration'

describe('formatDuration', () => {
  it.each([
    [0, '0:00:00'],
    [90, '0:01:30'],
    [3599, '0:59:59'],
    [100 * 3600 + 5 * 60 + 7, '100:05:07'],
    [59.99, '0:00:59'],
  ])('formats %s seconds as %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected)
  })
})
