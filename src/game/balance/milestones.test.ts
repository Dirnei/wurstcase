import { describe, expect, it } from 'vitest'
import { MILESTONES, pacingTable } from './milestones'
import type { Purchase } from './player'

const field = (time: number): Purchase => ({ time, kind: 'building', id: 'soybeanField', price: 10 })
const row = (log: Purchase[], id: string) => pacingTable(log).find((r) => r.id === id)!

describe('pacingTable', () => {
  it('marks a milestone inside its window', () => {
    expect(row([field(270)], 'soybeanField')).toMatchObject({ time: 270, status: 'in window' })
  })

  it('marks early and late milestones', () => {
    expect(row([field(60)], 'soybeanField').status).toBe('early')
    expect(row([field(720)], 'soybeanField').status).toBe('late')
  })

  it('marks a milestone that never happened', () => {
    expect(row([field(270)], 'leverkasOven')).toMatchObject({ time: null, status: 'not reached' })
  })

  it('uses the first purchase only', () => {
    expect(row([field(300), field(900)], 'soybeanField').time).toBe(300)
  })

  it('has the buildings and animals with their target windows', () => {
    expect(MILESTONES.map((m) => [m.id, m.window])).toEqual([
      ['soybeanField', [2, 10]],
      ['tofuPress', [2, 10]],
      ['oatField', [10, 20]],
      ['wheatField', [20, 35]],
      ['leverkasOven', [20, 55]],
      ['chicken', [2, 10]],
      ['pig', [10, 20]],
      ['cow', [18, 35]],
    ])
  })

  it('counts a first Leverkas oven at 38 minutes and a first cow at 18.5 minutes as in their windows', () => {
    const log = [
      { time: 38 * 60, kind: 'building' as const, id: 'leverkasOven', price: 450 },
      { time: 18.5 * 60, kind: 'animal' as const, id: 'cow', price: 4000 },
    ]
    const rows = pacingTable(log)
    expect(rows.find((r) => r.id === 'leverkasOven')!.status).toBe('in window')
    expect(rows.find((r) => r.id === 'cow')!.status).toBe('in window')
  })
})
