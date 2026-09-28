# Tasks

## 1. Saving the new game into both slots (tests first)

- [x] 1.1 In `src/save/slots.test.ts`, add a test: after an old save, two writes of a new save leave both slots holding the new save, and when the newest slot is damaged, `load()` restores the new save from the backup slot. Verify it passes against the current slot logic (it documents the behaviour `startNewGame` relies on).

## 2. Badges (tests first)

- [x] 2.1 Move the seeding of the seen availability into a pure helper in `src/ui/badges.ts` if needed and add a test in `badges.test.ts`: seen availability taken from a new game makes the Lebenshof count as new once €100 is earned. Verify it fails first if the helper is new, then passes.
- [x] 2.2 Add `resetSeen()` to `src/ui/badges.svelte.ts` and have `replaceState` in `game.svelte.ts` call it through a registered hook, without a circular module import. Verify with `npm run check`.

## 3. New game

- [x] 3.1 Add `startNewGame()` to `src/ui/game.svelte.ts`: `replaceState(createInitialState())`, then `saveNow()` once more. Verify with `npm run check`.
- [x] 3.2 Add the "New game" button, confirmation and done message to `src/ui/SavePanel.svelte` with the keys `save.newGame`, `save.newGameConfirm` and `save.newGameDone` in `en.json` and `de.json` (texts in design.md). Verify with the i18n dictionary test and `npm run check`.

## 4. Verification

- [x] 4.1 Run `npm test`, `npm run check` and `npm run build`. Rebuild the container with `docker compose up --build -d` and leave it running. Then play-check the game:
  - With progress and a few animals, "New game" → cancel leaves everything as it was.
  - "New game" → confirm shows €0, no buildings, no animals, 10 customers, 0:00:00 and the done message.
  - A reload right after still shows the new game.
  - Earning €100 again badges the Lebenshof tab.
  - The language setting is unchanged.
