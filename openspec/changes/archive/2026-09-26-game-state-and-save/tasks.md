# Tasks

## 1. Save codec (tests first)

- [x] 1.1 Write `src/game/save.test.ts`: encode→decode round trip; rejects non-JSON, wrong envelope and invalid `playTime` (negative, NaN, string); synthetic migrations 1→2→3 applied in order; newer format → `too-new`; export string round trip with the `WURSTCASE1:` prefix; invalid export strings rejected; verify the tests fail
- [x] 1.2 Implement `src/game/save.ts` (envelope, `CURRENT_FORMAT = 1`, empty `MIGRATIONS`, field-by-field validation, export/import string) and update the `playTime` comment in `state.ts`; verify the tests pass

## 2. Slots and autosave (tests first)

- [x] 2.1 Write `src/save/slots.test.ts` with an in-memory fake storage: writes alternate slots and move the pointer; load picks the pointer slot; corrupted pointer slot → other slot + `restoredFromBackup`; no pointer → newest valid `savedAt`; both corrupted → new game + `unreadable` + raw data copied once to `vegle.save.unreadable` and kept across later writes; too-new → reported and later writes refused; throwing storage → `storageAvailable = false`, no crash; verify they fail
- [x] 2.2 Implement `src/save/slots.ts`; verify the slot tests pass
- [x] 2.3 Write `src/save/autosave.test.ts` (saves at 30 s intervals via a manual scheduler, saves on page-hide, stop cancels both), then implement `src/save/autosave.ts`; verify the tests pass

## 3. Wiring and UI

- [x] 3.1 Load the state through the slots in `src/ui/game.svelte.ts`, expose `replaceState()` and the load/save notices, and start autosave in `src/main.ts` with the real timer, `visibilitychange` and `pagehide`; verify `npm run check` passes
- [x] 3.2 Add translation keys (save panel, confirm text, import error, four notices) in DE and EN; verify the dictionary parity test passes
- [x] 3.3 Build `SavePanel.svelte` (export with copy, import with confirm and error) and `Notices.svelte`, and add both to `App.svelte`; verify in `npm run dev` that export shows a `WURSTCASE1:` string and importing it back works

## 4. Verification

- [x] 4.1 Run `npm test`, `npm run check` and `npm run build`, rebuild the container (`docker compose up --build -d`, leave it running), then play-check in the browser against it: play time survives a reload; closing the tab shortly after an autosave keeps the latest play time; corrupting the newest slot in DevTools restores the backup with a notice; corrupting both starts fresh with a notice and `vegle.save.unreadable` present; a save with `format: 99` shows the reload notice and stays untouched; blocked storage shows the "cannot save" notice while the game runs and export still works; export in one browser context and import in a fresh one continues the same play time; an invalid import shows the error; cancelling the confirm changes nothing
