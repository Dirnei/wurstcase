import { describe, expect, it } from 'vitest'
import { startAutosave } from './autosave'

function createHarness() {
  let tick: (() => void) | undefined
  let hide: (() => void) | undefined
  let interval = 0
  const cancelled = { timer: false, pageHide: false }
  let saves = 0

  const stop = startAutosave({
    save: () => saves++,
    schedule: (fn, ms) => {
      tick = fn
      interval = ms
      return () => (cancelled.timer = true)
    },
    onPageHide: (fn) => {
      hide = fn
      return () => (cancelled.pageHide = true)
    },
  })

  return {
    stop,
    cancelled,
    interval: () => interval,
    saves: () => saves,
    fireTimer: () => tick?.(),
    hidePage: () => hide?.(),
  }
}

describe('startAutosave', () => {
  it('saves every 30 seconds', () => {
    const autosave = createHarness()
    expect(autosave.interval()).toBe(30_000)
    autosave.fireTimer()
    autosave.fireTimer()
    expect(autosave.saves()).toBe(2)
  })

  it('saves when the page is hidden or closed', () => {
    const autosave = createHarness()
    autosave.hidePage()
    expect(autosave.saves()).toBe(1)
  })

  it('stops both triggers', () => {
    const autosave = createHarness()
    autosave.stop()
    expect(autosave.cancelled).toEqual({ timer: true, pageHide: true })
  })
})
