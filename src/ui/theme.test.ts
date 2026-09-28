import { describe, expect, it } from 'vitest'
import { parseThemeChoice, resolveTheme } from './theme'

describe('parseThemeChoice', () => {
  it.each(['system', 'light', 'dark'] as const)('keeps the stored choice %s', (choice) => {
    expect(parseThemeChoice(choice)).toBe(choice)
  })

  it.each([null, '', 'Dark', 'sepia'])('reads %j as system', (stored) => {
    expect(parseThemeChoice(stored)).toBe('system')
  })
})

describe('resolveTheme', () => {
  it.each([
    ['system', false, 'light'],
    ['system', true, 'dark'],
    ['light', false, 'light'],
    ['light', true, 'light'],
    ['dark', false, 'dark'],
    ['dark', true, 'dark'],
  ] as const)('resolves %s on a %s-dark system to %s', (choice, systemDark, theme) => {
    expect(resolveTheme(choice, systemDark)).toBe(theme)
  })
})
