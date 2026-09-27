import { describe, expect, it } from 'vitest'
import { FARM_SLOTS, farmFigures, MAX_FIGURES } from './farmSlots'

describe('FARM_SLOTS', () => {
  it('has 30 places, all different', () => {
    expect(FARM_SLOTS).toHaveLength(30)
    expect(new Set(FARM_SLOTS.map((slot) => `${slot.x},${slot.y}`)).size).toBe(30)
  })

  it('keeps every place inside the scene', () => {
    for (const slot of FARM_SLOTS) {
      expect(slot.x).toBeGreaterThanOrEqual(0)
      expect(slot.x).toBeLessThanOrEqual(100)
      expect(slot.y).toBeGreaterThanOrEqual(0)
      expect(slot.y).toBeLessThanOrEqual(100)
    }
  })
})

describe('farmFigures', () => {
  it('gives each resident the slot of its rescue index, the same every time', () => {
    const first = farmFigures(5)
    const later = farmFigures(12)
    expect(later.figures.slice(0, 5)).toEqual(first.figures)
    expect(first.figures.map((figure) => figure.index)).toEqual([0, 1, 2, 3, 4])
  })

  it('shows every resident up to the cap', () => {
    expect(farmFigures(2)).toMatchObject({ more: 0 })
    expect(farmFigures(2).figures).toHaveLength(2)
    expect(farmFigures(MAX_FIGURES).figures).toHaveLength(30)
    expect(farmFigures(MAX_FIGURES).more).toBe(0)
  })

  it('caps the drawing at 30 and counts the rest', () => {
    const scene = farmFigures(45)
    expect(scene.figures).toHaveLength(30)
    expect(scene.more).toBe(15)
  })

  it('draws the back rows first so nearer animals overlap them', () => {
    const ys = farmFigures(30).drawOrder.map((index) => FARM_SLOTS[index].y)
    expect(ys).toEqual([...ys].sort((a, b) => a - b))
  })
})
