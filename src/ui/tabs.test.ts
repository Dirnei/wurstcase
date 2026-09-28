import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../game/state'
import { isTabUnlocked, resolveTab, TABS, tabFromHash, tabUnlockAt, type TabId } from './tabs'

function earned(amount: number): GameState {
  return { ...createInitialState(), totalEarned: new Decimal(amount) }
}

describe('tabFromHash', () => {
  it.each([
    ['#produktion', 'produktion'],
    ['#verkauf', 'verkauf'],
    ['#upgrades', 'upgrades'],
    ['#lebenshof', 'lebenshof'],
    ['#aktionen', 'aktionen'],
    ['#einstellungen', 'einstellungen'],
    ['#Verkauf', 'verkauf'],
    ['#LEBENSHOF', 'lebenshof'],
  ])('maps %j to %s', (hash, tab) => {
    expect(tabFromHash(hash)).toBe(tab)
  })

  it.each(['', '#', '#unknown', '#dev', '#impressum', '#datenschutz'])('maps %j to no tab', (hash) => {
    expect(tabFromHash(hash)).toBeNull()
  })
})

describe('TABS', () => {
  it('lists the tabs in display order', () => {
    expect(TABS).toEqual(['produktion', 'verkauf', 'upgrades', 'lebenshof', 'aktionen', 'einstellungen'])
  })
})

describe('isTabUnlocked', () => {
  it('locks Upgrades, Lebenshof and Aktionen in a new game', () => {
    const state = createInitialState()
    const locked = TABS.filter((tab) => !isTabUnlocked(state, tab))
    expect(locked).toEqual(['upgrades', 'lebenshof', 'aktionen'])
  })

  it('never locks Produktion, Verkauf or Einstellungen', () => {
    const state = createInitialState()
    for (const tab of ['produktion', 'verkauf', 'einstellungen'] as TabId[]) {
      expect(isTabUnlocked(state, tab)).toBe(true)
    }
  })

  it('unlocks each tab at its threshold', () => {
    for (const tab of ['upgrades', 'lebenshof', 'aktionen'] as TabId[]) {
      const at = tabUnlockAt(tab)!
      expect(isTabUnlocked(earned(at - 1), tab)).toBe(false)
      expect(isTabUnlocked(earned(at), tab)).toBe(true)
    }
  })
})

describe('tabUnlockAt', () => {
  it('gives the earnings shown in the lock hints', () => {
    expect(tabUnlockAt('upgrades')).toBe(30)
    expect(tabUnlockAt('lebenshof')).toBe(100)
    expect(tabUnlockAt('aktionen')).toBe(100)
  })

  it('gives nothing for tabs that are never locked', () => {
    expect(tabUnlockAt('produktion')).toBeNull()
    expect(tabUnlockAt('einstellungen')).toBeNull()
  })
})

describe('resolveTab', () => {
  const state = createInitialState()

  it('keeps an unlocked tab', () => {
    expect(resolveTab('verkauf', state)).toBe('verkauf')
  })

  it('falls back to Produktion for a locked tab', () => {
    expect(resolveTab('aktionen', state)).toBe('produktion')
  })

  it('falls back to Produktion without a tab', () => {
    expect(resolveTab(null, state)).toBe('produktion')
  })
})
