# Tasks

## 0. Before starting

- [x] 0.1 Check that `campaign-growth` is archived and the tree is clean.

## 1. Unlock rule

- [x] 1.1 Write tests in `aktionen.test.ts`: the tab stays locked at €500 earned and 49 awareness,
  unlocks when the pool reaches 50 during a tick, stays unlocked after a MegaMeat bulk sale drops
  the pool to 20, the flyers are offered from the unlock, and the open farm day is not offered at
  €6,000 without the unlock. Verify they fail.
- [x] 1.2 Add `AKTIONEN_UNLOCK_AWARENESS`, the `aktionen.unlocked` flag in `GameState`,
  `unlockAktionen()` called in `tick()` after `gatherAwareness`, and use the flag in
  `isAktionOffered` / `isAktionenUnlocked`; set the flyer's `unlockAt` to 0 and remove
  `firstAktionAt`. Verify the tests from 1.1 and all existing Aktionen, villain and tick tests pass.

## 2. Save

- [x] 2.1 Add tests to `save.test.ts`: the flag round-trips; a format-11 save with €2,000 earned and
  pool 0 loads unlocked; one with €50 earned, pool 10 and no runs loads locked; a non-boolean flag
  is invalid. Verify they fail.
- [x] 2.2 Bump `CURRENT_FORMAT` to 12, add the 11 → 12 migration and read/validate/write the flag.
  Verify all save tests pass.

## 3. Hint

- [x] 3.1 Replace `tabUnlockAt` with `tabUnlockHint` in `tabs.ts` (update `tabs.test.ts`), add
  `locked.atAwareness` to `en.json` and `de.json`, and pick the hint text by kind in `TabNav.svelte`.
  Verify the i18n key-parity test passes and a new game shows "ab 50 Aufmerksamkeit" on the locked
  Aktionen tab in German.

## 4. Verification

- [x] 4.1 Run the tests, the type check and the production build and check they pass.
- [x] 4.2 Play-check in the browser: in a new game, earn €100, rescue a chicken, and watch the
  Aktionen tab unlock when the pool reaches 50; sell to MegaMeat until the pool drops and check the
  tab stays open; reload and check it is still unlocked; check the Balancing page's default
  simulation still runs campaigns and reaches its customer target.
