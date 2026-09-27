import { afterEach, describe, expect, it, vi } from 'vitest'
import { devToolsEnabled } from './enabled'

function respond(response: Partial<Response> | Error) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response))),
  )
}

const json = (body: unknown, ok = true): Partial<Response> => ({ ok, json: () => Promise.resolve(body) })

describe('devToolsEnabled', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is on when the server says so', async () => {
    respond(json({ enabled: true }))
    expect(await devToolsEnabled(false)).toBe(true)
    expect(fetch).toHaveBeenCalledWith('./dev.json', { cache: 'no-cache' })
  })

  it('is always on under the development server, without asking', async () => {
    respond(new Error('should not be called'))
    expect(await devToolsEnabled(true)).toBe(true)
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each([
    ['disabled', json({ enabled: false })],
    ['a truthy non-boolean', json({ enabled: 'true' })],
    ['a 404', json(null, false)],
    ['invalid JSON', { ok: true, json: () => Promise.reject(new SyntaxError('bad')) }],
  ])('is off for %s', async (_, response) => {
    respond(response)
    expect(await devToolsEnabled(false)).toBe(false)
  })

  it('is off on a network error', async () => {
    respond(new TypeError('offline'))
    expect(await devToolsEnabled(false)).toBe(false)
  })
})
