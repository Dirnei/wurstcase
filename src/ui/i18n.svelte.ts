import { detectLanguage } from '../i18n/detect'
import type { Lang } from '../i18n/lang'
import { translate, type TranslationKey, type TranslationParams } from '../i18n/translate'

const STORAGE_KEY = 'vegle.language'

let current = $state<Lang>(detectLanguage(readStoredLanguage(), navigator.languages))
applyToDocument()

export function currentLang(): Lang {
  return current
}

/** Reactive: templates calling t() re-render when the language changes. */
export function t(key: TranslationKey, params?: TranslationParams): string {
  return translate(current, key, params)
}

export function setLanguage(lang: Lang): void {
  current = lang
  applyToDocument()
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Storage blocked (e.g. strict private mode): the choice lasts for this visit only.
  }
}

function readStoredLanguage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function applyToDocument(): void {
  document.documentElement.lang = current
  document.title = translate(current, 'app.title')
}
