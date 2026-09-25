# Design

## Context

Greenfield: the repo holds only the concept doc and OpenSpec files. See proposal.md (Why) for
motivation and the three specs for required behavior. Architecture rules come from section 7 of
the concept doc: pure game logic in `src/game/`, thin Svelte UI, one `tick()` for everything, all
text through i18n. Tooling available locally: Node 24, npm 11. Current package versions at
proposal time: svelte 5.57, vite 8.3, vitest 5.0, break_eternity.js 2.1.

## Goals / Non-Goals

**Goals:**
- A project layout that later changes extend without restructuring.
- Pure, unit-tested modules for translation lookup, language detection, number/duration formatting
  and `tick()`.
- A loop driver whose timing logic is testable without a browser.

**Non-Goals:**
- UI component tests (the UI is verified by playing, per concept 7.5).
- Linting/formatting tooling (ESLint, Prettier). Can be added in any later change.
- Sub-stepping inside `tick()` for large time steps. Nothing in this change depends on step size;
  mechanics that do (production chains) will handle it in their own change.

## Decisions

### Project layout

```
index.html
vite.config.ts            base './', Svelte plugin, Vitest config (node environment)
src/
  main.ts                 mounts App, creates the game, starts the loop
  App.svelte              layout: Header + PlayTime
  game/
    state.ts              GameState type + createInitialState()  → { playTime: number }
    tick.ts               tick(state, seconds): mutates state; now only adds playTime
  loop/
    loop.ts               startLoop({ clock, schedule, onTick }) – timing logic, no DOM access
  i18n/
    en.json  de.json      flat dotted keys: "app.title", "playTime.label", …
    translate.ts          translate(lang, key, params) with EN → key fallback
    detect.ts             detectLanguage(stored, navigatorLanguages)
  format/
    number.ts             formatNumber(value: Decimal | number, lang)
    duration.ts           formatDuration(seconds)
  ui/
    game.svelte.ts        holds the plain GameState and a $state version counter
    i18n.svelte.ts        reactive current language, t(), setLanguage() (+ storage, <html lang>, title)
    Header.svelte         title + DE/EN toggle
    PlayTime.svelte       label + formatted play time
```

`src/game/` gets `state.ts` and `tick.ts`; there is no `src/game/content/` entry yet (the first
content arrives with `production-chain`). `format/`, `i18n/` and `loop/` are separate from `game/`
because they are presentation or browser concerns, but they stay pure so they can be tested.
Tests live next to their modules as `*.test.ts`.

### Scaffold from the official template, then trim

Use `npm create vite@latest` with the `svelte-ts` template and remove the demo files. This keeps
the configuration aligned with what Vite and Svelte currently ship, instead of hand-writing
tsconfig and plugin setup. SvelteKit was rejected: routing, SSR and adapters add nothing for a
single-screen static game.

### `vite.config.ts` uses `base: './'`

Relative asset URLs make the same `dist/` work at the domain root (leberkas.org) and inside
itch.io's nested iframe path, so no build flag is needed per target.

### State is plain data; Svelte sees a version counter

`GameState` is a plain object that `tick()` mutates in place. `ui/game.svelte.ts` keeps it outside
Svelte's reactivity and bumps a `$state` `version` number after every tick; components read game
values inside `$derived(...)` expressions that also read `version`.

- Alternative: make the whole state a deep `$state` proxy. Rejected. It would make game logic
  depend on Svelte (breaks the architecture rule), put proxies around break_eternity `Decimal`
  instances, and add proxy overhead on every mutation at 10 ticks/s.
- Mutating in place rather than returning a new state avoids allocating fresh objects 10 times a
  second once the state holds many `Decimal`s. Tests that compare "one step vs. several steps"
  create two separate initial states.

### Loop driver: `setInterval` + monotonic clock + cap

`startLoop` takes an injected `clock` (`() => number`, `performance.now()` in the browser) and
`schedule` (`setInterval` in the browser). Every 100 ms it computes `elapsed = now − last`,
clamps it to `[0, 60]` seconds, calls `onTick(elapsed)` and stores `now`. This meets the specs:

- Real elapsed time rather than fixed steps satisfies the slow-device scenario.
- `performance.now()` is monotonic, so changing the system clock cannot make time jump back. The
  lower clamp at 0 is a second safety net.
- Browsers throttle or freeze timers in hidden tabs. The first tick after resuming sees the whole
  gap, and the 60 s upper clamp implements the catch-up cap.
- `setInterval` rather than `requestAnimationFrame`: rAF stops completely in hidden tabs, while
  throttled intervals keep background progress going and simply return long gaps.

Tests drive the loop with a fake clock and a manual scheduler, so no timers or DOM are needed.

### Own tiny i18n instead of a library

Flat JSON files (`"playTime.label": "Spielzeit"`) with `{name}` placeholders. `translate()` looks
up the current language, then English, then returns the key. A `TranslationKey` type derived from
`en.json` gives autocomplete and typo errors at compile time. A test checks that `de.json` and
`en.json` have identical key sets.

- Alternatives: `svelte-i18n` (store-based, ICU runtime) and Paraglide (compile step, extra
  tooling). Both are more machinery than two languages and simple placeholders need. If plurals
  become necessary, `Intl.PluralRules` fits into the same function later.
- The language choice is stored under the `localStorage` key `vegle.language`, wrapped in
  try/catch so blocked storage degrades to "not remembered". It will move into the settings part
  of the save in `settings-and-debug`.
- `detectLanguage(stored, navigator.languages)` is a pure function: stored value if valid, else
  the first entry whose prefix is `de` or `en`, else `en`.

### Number formatting from mantissa/exponent, not `log10` of a float

`formatNumber` uses break_eternity's own mantissa/exponent representation to find the magnitude.
Computing `Math.floor(Math.log10(x))` on floats misplaces values like 1000 (log10 → 2.9999…) and
cannot handle values above 10^308. Truncation toward zero is done on the three-significant-digit
mantissa, then trailing zeros are removed and the language's separator and suffix applied. Plain
`number` inputs are converted to `Decimal` first so there is one code path.

## Risks / Trade-offs

- [break_eternity edge cases around exact powers of ten and float mantissas such as 9.999999…] →
  Table-driven tests on the boundaries (999, 1000, 999 999, 10^15 − 1, 10^15, 10^400).
- [A 60 s gap arrives as one big tick; later mechanics may need smaller steps] → Accepted for
  now. Production and awareness changes will decide on sub-stepping inside `tick()`, and
  `offline-progress` replaces the cap.
- [vitest 5 / vite 8 / Svelte plugin version mismatch at install time] → Install through the
  template, then add vitest; if peer ranges conflict, pin the newest compatible versions and note
  them in tasks.
- [Own i18n lacks plurals and ICU formatting] → Not needed yet. The single `translate()` entry
  point allows adding it without touching call sites.
