import { parseOperatorDetails, type OperatorDetails } from '../legal/operator'

export type OperatorState =
  | { status: 'loading' }
  | { status: 'ready'; details: OperatorDetails }
  | { status: 'unavailable' }

let state = $state<OperatorState>({ status: 'loading' })
let requested = false

/** Reactive operator details; fetched on first use so the game itself never waits for them. */
export function operatorState(): OperatorState {
  if (!requested) {
    requested = true
    void load()
  }
  return state
}

async function load(): Promise<void> {
  try {
    // no-cache: revalidate every time so changed details show up after a reload.
    const response = await fetch('./legal.json', { cache: 'no-cache' })
    const details = response.ok ? parseOperatorDetails(await response.json()) : null
    state = details ? { status: 'ready', details } : { status: 'unavailable' }
  } catch {
    state = { status: 'unavailable' }
  }
}
