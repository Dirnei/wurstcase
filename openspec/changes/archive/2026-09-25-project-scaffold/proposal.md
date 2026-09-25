# Proposal

## Why

The repository contains only the concept document. Every later change (save system, production
chain, Lebenshof, …) needs a runnable, testable browser project with bilingual text, big-number
display and a running game loop. This change is the first in the v1 sequence: row 1,
`project-scaffold`, in section 8 of `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`.

## What Changes

- New Vite + Svelte 5 + TypeScript project at the repo root, with scripts for dev server, build,
  type check and tests (Vitest).
- `break_eternity.js` added as the big-number type used by all game logic.
- Localization: German and English text from key-based translation files, initial language picked
  from the browser, a visible DE/EN toggle, and the choice remembered across reloads.
- Number formatting: big numbers shown compactly with localized suffixes and decimal separators.
- Game loop: a fixed-rate loop (10 ticks per second) driven by real elapsed time that calls a pure
  `tick(state, seconds)`. The only thing it advances for now is a play-time counter shown on
  screen, which proves the loop runs.
- App shell: page title, a header with the (working) game title and the language toggle, and the
  play-time display.

## Capabilities

### New Capabilities

- `localization`: DE/EN player-facing text, language selection, fallback and persistence of the
  choice.
- `number-formatting`: how resource amounts of any size are displayed in each language.
- `game-loop`: how game time advances while the page is open, including after the tab was hidden.

### Modified Capabilities

None. There are no existing specs.

## Non-goals

Deferred to later changes in the section 8 sequence:

- Save/load, autosave, export/import, save versioning: `game-state-and-save` (2). Only the language
  choice is remembered in this change.
- Any game mechanic (fields, products, sales, animals, awareness): changes 3–9.
- Catching up time spent away with the page closed, and long hidden-tab gaps: `offline-progress`
  (10).
- Settings screen, number-notation toggle (scientific vs. suffixes), debug panel:
  `settings-and-debug` (11).
- Deployment to itch.io / leberkas.org: `release-v1` (12).
- Visual design beyond a clean, readable layout.

## Impact

- New files: `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/**`.
- New dependencies: `svelte`, `vite`, `@sveltejs/vite-plugin-svelte`, `typescript`, `svelte-check`,
  `vitest`, `break_eternity.js`.
- `.gitignore` for `node_modules/` and `dist/`.
- No existing code is affected.
