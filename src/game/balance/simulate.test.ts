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

  it('rescues animals into shelters and grows its customers', () => {
    const run = simulate({ minutes: 60, clicksPerSecond: 2 })
    const firstStable = run.log.findIndex((p) => p.kind === 'shelter')
    const firstChicken = run.log.findIndex((p) => p.kind === 'animal' && p.id === 'chicken')
    expect(firstStable).toBeGreaterThanOrEqual(0)
    expect(firstChicken).toBeGreaterThan(firstStable)
    expect(run.final.customers.toNumber()).toBeGreaterThan(10)
  })

  it('can feed its surplus to MegaMeat, and sends products to the biogas plant', () => {
    const run = simulate({ minutes: 20, clicksPerSecond: 2, surplusBuyer: 'megaMeat' })
    expect(run.final.unitsSold.megaMeat.toNumber()).toBeGreaterThan(0)
    expect(run.final.unitsSold.biogas.toNumber()).toBeGreaterThan(0)
    const again = simulate({ minutes: 20, clicksPerSecond: 2, surplusBuyer: 'megaMeat' })
    expect(again.final.money.eq(run.final.money)).toBe(true)
  })

  it('grows more slowly and earns less when it feeds its surplus to MegaMeat', () => {
    const fair = simulate({ minutes: 60, clicksPerSecond: 2 })
    const fed = simulate({ minutes: 60, clicksPerSecond: 2, surplusBuyer: 'megaMeat' })
    const at = (run: typeof fair, minutes: number) => run.samples[minutes * 60 - 1]
    expect(fed.final.unitsSold.megaMeat.toNumber()).toBeGreaterThan(0)
    // Customers are compared at 30 minutes, before either run can fill the town.
    expect(at(fed, 30).customers).toBeLessThan(at(fair, 30).customers)
    expect(at(fed, 60).totalEarned).toBeLessThanOrEqual(0.75 * at(fair, 60).totalEarned)
  })

  it('runs the flyers and grows its customers only through campaigns', () => {
    const { log, final } = simulate({ minutes: 60, clicksPerSecond: 2 })
    expect(log.some((p) => p.kind === 'aktion' && p.id === 'flyer')).toBe(true)
    expect(final.customers.toNumber()).toBeGreaterThan(10)
  })

  describe('tempted by MegaMeat', () => {
    const fair = simulate({ minutes: 60, clicksPerSecond: 2 })
    const tempted = simulate({ minutes: 60, clicksPerSecond: 2, strategy: 'tempted' })
    const earnedAt = (run: typeof fair, minutes: number) => run.samples[minutes * 60 - 1].totalEarned

    it('only buys fields and never processes', () => {
      expect(tempted.log.every((p) => p.kind === 'storeroom' || ['soybeanField', 'oatField', 'wheatField'].includes(p.id))).toBe(true)
      expect(tempted.final.unitsSold.megaMeat.toNumber()).toBeGreaterThan(0)
    })

    it('earns more than the fair player at 5 minutes', () => {
      expect(earnedAt(tempted, 5)).toBeGreaterThan(earnedAt(fair, 5))
      // 10-minute gate suspended by flatten-building-price-curve (design.md, "Suspended gates"):
      // the user playtests the flatter curve, under which the fair player is already ahead.
      // Re-baselined to the measured values (tempted about €27,320 below fair about €38,239).
      expect(earnedAt(tempted, 10)).toBeLessThan(earnedAt(fair, 10))
    })

    it('ends with at most two thirds of what the fair player earned at 60 minutes', () => {
      expect(earnedAt(fair, 60)).toBeGreaterThanOrEqual(1.5 * earnedAt(tempted, 60))
    })

    it('is deterministic', () => {
      const again = simulate({ minutes: 60, clicksPerSecond: 2, strategy: 'tempted' })
      expect(again.final.money.eq(tempted.final.money)).toBe(true)
      expect(again.log).toEqual(tempted.log)
    })
  })

  it('expands the storeroom when goods fill up', () => {
    const { log, final } = simulate({ minutes: 60, clicksPerSecond: 2 })
    const expansions = log.filter((p) => p.kind === 'storeroom')
    expect(expansions.length).toBeGreaterThanOrEqual(1)
    expect(final.storeroom).toBe(1 + expansions.length)
  })

  it('buys the hydraulic press, a yield upgrade', () => {
    const { log } = simulate({ minutes: 60, clicksPerSecond: 2 })
    expect(log.some((p) => p.kind === 'upgrade' && p.id === 'hydraulicPress')).toBe(true)
  })

  it('buys better seeds once the fifth soybean field makes them pay', () => {
    const { log } = simulate({ minutes: 60, clicksPerSecond: 2 })
    const seeds = log.findIndex((p) => p.kind === 'upgrade' && p.id === 'betterSeeds')
    const fifthField = log.filter((p) => p.id === 'soybeanField')[4]
    expect(seeds).toBeGreaterThan(log.indexOf(fifthField))
    expect(log.some((p) => p.kind === 'upgrade' && p.id === 'strongHands')).toBe(true)
  })

  it('sells its surplus in bulk', () => {
    const { final } = simulate({ minutes: 30, clicksPerSecond: 2 })
    expect(final.unitsSold.megaMeat.add(final.unitsSold.biogas).toNumber()).toBeGreaterThan(0)
  })

  it('records when each upgrade went on offer and what it would add', () => {
    const { offers } = simulate({ minutes: 20, clicksPerSecond: 2 })
    const hands = offers.find((offer) => offer.id === 'strongHands')!
    expect(hands.time).toBeGreaterThan(0)
    expect(hands.gain).toBeNull()
    const seeds = offers.find((offer) => offer.id === 'betterSeeds')
    if (seeds) expect(seeds.gain).not.toBeNull()
  })

  // A guard against pathological slowdowns, not a benchmark: sized for a busy machine running
  // several simulations at once, and still catches a run twice as slow as today's 2–3 s.
  it('runs a 60-minute game in under 4 seconds', () => {
    const start = performance.now()
    simulate({ minutes: 60, clicksPerSecond: 2 })
    expect(performance.now() - start).toBeLessThan(4000)
  })
})
