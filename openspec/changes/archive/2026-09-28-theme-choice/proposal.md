# Proposal: theme-choice

## Why

The game follows the system's colour scheme only. A player who uses a dark system but prefers the
light paper look by day (or the dusk landscape at night on a light system) has no way to choose.
Other settings such as the language are already the player's choice, so the colour scheme should
be too.

The concept doc did not plan this change in its section 8 sequence. It is a small settings change
on top of `ui-shell-tabs` (Einstellungen tab) and `ui-art` (paper look and dusk landscape).

## What Changes

- The Einstellungen tab gets a **Theme** section with three buttons: **System**, **Light** and
  **Dark**, styled like the language buttons. System is the default and keeps today's behaviour.
- Light and Dark override the system scheme everywhere: panels, text, illustrations and the
  landscape (day or dusk).
- The choice is stored in the browser like the language choice (not in the save), and applied
  before the game first paints, so a reload never flashes the other theme.
- While System is chosen, the game still switches live when the system scheme changes.
- The privacy policy's "stored in the browser" section names the new stored setting in both
  languages.

## Non-goals

- A theme button in the top bar. The choice is rare; it lives only in Einstellungen.
- New colour themes beyond the existing light paper and dark parchment.
- Following the time of day. "Dark" means the existing dusk look, not a clock-driven switch.
- The developer page's art sheet, which keeps showing both schemes side by side.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `game-screen`: the Paper look requirement follows the player's chosen theme, with System as
  default; the Settings tab requirement adds the theme choice.
- `game-art`: the Dusk requirement applies whenever the dark theme is in effect, by choice or by
  system.
- `legal-pages`: the privacy policy content lists the theme choice among what is stored in the
  browser.

## Impact

- `index.html`: a tiny inline script that applies the stored theme before first paint.
- New `src/ui/theme.svelte.ts` (theme state, storage, system listener), used by `main.ts`.
- `src/app.css`: dark tokens keyed on the applied theme instead of the media query.
- `src/ui/art/Landscape.svelte`, `src/dev/Chart.svelte`: follow the applied theme.
- `src/ui/SettingsTab.svelte`: the Theme section.
- `src/i18n/en.json`, `src/i18n/de.json`: theme labels.
- `src/legal/texts.de.ts`, `texts.en.ts`, `texts.test.ts`: the stored theme key.
- No change to `src/game/`, the save format or the game rules.
