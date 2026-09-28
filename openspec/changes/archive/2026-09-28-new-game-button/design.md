# Design

## Context

See proposal.md (Why). The relevant code:

- `src/ui/game.svelte.ts` holds the live `GameState` as a plain object and already has
  `replaceState(next)` for imports: it copies `next` into the live object, bumps the UI version
  and calls `saveNow()`.
- `src/save/slots.ts` writes each save into the slot that is not the newest, so the two slots
  always hold the two most recent saves. A single save after a reset would leave the old game in
  the backup slot, and the "Backup slot recovery" requirement would bring it back if the new save
  were ever damaged.
- `src/ui/badges.svelte.ts` keeps a module-level `seen` availability, seeded at start-up. After the
  game is replaced it still describes the old game, so things the old game had unlocked would not
  badge again.
- Autosave runs every 30 s and on `pagehide`/hidden, always from the live state, so once the live
  state is new, later saves are new too.

## Goals / Non-Goals

**Goals:**
- One function starts a new game; the UI only confirms and calls it.
- After a new game, nothing in storage still holds the old progress, except what the player
  exported.

**Non-Goals:**
- No change to `src/game/`: a new game is `createInitialState()`, which already exists.
- No new save format or migration.

## Decisions

### `startNewGame()` in `game.svelte.ts`

```ts
/** Replaces the game with a new one and writes it into both slots, so no old save remains. */
export function startNewGame(): void {
  replaceState(createInitialState())
  saveNow()
}
```

`replaceState` saves once; the second `saveNow()` writes the other slot. Alternative considered:
a `slots.clear()` that removes both keys. Rejected: a crash between clearing and the next write
would leave no save at all, while two writes always leave a readable one. Language is not part of
the game state, so the chosen language stays.

### Reseeding the badges

`badges.svelte.ts` gets `resetSeen()`, which sets every tab's seen availability to what the
current game offers (the same seeding it does at start-up). `replaceState` calls it, so imports
get it too, and `startNewGame` inherits it. `game.svelte.ts` must not import `badges.svelte.ts` at module
level, because `badges.svelte.ts` imports `readGame` from it; the call goes through a small
`onReplace` hook that `badges.svelte.ts` registers.

### The button

`SavePanel.svelte` gets a third button, "New game", after Export and Import, styled like the
others. It uses `confirm(t('save.newGameConfirm'))`, as the import does, and shows
`t('save.newGameDone')` in a `role="status"` line. New strings:

| Key | English | German |
|---|---|---|
| `save.newGame` | New game | Neues Spiel |
| `save.newGameConfirm` | Delete all progress, including your Lebenshof animals, and start a new game? This cannot be undone. Use Export first if you want a backup. | Den ganzen Fortschritt samt deiner Lebenshof-Tiere löschen und neu anfangen? Das lässt sich nicht rückgängig machen. Mit Exportieren sicherst du vorher eine Kopie. |
| `save.newGameDone` | New game started. | Neues Spiel gestartet. |

### Files

- Changed: `src/ui/game.svelte.ts`, `src/ui/badges.svelte.ts`, `src/ui/SavePanel.svelte`,
  `src/i18n/en.json`, `src/i18n/de.json`.
- Tests: `src/save/slots.test.ts` (two writes leave both slots with the new save, and the backup
  slot restores it), `src/ui/badges.test.ts` if the reseed logic moves into the pure
  `badges.ts`.
- No `src/game/` files or content entries change.

## Risks / Trade-offs

- [A player clicks it by accident] → The browser confirm names the loss of the animals and
  points to Export; the button sits in Settings, not on a game tab.
- [The browser confirm looks out of place in the paper UI] → Same as the import today; a styled
  dialog can come later for both.
- [Unsaved UI-only state (floating amounts, sale flashes, the news ticker position) still shows
  old values for a moment] → They follow the live state within a tick; nothing is saved from
  them.
