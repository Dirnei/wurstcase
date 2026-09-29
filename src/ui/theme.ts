// The boot script in index.html repeats the storage key, the preview prefix (src/save/storage-scope.ts)
// and the resolve rule below, so the first frame already has the right theme. Keep them in step.

export type ThemeChoice = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

export const THEME_CHOICES: readonly ThemeChoice[] = ['system', 'light', 'dark']
export const THEME_STORAGE_KEY = 'vegle.theme'

/** A missing or unknown stored value means the player never chose: follow the system. */
export function parseThemeChoice(stored: string | null): ThemeChoice {
  return THEME_CHOICES.find((choice) => choice === stored) ?? 'system'
}

export function resolveTheme(choice: ThemeChoice, systemDark: boolean): Theme {
  if (choice === 'system') {
    return systemDark ? 'dark' : 'light'
  }
  return choice
}
