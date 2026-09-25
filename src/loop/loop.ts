export interface LoopOptions {
  /** Monotonic milliseconds, e.g. performance.now. */
  clock: () => number
  /** Calls fn repeatedly every `intervalMs`; returns a function that cancels it. */
  schedule: (fn: () => void, intervalMs: number) => () => void
  /** Receives the real seconds elapsed since the previous call. */
  onTick: (seconds: number) => void
  intervalMs?: number
  /** Longest gap credited at once, e.g. after a hidden tab. Longer gaps are cut to this. */
  maxStepSeconds?: number
}

/** Starts driving the game from real time; returns a function that stops it. */
export function startLoop({
  clock,
  schedule,
  onTick,
  intervalMs = 100,
  maxStepSeconds = 60,
}: LoopOptions): () => void {
  let last = clock()

  return schedule(() => {
    const now = clock()
    const elapsed = (now - last) / 1000
    last = now
    onTick(Math.min(Math.max(elapsed, 0), maxStepSeconds))
  }, intervalMs)
}
