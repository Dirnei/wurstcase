export const LANGS = ['de', 'en'] as const

export type Lang = (typeof LANGS)[number]
