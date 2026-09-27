import { describe, expect, it } from 'vitest'
import { simulate } from './simulate'

describe('simulate', () => {
  it('gives the same result for the same settings', () => {
    const a = simulate({ minutes: 10, clicksPerSecond: 2 })
    const b = simulate({ minutes: 10, clicksPerSecond: 2 })
    expect(a.log).toEqual(b.log)
    expect(a.final.money.eq(b.final.money)).toBe(true)
  })

  it('buys nothing and earns nothing without clicks', () => {
    const run = simulate({ minutes: 5, clicksPerSecond: 0 })
    expect(run.log).toEqual([])
    expect(run.final.money.toNumber()).toBe(0)
  })

  it('starts with a soybean field or a tofu press within 10 minutes', () => {
    const [first] = simulate({ minutes: 10, clicksPerSecond: 2 }).log
    expect(first).toBeDefined()
    expect(['soybeanField', 'tofuPress']).toContain(first.id)
    expect(first.time).toBeLessThanOrEqual(600)
  })

  it('hires the shop assistant', () => {
    const run = simulate({ minutes: 20, clicksPerSecond: 2 })
    expect(run.log.some((purchase) => purchase.kind === 'assistant')).toBe(true)
    expect(run.final.assistant).toBe(true)
  })

  it('never goes into debt', () => {
    const run = simulate({ minutes: 20, clicksPerSecond: 2 })
    expect(run.samples.every((sample) => sample.money >= 0)).toBe(true)
    expect(run.log.every((purchase) => purchase.price > 0)).toBe(true)
  })

  it('samples once per simulated second', () => {
    const run = simulate({ minutes: 5, clicksPerSecond: 2 })
    expect(run.samples).toHaveLength(300)
    expect(run.samples.map((sample) => sample.time)).toEqual(Array.from({ length: 300 }, (_, i) => i + 1))
  })

  it('rescues animals into shelters once buildings stop adding income', () => {
    const run = simulate({ minutes: 60, clicksPerSecond: 2 })
    const firstStable = run.log.findIndex((p) => p.kind === 'shelter')
    const firstChicken = run.log.findIndex((p) => p.kind === 'animal' && p.id === 'chicken')
    expect(firstStable).toBeGreaterThanOrEqual(0)
    expect(firstChicken).toBeGreaterThan(firstStable)
    expect(run.final.customers.toNumber()).toBeGreaterThan(10)
  })

  it('buys better seeds once the fifth soybean field makes them pay', () => {
    const { log } = simulate({ minutes: 60, clicksPerSecond: 2 })
    const seeds = log.findIndex((p) => p.kind === 'upgrade' && p.id === 'betterSeeds')
    const fifthField = log.filter((p) => p.id === 'soybeanField')[4]
    expect(seeds).toBeGreaterThan(log.indexOf(fifthField))
    expect(log.some((p) => p.kind === 'upgrade' && p.id === 'strongHands')).toBe(true)
  })

  it('records when each upgrade went on offer and what it would add', () => {
    const { offers } = simulate({ minutes: 20, clicksPerSecond: 2 })
    const hands = offers.find((offer) => offer.id === 'strongHands')!
    expect(hands.time).toBeGreaterThan(0)
    expect(hands.gain).toBeNull()
    const seeds = offers.find((offer) => offer.id === 'betterSeeds')
    if (seeds) expect(seeds.gain).not.toBeNull()
  })

  it('runs a 60-minute game in under 2 seconds', () => {
    const start = performance.now()
    simulate({ minutes: 60, clicksPerSecond: 2 })
    expect(performance.now() - start).toBeLessThan(2000)
  })
})
