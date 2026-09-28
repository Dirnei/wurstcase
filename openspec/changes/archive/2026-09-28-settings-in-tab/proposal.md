# Proposal: settings-in-tab

## Why

The top bar carries two controls that duplicate the Einstellungen tab: the DE/EN toggle (the tab
already has a language section) and a gear button that only opens the tab. Players switch
language once, not while playing, so the toggle takes top-bar space from the figures that matter.
The gear exists only because the tab strip hides Einstellungen below 1024 px; showing the tab
there too makes the gear redundant everywhere.

The concept doc did not plan this change in its section 8 sequence. It is a UI clean-up after
`stable-top-bar`, which moved the play time to Einstellungen for the same reason.

## What Changes

- **BREAKING (spec)**: the DE/EN toggle is removed from the top bar. Language is chosen only in the
  Einstellungen tab's existing language section. The first-visit language detection is unchanged.
- The gear button that opens Einstellungen is removed from the top bar.
- The tab strip shows Einstellungen at every width: in the tab row on tablets and as a sixth entry
  in the bottom bar on phones.
- The top bar is left with the game's name and the stat slots, which get the freed space.

## Non-goals

- Any change to the Einstellungen tab's content or order (the `theme-choice` change adds its theme
  section separately).
- A shorter label or a different icon for Einstellungen; the existing tab art and label are used.
- Moving the news ticker or other top-bar parts.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `game-screen`: the Top bar requirement drops the DE/EN toggle and the settings button; the Small
  screens requirement keeps Einstellungen in the tab strip at every width.
- `localization`: the Language toggle requirement moves the toggle from the header to the
  Einstellungen tab.

## Impact

- `src/ui/TopBar.svelte`: the `tools` block, its imports and styles are removed.
- `src/ui/TabNav.svelte`: the rules that hide `.settings` below 1024 px are removed.
- `src/i18n/en.json`, `de.json`: `language.toggle.label` is removed if nothing else uses it.
- No change to `src/game/`, saves or game rules.
