import { describe, expect, it } from 'vitest'
import { detectLanguage } from './detect'

describe('detectLanguage', () => {
  it('uses the stored choice over the browser language', () => {
    expect(detectLanguage('en', ['de-DE'])).toBe('en')
  })

  it('matches German regional variants by prefix', () => {
    expect(detectLanguage(null, ['de-AT'])).toBe('de')
  })

  it('picks the first supported browser language', () => {
    expect(detectLanguage(null, ['fr-FR', 'en-GB', 'de-DE'])).toBe('en')
  })

  it('falls back to English when no browser language is supported', () => {
    expect(detectLanguage(null, ['fr-FR'])).toBe('en')
  })

  it('ignores an invalid stored value', () => {
    expect(detectLanguage('xx', ['de-DE'])).toBe('de')
  })

  it('falls back to English with no information at all', () => {
    expect(detectLanguage(null, [])).toBe('en')
  })
})
