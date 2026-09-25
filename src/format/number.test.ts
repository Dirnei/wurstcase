import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { formatNumber } from './number'

describe('formatNumber', () => {
  describe('small numbers', () => {
    it.each([
      [0, '0'],
      [12, '12'],
      [12.59, '12.5'],
      [2.3, '2.3'],
      [0.05, '0'],
      [999, '999'],
      [999.99, '999.9'],
    ])('formats %s in English as %s', (value, expected) => {
      expect(formatNumber(value, 'en')).toBe(expected)
    })

    it('uses a comma as decimal separator in German', () => {
      expect(formatNumber(12.5, 'de')).toBe('12,5')
    })
  })

  describe('suffix notation', () => {
    it.each([
      [1000, '1K'],
      [1234, '1.23K'],
      [12_345, '12.3K'],
      [999_999, '999K'],
      [2_000_000_000, '2B'],
      [1e15 - 1, '999T'],
    ])('formats %s in English as %s', (value, expected) => {
      expect(formatNumber(value, 'en')).toBe(expected)
    })

    it.each([
      [1000, '1 Tsd.'],
      [1234, '1,23 Tsd.'],
      [12_345_678, '12,3 Mio.'],
      [2_000_000_000, '2 Mrd.'],
      [1e15 - 1, '999 Bio.'],
    ])('formats %s in German as %s', (value, expected) => {
      expect(formatNumber(value, 'de')).toBe(expected)
    })
  })

  describe('scientific notation', () => {
    it('starts at exactly 10^15', () => {
      expect(formatNumber(1e15, 'en')).toBe('1e15')
    })

    it('formats 1.5 × 10^15', () => {
      expect(formatNumber(1.5e15, 'en')).toBe('1.5e15')
    })

    it('formats values beyond 10^308 in German', () => {
      expect(formatNumber(new Decimal('4.567e400'), 'de')).toBe('4,56e400')
    })
  })

  describe('negative numbers', () => {
    it('adds a leading minus', () => {
      expect(formatNumber(-2500, 'en')).toBe('-2.5K')
    })

    it('formats small negatives', () => {
      expect(formatNumber(-12.59, 'de')).toBe('-12,5')
    })

    it('does not show a minus for values that truncate to zero', () => {
      expect(formatNumber(-0.05, 'en')).toBe('0')
    })
  })

  it('accepts Decimal and number inputs alike', () => {
    expect(formatNumber(new Decimal(1234), 'en')).toBe(formatNumber(1234, 'en'))
  })
})
