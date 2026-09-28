import Decimal from 'break_eternity.js'
import { describe, expect, it } from 'vitest'
import { createInitialState, type GameState } from '../game/state'
import { isTabUnlocked, resolveTab, TABS, tabFromHash, tabUnlockHint, type TabId } from './tabs'

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

  it('unlocks the money tabs at their threshold', () => {
    for (const tab of ['upgrades', 'lebenshof'] as TabId[]) {
      const at = tabUnlockHint(tab)!.amount
      expect(isTabUnlocked(earned(at - 1), tab)).toBe(false)
      expect(isTabUnlocked(earned(at), tab)).toBe(true)
    }
  })

  it('unlocks the Aktionen tab with its saved flag, not with money', () => {
    const state = earned(1_000_000)
    expect(isTabUnlocked(state, 'aktionen')).toBe(false)
    state.aktionen.unlocked = true
    expect(isTabUnlocked(state, 'aktionen')).toBe(true)
  })
})

describe('tabUnlockHint', () => {
  it('names money for Upgrades and Lebenshof and awareness for Aktionen', () => {
    expect(tabUnlockHint('upgrades')).toEqual({ kind: 'earned', amount: 30 })
    expect(tabUnlockHint('lebenshof')).toEqual({ kind: 'earned', amount: 100 })
    expect(tabUnlockHint('aktionen')).toEqual({ kind: 'awareness', amount: 50 })
  })

  it('gives nothing for tabs that are never locked', () => {
    expect(tabUnlockHint('produktion')).toBeNull()
    expect(tabUnlockHint('einstellungen')).toBeNull()
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
