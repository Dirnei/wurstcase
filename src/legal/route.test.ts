import { describe, expect, it } from 'vitest'
import { routeFromHash } from './route'

describe('routeFromHash', () => {
  it.each([
    ['#impressum', 'impressum'],
    ['#datenschutz', 'datenschutz'],
    ['#Impressum', 'impressum'],
    ['#DATENSCHUTZ', 'datenschutz'],
    ['', 'game'],
    ['#', 'game'],
    ['#unknown', 'game'],
    ['#dev', 'dev'],
    ['#DEV', 'dev'],
  ])('maps %j to %s', (hash, route) => {
    expect(routeFromHash(hash)).toBe(route)
  })
})
