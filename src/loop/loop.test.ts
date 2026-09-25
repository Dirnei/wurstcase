import { describe, expect, it } from 'vitest'
import { startLoop } from './loop'

function createHarness() {
  let now = 0
  let callback: (() => void) | undefined
  let cancelled = false
  const ticks: number[] = []

  const stop = startLoop({
    clock: () => now,
    schedule: (fn) => {
      callback = fn
      return () => {
        cancelled = true
      }
    },
    onTick: (seconds) => ticks.push(seconds),
  })

  return {
    ticks,
    stop,
    isCancelled: () => cancelled,
    /** Moves the fake clock to `at` milliseconds and fires the scheduled callback. */
    fireAt(at: number) {
      now = at
      callback?.()
    },
  }
}

describe('startLoop', () => {
  it('credits real elapsed time on regular 100 ms steps', () => {
    const loop = createHarness()
    loop.fireAt(100)
    loop.fireAt(200)
    expect(loop.ticks).toEqual([0.1, 0.1])
  })

  it('credits real time when the browser runs the loop slower', () => {
    const loop = createHarness()
    loop.fireAt(250)
    expect(loop.ticks).toEqual([0.25])
  })

  it('credits a 20 second gap after a hidden tab', () => {
    const loop = createHarness()
    loop.fireAt(20_000)
    expect(loop.ticks).toEqual([20])
  })

  it('caps a 10 minute gap at 60 seconds', () => {
    const loop = createHarness()
    loop.fireAt(10 * 60_000)
    expect(loop.ticks).toEqual([60])
  })

  it('credits nothing when the clock goes backwards, then continues normally', () => {
    const loop = createHarness()
    loop.fireAt(1000)
    loop.fireAt(500)
    loop.fireAt(600)
    expect(loop.ticks).toEqual([1, 0, 0.1])
  })

  it('cancels the schedule when stopped', () => {
    const loop = createHarness()
    loop.stop()
    expect(loop.isCancelled()).toBe(true)
  })
})
