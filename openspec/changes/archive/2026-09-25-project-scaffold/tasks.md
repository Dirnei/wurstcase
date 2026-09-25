# Tasks

## 1. Project setup

- [x] 1.1 Scaffold Vite `svelte-ts` template into the repo root, remove demo components/assets, set package name `vegle`; verify `npm install` succeeds and `npm run dev` serves an empty page
- [x] 1.2 Add `.gitignore` (`node_modules/`, `dist/`) and verify `git status` does not list them
- [x] 1.3 Add `vitest` and `break_eternity.js`; configure Vitest (node environment) in `vite.config.ts` and set `base: './'`; add scripts `test`, `check` (svelte-check); verify `npm test` runs (0 tests OK) and `npm run check` passes
- [x] 1.4 Create the folder layout from design.md (`src/game`, `src/loop`, `src/i18n`, `src/format`, `src/ui`) and verify `npm run check` still passes

## 2. Formatting (tests first)

- [x] 2.1 Write `src/format/number.test.ts` covering every number-formatting scenario plus boundaries 999, 1000, 999 999, 10^15 − 1, 10^15, 10^400, 0 and negative values in both languages; verify the tests fail
- [x] 2.2 Implement `formatNumber(value, lang)` in `src/format/number.ts`; verify all number tests pass
- [x] 2.3 Write `src/format/duration.test.ts` (0, 90 s, 3 599 s, 100 h 5 m 7 s, fractional seconds truncated); verify the tests fail
- [x] 2.4 Implement `formatDuration(seconds)`; verify duration tests pass

## 3. Localization (tests first)

- [x] 3.1 Write tests for `detectLanguage` (stored choice wins, `de-AT` → de, `fr-FR` only → en, invalid stored value ignored) and `translate` (placeholder replacement, DE→EN fallback, key fallback); verify they fail
- [x] 3.2 Create `src/i18n/en.json` and `de.json` with keys `app.title`, `playTime.label`, `language.toggle.de`, `language.toggle.en`, `language.toggle.label`; add the key-parity test; verify it passes
- [x] 3.3 Implement `detect.ts` and `translate.ts` with the `TranslationKey` type; verify the localization tests pass and a typo key fails `npm run check`
- [x] 3.4 Implement `src/ui/i18n.svelte.ts` (reactive language, `t()`, `setLanguage()` saving to `vegle.language` with try/catch, updating `<html lang>` and `document.title`); verify via `npm run check`

## 4. Game state, tick and loop (tests first)

- [x] 4.1 Write `src/game/tick.test.ts`: `playTime` advances by the given seconds; 1×1 s equals 10×0.1 s within 10^-9 relative tolerance; verify the tests fail
- [x] 4.2 Implement `src/game/state.ts` (`GameState`, `createInitialState`) and `src/game/tick.ts`; verify the tick tests pass
- [x] 4.3 Write `src/loop/loop.test.ts` with a fake clock and manual scheduler: normal 100 ms steps, a slow 250 ms interval credits real time, a 20 s gap credits 20 s, a 10 min gap credits 60 s, a backwards clock credits 0; verify the tests fail
- [x] 4.4 Implement `startLoop` in `src/loop/loop.ts`; verify the loop tests pass

## 5. UI shell

- [x] 5.1 Implement `src/ui/game.svelte.ts` (plain state + `$state` version counter bumped after each tick) and wire `src/main.ts` to create the state, mount `App`, and start the loop with `performance.now` and `setInterval`; verify `npm run check` passes
- [x] 5.2 Build `Header.svelte` (translated title, always-visible DE/EN toggle) and `PlayTime.svelte` (translated label + `formatDuration`); compose them in `App.svelte` with a clean, readable layout that works at phone width; verify in `npm run dev` that the title, toggle and counter render

## 6. Verification

- [x] 6.1 Run `npm test`, `npm run check` and `npm run build`; verify all pass and `dist/` is produced
- [x] 6.2 Play-check in the browser via `npm run dev` and `npm run preview`: the counter reaches about 0:01:00 after a minute; DE/EN toggle switches all text and the tab title instantly without resetting the counter; the choice survives a reload; a German browser language opens in German on a fresh profile; hiding the tab for about 20 s credits about 20 s; the layout has no horizontal scroll at phone width
