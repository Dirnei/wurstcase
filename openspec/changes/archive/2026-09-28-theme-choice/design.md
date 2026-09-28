# Design: theme-choice

## Context

See proposal.md - Why. What we found in the code:

- `src/app.css` defines light tokens on `:root` and overrides them in one
  `@media (prefers-color-scheme: dark) { :root { … } }` block (UI and `--art-*` dusk colours).
  `:root` also sets `color-scheme: light dark`.
- Only two other places read the system scheme: `Landscape.svelte` swaps sun for moon and stars
  in a `prefers-color-scheme: dark` media query, and the dev `Chart.svelte` rebuilds on a
  `matchMedia('(prefers-color-scheme: dark)')` change. The dev art sheet forces a scheme with the
  `.art-day` / `.art-dusk` classes and is not affected.
- `src/ui/i18n.svelte.ts` is the pattern for a browser-stored preference: a `vegle.language`
  localStorage key, read and written in `try`/`catch`, a `$state` value and an apply function.
- The privacy texts in `src/legal/texts.{de,en}.ts` name the stored key `vegle.language`, and
  `texts.test.ts` checks for it.
- The container serves no Content-Security-Policy (`docker/security-headers.conf`), so an inline
  script in `index.html` is allowed.

**src/game/ files and content entries:** none are added or changed.

## Goals / Non-Goals

**Goals:**
- One switch point in the CSS: every themed rule keys on one attribute, whatever the source of
  the theme.
- No flash of the wrong theme on load.

**Non-Goals:**
- Theming through Svelte state in components. Components keep using CSS tokens.

## Decisions

### 1. `data-theme` on `<html>` always holds the theme in effect

The resolved theme (`light` or `dark`) is always written to `document.documentElement.dataset.theme`,
also when the choice is System. The CSS then has exactly one dark block:
`:root[data-theme='dark'] { … }` replacing the media-query block, and `color-scheme` is set per
theme (`light` / `dark`) so native scrollbars and form controls match. Landscape uses
`:global(:root[data-theme='dark'])` instead of its media query.

- *Alternative: only set the attribute for an explicit choice and keep the media query for
  System.* Rejected: the whole dark token block would have to exist twice (once inside
  `@media … { :root:not([data-theme='light']) }`, once under `[data-theme='dark']`), and every
  future themed rule would need both.

### 2. `theme.svelte.ts` owns the choice

Modelled on `i18n.svelte.ts`:

- `type ThemeChoice = 'system' | 'light' | 'dark'`, stored under `vegle.theme`. Missing or unknown
  stored values read as `system`.
- `currentTheme()` returns the choice (for the buttons); `setTheme(choice)` stores it and applies.
- A `matchMedia('(prefers-color-scheme: dark)')` listener re-applies when the system changes; it
  only has an effect while the choice is System.
- The pure part (`resolveTheme(choice, systemDark)` and parsing the stored value) lives in a small
  `src/ui/theme.ts` with Vitest tests; the `.svelte.ts` file only wires state, storage and the DOM.

The dev `Chart.svelte` watches the `data-theme` attribute (a `MutationObserver` on `<html>`)
instead of the media query, so charts also follow an explicit choice.

### 3. Inline boot script in `index.html`

A few lines in `<head>` read `vegle.theme`, resolve it with `matchMedia`, and set `data-theme`
before any CSS paints. It has its own `try`/`catch` and defaults to the system scheme. It must use
the same key and the same resolve rule as `theme.ts`; a comment in both points to the other.

- *Alternative: apply only from `main.ts`.* Rejected: the module loads after first paint, so a
  dark-choice player on a light system would see a light page flash on every load.

### 4. Settings UI

A new section in `SettingsTab.svelte` between Language and Spielstand, with the same
`role="group"` and `aria-pressed` buttons as the language section. New keys:

| Key | EN | DE |
|---|---|---|
| `settings.theme` | Theme | Farbschema |
| `theme.system` | System | System |
| `theme.light` | Light | Hell |
| `theme.dark` | Dark | Dunkel |

### 5. Privacy text

The browser-storage paragraph in both languages adds the theme choice with the key
`vegle.theme`. `texts.test.ts` checks for the key like it does for `vegle.language`.

## Risks / Trade-offs

- [Boot script and `theme.ts` drift apart] → Both are tiny and cross-referenced; the browser
  check in the tasks reloads with every choice on both system schemes.
- [`stable-top-bar` also modifies the Settings tab requirement] → Whichever change is archived
  second must merge both additions (play time in the save section and the theme choice) into the
  requirement text before archiving.
- [A missed `prefers-color-scheme` rule stays tied to the system] → A search for
  `prefers-color-scheme` in `src/` must only find `theme.ts` / `theme.svelte.ts` and the boot
  script afterwards.

## Migration Plan

No save migration; the theme is not part of the save. Players start on System, which is today's
behaviour. Roll back by reverting the commit; a leftover `vegle.theme` key is then ignored.
