# Tasks

## 1. Content and state

- [x] 1.1 Add `src/game/content/animals.ts` (chicken, pig, cow, price growth 1.2, `NAME_POOL_SIZE` 12) and `src/game/content/shelters.ts` (stable, pasture, `LEBENSHOF_UNLOCK_AT`) with the spec's values, and add `POPULATION` and `CONVERSION_PER_AWARENESS` to `town.ts`. Extend the content test: ids are unique, prices, unlocks, space and awareness are positive, species are ordered by price, and the Lebenshof unlocks no later than the cheapest species and shelter. Verify `npm test` passes
- [x] 1.2 Add `residents` (empty), `shelters` (all 0) and `conversionProgress` (0) to `GameState` and to the new-game test; verify `npm run check` and `npm test` pass

## 2. Rescue and shelters (tests first)

- [x] 2.1 Write `src/game/systems/rescue.test.ts`: Lebenshof hidden at €99 earned, shown at €100 and still shown after spending; only chickens at €1,000 earned, all three at €5,000; the third chicken costs €72 and the first pig still €600 after 5 chickens; a stable at €40 leaves €10 and 4 space, and the second stable costs €33; the first chicken with €60 and one stable leaves €10 with 1/4 space; a pig with 1 chicken in one stable returns `'space'`; with too little money returns `'money'`; rescues and shelters leave `totalEarned` unchanged. Verify the tests fail
- [x] 2.2 Implement the unlock, price, space, shelter and rescue functions in `src/game/systems/rescue.ts`; verify the tests pass
- [x] 2.3 Add name tests with an injected `random`: 12 chickens get 12 different indices, the 13th repeats one, and `displayNames` shows it as "<name> 2"; round 3 starts only after every index is used twice; each species has its own pool. Verify they fail, then implement `pickName` and `displayNames` and verify they pass

## 3. Awareness and conversion (tests first)

- [x] 3.1 Write `src/game/systems/awareness.test.ts`: 3 chickens, 2 pigs and 1 cow give 33/s; an empty Lebenshof converts no one; 10,000 customers at 100/s for 10 s → 10,010; 15,000 → 15,005; 10 customers at 1/s for 10 s → 10, and for 6 × 10 s → 11; a 60 s tick vs 600 × 0.1 s end within one customer; 19,995 at 1,000,000/s for 60 s → 20,000 exactly. Verify the tests fail
- [x] 3.2 Implement `src/game/systems/awareness.ts` and call `convert` in `tick()` between `produce` and `takeOrders`; extend `tick.test.ts` so that 40 customers build orders four times as fast as 10, and 12 hours of ticks leave 5 residents unchanged. Verify all tests pass

## 4. Save format 5 (tests first)

- [x] 4.1 Extend `src/game/save.test.ts`: residents, shelters and conversion progress round-trip; a format 4 save with 3 presses and 40 customers migrates with no residents and no shelters and keeps both; rejects a resident with a fractional, negative or out-of-pool name index; skips residents of an unknown species; ignores unknown shelter keys; rejects negative or fractional shelter counts. Verify the new tests fail
- [x] 4.2 Bump `CURRENT_FORMAT` to 5, add migration 4 → 5, and read and write the three fields; verify all save and slot tests pass

## 5. UI and text

- [x] 5.1 Add the DE and EN keys from the design, including the 12-name pools per species, and change `sales.customers` to show the population. Add a content test that both dictionaries have `animal.<species>.name.0..11` for every species. Verify the dictionary and content tests pass
- [x] 5.2 Build `LebenshofPanel.svelte` (space and awareness line, shelter buttons, rescue buttons with the lacking reason, MegaMeat line, resident groups with count and numbered names), add it to `App.svelte` after the chain panels, and show customers of the population in `SalesPanel.svelte`; verify `npm run check` passes

## 6. Verification

- [x] 6.1 Run `npm test`, `npm run check` and `npm run build`, rebuild the container (`docker compose up --build -d`, leave it running), then play-check against it in both languages:
  - the Lebenshof appears at €100 earned
  - a stable and then a chicken can be bought, and the chicken gets a name
  - the rescue button shows lacking space or money
  - customers rise from 10 and the sales panel shows "of 20K" ("von 20 Tsd.")
  - pigs appear at €1,500 earned and cows at €5,000
  - switching the language shows the other pool's names
  - reloading keeps the residents and shelters
  - a format 4 save exported before this change imports with an empty Lebenshof
