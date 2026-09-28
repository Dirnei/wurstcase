import { parseThemeChoice, resolveTheme, THEME_STORAGE_KEY, type ThemeChoice } from './theme'

const systemScheme = matchMedia('(prefers-color-scheme: dark)')

let current = $state<ThemeChoice>(parseThemeChoice(readStoredChoice()))
applyToDocument()
// Only changes anything while the choice is System.
systemScheme.addEventListener('change', applyToDocument)

export function currentTheme(): ThemeChoice {
  return current
}

export function setTheme(choice: ThemeChoice): void {
  current = choice
  applyToDocument()
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice)
  } catch {
    // Storage blocked (e.g. strict private mode): the choice lasts for this visit only.
  }
}

function readStoredChoice(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

/** The CSS keys every themed rule on `data-theme`, which always holds the theme in effect. */
function applyToDocument(): void {
  document.documentElement.dataset.theme = resolveTheme(current, systemScheme.matches)
}
