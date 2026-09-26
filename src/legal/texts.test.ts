import { describe, expect, it } from 'vitest'
import type { LegalDocument } from './document'
import { de } from './texts.de'
import { en } from './texts.en'

const DOCUMENTS = ['impressum', 'datenschutz'] as const
const OPERATOR_FIELDS = ['name', 'street', 'postalCode', 'city', 'country', 'email', 'hostingProvider']

function placeholders(document: LegalDocument): string[] {
  const text = document.sections.flatMap((section) => section.paragraphs).join(' ')
  return [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]))].sort()
}

describe.each(DOCUMENTS)('%s', (name) => {
  it('has the same sections in German and English', () => {
    expect(en[name].sections.map((s) => s.id)).toEqual(de[name].sections.map((s) => s.id))
  })

  it('uses the same placeholders in German and English', () => {
    expect(placeholders(en[name])).toEqual(placeholders(de[name]))
  })

  it('only uses known operator placeholders', () => {
    for (const placeholder of placeholders(de[name])) {
      expect(OPERATOR_FIELDS).toContain(placeholder)
    }
  })

  it('marks the English version as a non-binding translation', () => {
    expect(en[name].note).toMatch(/German version is legally binding/)
    expect(de[name].note).toBeUndefined()
  })
})

describe('Datenschutzerklärung', () => {
  it('has all required sections', () => {
    expect(de.datenschutz.sections.map((s) => s.heading)).toEqual(
      expect.arrayContaining([
        'Verantwortlicher',
        'Cookies und Tracking',
        'Speicherung im Browser',
        'Server-Logdateien',
        'Hosting',
        'Ihre Rechte',
      ]),
    )
  })

  it('names the browser storage key for the language choice', () => {
    const storage = de.datenschutz.sections.find((s) => s.heading === 'Speicherung im Browser')
    expect(storage?.paragraphs.join(' ')).toContain('vegle.language')
  })
})

describe('Impressum', () => {
  it('shows every operator detail', () => {
    expect(placeholders(de.impressum)).toEqual(
      expect.arrayContaining(['name', 'street', 'postalCode', 'city', 'country', 'email']),
    )
  })
})
