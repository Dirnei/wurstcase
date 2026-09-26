import { describe, expect, it } from 'vitest'
import { parseOperatorDetails } from './operator'

const valid = {
  name: 'Erika Beispiel',
  street: 'Beispielweg 3',
  postalCode: '80331',
  city: 'München',
  country: 'Deutschland',
  email: 'erika@example.org',
  hostingProvider: 'Beispiel Hosting GmbH',
}

describe('parseOperatorDetails', () => {
  it('accepts complete details', () => {
    expect(parseOperatorDetails(valid)).toEqual(valid)
  })

  it('ignores extra fields', () => {
    expect(parseOperatorDetails({ ...valid, extra: 1 })).toEqual(valid)
  })

  it('rejects a missing field', () => {
    const { email: _, ...withoutEmail } = valid
    expect(parseOperatorDetails(withoutEmail)).toBeNull()
  })

  it('rejects a non-string field', () => {
    expect(parseOperatorDetails({ ...valid, postalCode: 80331 })).toBeNull()
  })

  it.each([null, 'text', 42, []])('rejects %j', (value) => {
    expect(parseOperatorDetails(value)).toBeNull()
  })
})
