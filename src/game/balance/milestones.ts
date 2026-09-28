import type { Purchase } from './player'

export interface Milestone {
  id: string
  label: string
  /** Target window in minutes of game time, from section 5 of the concept doc. */
  window: readonly [number, number]
  /** Game time in seconds at which the milestone happened, or null. */
  reached: (log: readonly Purchase[]) => number | null
}

export type PacingStatus = 'early' | 'in window' | 'late' | 'not reached'

export interface PacingRow {
  id: string
  label: string
  window: readonly [number, number]
  time: number | null
  status: PacingStatus
}

const firstPurchase =
  (kind: Purchase['kind'], id: string) =>
  (log: readonly Purchase[]): number | null =>
    log.find((purchase) => purchase.kind === kind && purchase.id === id)?.time ?? null

/** Pacing milestones; later changes add their own. */
export const MILESTONES: readonly Milestone[] = [
  { id: 'soybeanField', label: 'First soybean field', window: [2, 10], reached: firstPurchase('building', 'soybeanField') },
  { id: 'tofuPress', label: 'First tofu press', window: [2, 10], reached: firstPurchase('building', 'tofuPress') },
  { id: 'oatField', label: 'First oat field', window: [10, 20], reached: firstPurchase('building', 'oatField') },
  { id: 'wheatField', label: 'First wheat field', window: [20, 35], reached: firstPurchase('building', 'wheatField') },
  { id: 'leverkasOven', label: 'First Leverkas oven', window: [20, 35], reached: firstPurchase('building', 'leverkasOven') },
  { id: 'chicken', label: 'First chicken', window: [2, 10], reached: firstPurchase('animal', 'chicken') },
  { id: 'pig', label: 'First pig', window: [10, 20], reached: firstPurchase('animal', 'pig') },
  { id: 'cow', label: 'First cow', window: [20, 35], reached: firstPurchase('animal', 'cow') },
]

export function pacingTable(log: readonly Purchase[], milestones: readonly Milestone[] = MILESTONES): PacingRow[] {
  return milestones.map(({ id, label, window, reached }) => {
    const time = reached(log)
    const status: PacingStatus =
      time === null ? 'not reached' : time < window[0] * 60 ? 'early' : time > window[1] * 60 ? 'late' : 'in window'
    return { id, label, window, time, status }
  })
}
