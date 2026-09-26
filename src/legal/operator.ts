/** The site operator's details shown on the legal pages; supplied at runtime via legal.json. */
export interface OperatorDetails {
  name: string
  street: string
  postalCode: string
  city: string
  country: string
  email: string
  hostingProvider: string
}

const FIELDS: readonly (keyof OperatorDetails)[] = [
  'name',
  'street',
  'postalCode',
  'city',
  'country',
  'email',
  'hostingProvider',
]

/** Returns the details if every field is a string, otherwise null. Extra fields are dropped. */
export function parseOperatorDetails(value: unknown): OperatorDetails | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  const record = value as Record<string, unknown>
  const details: Partial<OperatorDetails> = {}
  for (const field of FIELDS) {
    const text = record[field]
    if (typeof text !== 'string') {
      return null
    }
    details[field] = text
  }
  return details as OperatorDetails
}
