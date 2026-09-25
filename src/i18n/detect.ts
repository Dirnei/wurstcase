import { LANGS, type Lang } from './lang'

/** Picks the stored choice if valid, else the first supported browser language, else English. */
export function detectLanguage(stored: string | null, browserLanguages: readonly string[]): Lang {
  if (isLang(stored)) {
    return stored
  }
  for (const language of browserLanguages) {
    const prefix = language.slice(0, 2).toLowerCase()
    if (isLang(prefix)) {
      return prefix
    }
  }
  return 'en'
}

export function isLang(value: string | null): value is Lang {
  return (LANGS as readonly (string | null)[]).includes(value)
}
