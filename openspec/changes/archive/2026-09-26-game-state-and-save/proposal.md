# Proposal

## Why

Idle games live on persistence: progress must survive reloads, closed tabs and browser restarts,
or nothing built later (fields, animals, prestige) matters. Every later mechanic adds fields to
the game state, so the save format, its versioning and its migration path have to exist before
the first mechanic does. This is row 3, `game-state-and-save`, in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md` (concept section 7.4).

## What Changes

- **Autosave:** the game saves automatically every 30 seconds and when the page is hidden or
  closed, and loads the latest save when opened.
- **Two save slots:** autosaves alternate between two slots. If the newest save is unreadable,
  the game loads the other one and tells the player. It never silently starts over when a save
  exists.
- **Versioned save format:** every save records its format version and when it was written.
  Older saves are upgraded step by step on load. Saves from a newer game version are refused
  without being overwritten.
- **Export / import:** players can copy their save as a text string and paste one in to restore
  it, e.g. to move between devices. Importing asks for confirmation before replacing the current
  progress.
- **Play time becomes total play time:** it continues across reloads instead of restarting at
  0:00:00 on every visit.
- **Graceful storage failures:** if the browser blocks storage or is out of space, the game keeps
  running and shows a notice that progress can't be saved.

## Capabilities

### New Capabilities

- `save-system`: autosave, slots and backup recovery, save format versioning and migration,
  export/import, and behavior when storage is unavailable.

### Modified Capabilities

- `game-loop`: the play-time counter shows total play time restored from the save, instead of the
  time since the page loaded.

## Non-goals

- Offline progress (crediting time while the game was closed) and the "while you were away"
  summary: `offline-progress` (11). The save already records when it was written, so that change
  can build on it.
- A settings screen, manual "save now" and "reset game" buttons, and moving the language choice
  into the save: `settings-and-debug` (12). The language stays in its own `vegle.language` key.
- Cloud saves or accounts: out of scope for v1 (concept section 1).
- Any game mechanic: `production-chain` (4) onwards. The state still only holds play time.

## Impact

- New: save codec and migrations (`src/game/save.ts`), slot storage (`src/save/`), autosave
  wiring, a small save panel in the UI (export, import, notices), and new translation keys.
- Changed: `src/game/state.ts` doc comment (total play time), `src/ui/game.svelte.ts` (state is
  loaded instead of always created fresh), `src/main.ts` (starts autosave).
- Browser storage: new keys `vegle.save.0`, `vegle.save.1`, `vegle.save.latest` (which slot is newest)
  and, only after a failed load, `vegle.save.unreadable`. The privacy policy already
  mentions "Spielstand" in browser storage, so it stays accurate.
