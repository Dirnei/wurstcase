# Proposal

## Why

There is no way to start over. Balancing changes such as `crossover-balancing` move prices and
unlocks, and an old save then shows a game that a new player would never see. Today the only
way out is a console snippet, because the game saves again when the page is left. Players will
want the same after trying a strategy, and before a real prestige ("Neustart") exists.

This change is not a row of its own in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It extends the save handling of row
3 (`game-state-and-save`) and belongs to the settings screen of row 12 (`settings-and-debug`). It
is not the story's Neustart, which row 10 (`prestige-and-act-1`) brings with Rezepte.

## What Changes

- The save panel in the Settings tab gets a **"New game"** button next to Export and Import.
- Clicking it asks for confirmation. The question says that all progress, including the
  Lebenshof animals, is deleted, that it cannot be undone, and that Export makes a backup first.
- After confirming, the game starts from a new game state (€0, no buildings, 10 customers, play
  time 0:00:00) and saves at once, into both save slots, so neither the next autosave nor the
  backup slot brings the old game back. A short message confirms the new game.
- Cancelling changes nothing.
- The tab badges forget what was "seen" in the old game, so unlocks badge again as they happen.
  Importing a save does the same.
- The Lebenshof rule "no player action removes an animal" gets an explicit exception for
  starting a new game and importing a save, which replace the whole game.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `save-system`: a new "Start a new game" requirement.
- `lebenshof`: "Animals are never lost" names starting a new game and importing a save as the
  only ways a game's residents go away.

## Non-goals

- The story's Neustart with Rezepte and kept animals; that is `prestige-and-act-1` (10).
- Several save slots or profiles to switch between.
- An undo for the reset. Export is the backup.
- A custom confirmation dialog; the game uses the browser's confirm, as the import does.

## Impact

- `src/ui/SavePanel.svelte`: the button, confirmation and message.
- `src/ui/game.svelte.ts`: `startNewGame()`, which replaces the state and saves it into both slots.
- `src/ui/badges.svelte.ts`: a way to reseed the seen state after the game is replaced.
- `src/i18n/en.json`, `src/i18n/de.json`: three new strings.
- Tests next to these files. No save format change and no game-logic change in `src/game/`.
