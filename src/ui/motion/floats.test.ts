import { describe, expect, it } from 'vitest'
import { expire, FLOAT_MS, MAX_FLOATS, push, type Float } from './floats'

describe('push', () => {
  it('adds a float with its amount and start time', () => {
    const list = push([], '€70', 1_000)
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ text: '€70', startedAt: 1_000 })
  })

  it('gives every float its own id', () => {
    let list: Float[] = []
    for (let i = 0; i < 3; i++) list = push(list, '€1', i)
    expect(new Set(list.map((float) => float.id)).size).toBe(3)
  })

  it('keeps at most 5 and drops the oldest', () => {
    let list: Float[] = []
    for (let i = 0; i < 7; i++) list = push(list, `€${i}`, i)
    expect(MAX_FLOATS).toBe(5)
    expect(list.map((float) => float.text)).toEqual(['€2', '€3', '€4', '€5', '€6'])
  })
})

describe('expire', () => {
  it('removes floats older than 900 ms and keeps the rest', () => {
    const list = push(push([], 'old', 0), 'new', 500)
    expect(FLOAT_MS).toBe(900)
    expect(expire(list, 899).map((float) => float.text)).toEqual(['old', 'new'])
    expect(expire(list, 901).map((float) => float.text)).toEqual(['new'])
    expect(expire(list, 1_401)).toEqual([])
  })
})
