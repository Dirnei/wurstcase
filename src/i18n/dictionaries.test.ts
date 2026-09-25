import { describe, expect, it } from 'vitest'
import de from './de.json'
import en from './en.json'

describe('translation dictionaries', () => {
  it('have identical key sets in German and English', () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort())
  })

  it('have no empty texts', () => {
    for (const dictionary of [de, en]) {
      for (const [key, text] of Object.entries(dictionary)) {
        expect(text, key).not.toBe('')
      }
    }
  })
})
