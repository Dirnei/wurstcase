import { describe, expect, it } from 'vitest'
import { createTranslator } from './translate'

const translate = createTranslator({
  en: { greeting: 'Hello {name}', onlyEnglish: 'English only', title: 'Title' },
  de: { greeting: 'Hallo {name}', title: 'Titel' },
})

describe('translate', () => {
  it('returns the text in the requested language', () => {
    expect(translate('de', 'title')).toBe('Titel')
  })

  it('replaces placeholders with values', () => {
    expect(translate('de', 'greeting', { name: 'Rosi' })).toBe('Hallo Rosi')
  })

  it('leaves unknown placeholders untouched', () => {
    expect(translate('en', 'greeting')).toBe('Hello {name}')
  })

  it('falls back to English when the German entry is missing', () => {
    expect(translate('de', 'onlyEnglish')).toBe('English only')
  })

  it('falls back to the key when no language has an entry', () => {
    expect(translate('de', 'missing.key')).toBe('missing.key')
  })
})
