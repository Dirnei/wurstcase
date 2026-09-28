# Tasks

## 1. Theme logic

- [x] 1.1 Write Vitest tests for `src/ui/theme.ts`: parsing a stored value (`light`, `dark`,
  `system`, missing, unknown → `system`) and `resolveTheme` for every choice with a light and a
  dark system. Verify they fail.
- [x] 1.2 Implement `src/ui/theme.ts`. Verify the tests from 1.1 pass.
- [x] 1.3 Add `src/ui/theme.svelte.ts` with `currentTheme()`, `setTheme()`, storage under
  `vegle.theme` in `try`/`catch`, the system-scheme listener and applying `data-theme` to
  `<html>`; import it from `main.ts`. Verify the type check passes.

## 2. Styles follow `data-theme`

- [x] 2.1 Add the inline boot script to `index.html` that sets `data-theme` from `vegle.theme` and
  the system scheme before first paint. Verify in the browser with Dark stored on a light system
  that a reload shows no light frame (record the load in the dev tools' performance panel or
  throttle the network).
- [x] 2.2 In `app.css`, replace the `prefers-color-scheme` block with `:root[data-theme='dark']`
  and set `color-scheme` per theme. In `Landscape.svelte`, switch the sun/moon rule to
  `:root[data-theme='dark']`. In `dev/Chart.svelte`, rebuild on `data-theme` changes. Verify with a
  search that `prefers-color-scheme` only remains in the theme files and the boot script.

## 3. Settings and text

- [x] 3.1 Add `settings.theme`, `theme.system`, `theme.light` and `theme.dark` to `en.json` and
  `de.json`, and the Theme section with three `aria-pressed` buttons to `SettingsTab.svelte`.
  Verify the i18n key-parity test passes and that choosing each option switches at once.
- [x] 3.2 Add the theme choice with the key `vegle.theme` to the browser-storage paragraph in
  `texts.de.ts` and `texts.en.ts`, and extend `texts.test.ts` to check for it. Verify the test
  passes.

## 4. Verification

- [x] 4.1 Run the tests, the type check and the production build and check they pass.
- [x] 4.2 Play-check in the browser: on a light and on a dark system scheme (dev tools' emulation),
  try System, Light and Dark; check panels, illustrations and the landscape (sun vs. moon) follow
  the choice, that System follows a live system switch and Light/Dark ignore it, that a reload
  keeps the choice without a flash, that New game keeps the theme, and that the dev page charts
  follow the theme.
