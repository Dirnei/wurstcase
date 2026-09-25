import de from './de.json'
import en from './en.json'
import type { Lang } from './lang'

export type TranslationKey = keyof typeof en
export type TranslationParams = Readonly<Record<string, string | number>>

type Dictionary = Readonly<Record<string, string>>

/** Looks up the requested language, then English, then shows the key itself. */
export function createTranslator(dictionaries: Readonly<Record<Lang, Dictionary>>) {
  return (lang: Lang, key: string, params: TranslationParams = {}): string => {
    const text = dictionaries[lang][key] ?? dictionaries.en[key] ?? key
    return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
      name in params ? String(params[name]) : placeholder,
    )
  }
}

export const translate: (lang: Lang, key: TranslationKey, params?: TranslationParams) => string =
  createTranslator({ de, en })
