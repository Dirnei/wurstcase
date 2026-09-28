# Tasks

## 1. Storeroom rules

- [x] 1.1 Write Vitest tests for `src/game/systems/storeroom.ts`: room at levels 1 and 4 (500,
  4,000), price at levels 1 and 3 (€100, €900), `roomFor` never negative with stock above the
  room, `expandStoreroom` with €150 (level 2, €50 left) and with €99 (nothing changes). Verify they
  fail.
- [x] 1.2 Add `src/game/content/storeroom.ts`, `storeroom: 1` and the not-saved `full` and
  `blocked` fields to `GameState` / `createInitialState`, and implement `systems/storeroom.ts`.
  Verify the tests from 1.1 pass and the type check passes.

## 2. Production and manual actions

- [x] 2.1 Add tests to `production.test.ts` for the new Stalls scenarios: output full keeps the
  input, a 2-per-run press waits at 499 of 500, 3 soybean fields stop at 500 after 1,000 s, the
  full mark appears at the room and clears 3 s after the last wait once stock is below it, and
  stock above the room is kept. Verify they fail.
- [x] 2.2 Limit runs by output room in `produce()`, record `blocked`, and add the `full` hold next
  to `updateShortage()`. Verify the tests from 2.1 and all existing production and trend tests
  pass.
- [x] 2.3 Add tests to `manual.test.ts` for a full output (unavailable, no change) and a 2-unit
  click with room for 1. Limit `manualUnits` by room. Verify they pass.

## 3. Save

- [x] 3.1 Add tests to `save.test.ts`: level 5 round-trips, a format-9 save loads at level 1 with
  its stock unchanged (including stock above 500), a non-integer or 0 level is invalid, and New
  game resets to level 1. Verify they fail.
- [x] 3.2 Bump `CURRENT_FORMAT` to 10, add the 9 → 10 migration, and read/validate/write
  `storeroom`. Verify the tests from 3.1 and all existing save tests pass.

## 4. Balancing

- [x] 4.1 Before changing the player, run the default and MegaMeat 60-minute simulations on the
  balancing page and note total earned, final customers and the pacing table.
- [x] 4.2 Add the storeroom expansion rule and the `'storeroom'` purchase kind to
  `balance/player.ts`, with a `simulate.test.ts` case that a default run logs at least one
  expansion. Verify the balance tests pass and runs stay deterministic.
- [x] 4.3 Re-run both simulations, compare with 4.1, and tune `baseRoom`, `roomGrowth`,
  `basePrice` and `priceGrowth` until the pacing milestones stay in their windows and the MegaMeat
  run still ends with at most half the customers. Write the final values into the storeroom spec's
  Room and Expanding requirements and scenarios.

## 5. Rail and art

- [x] 5.1 Draw the storeroom illustration in `src/ui/art/stats/`, register it in `STAT_ART` as
  `storeroom`, and check it on the dev page's art sheet in day and dusk.
- [x] 5.2 Add the storeroom and full-mark keys to `en.json` and `de.json` and reword
  `rail.overstock`. Verify the i18n key-parity test passes.
- [x] 5.3 In `ResourceRail.svelte`, replace the "Stock" heading with the storeroom block (art,
  level, room, Expand button with price) and add the full badge with tooltip and hidden text to
  full rows. Verify in the browser that a new game shows level 1, 500 per good and Expand €100,
  that expanding updates level and room, and that a full good shows the badge.

## 6. Verification

- [x] 6.1 Run the tests, the type check and the production build and check they pass.
- [x] 6.2 Play-check in the browser: let soybeans fill to 500 and check the fields stop, the tofu
  presses keep working and the full badge shows; sell to the biogas plant and check production
  resumes; expand twice; reload and check the level is kept; check the rail at 1280 × 720 (Sell
  button visible), 900 px (compact badge) and 375 × 667 (storeroom in the stock drawer).
