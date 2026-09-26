export interface AutosaveOptions {
  save: () => void
  /** Calls fn every `intervalMs`; returns a function that cancels it. */
  schedule: (fn: () => void, intervalMs: number) => () => void
  /** Calls fn when the page is hidden or being closed; returns a function that unsubscribes. */
  onPageHide: (fn: () => void) => () => void
  intervalMs?: number
}

/** Saves periodically and whenever the page goes away; returns a function that stops both. */
export function startAutosave({ save, schedule, onPageHide, intervalMs = 30_000 }: AutosaveOptions): () => void {
  const cancelTimer = schedule(save, intervalMs)
  const unsubscribe = onPageHide(save)
  return () => {
    cancelTimer()
    unsubscribe()
  }
}
