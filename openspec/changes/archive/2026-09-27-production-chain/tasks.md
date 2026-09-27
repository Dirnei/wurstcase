# Tasks

## 1. Content and state

- [x] 1.1 Add `src/game/content/` (`resources.ts`, `crops.ts`, `processors.ts`, `products.ts`, `manual.ts`, `buildings.ts`) with the design table's values, plus a content test that checks every building's input and output are known resources, every product has a price, and buildings are in chain order; verify `npm test` passes
- [x] 1.2 Extend `GameState` in `src/game/state.ts` with `money`, `totalEarned`, `stock`, `buildings` and `waiting`, all starting at zero or empty; update the existing state test and verify `npm run check` and `npm test` pass

## 2. Systems (tests first)

- [x] 2.1 Write `src/game/systems/buildings.test.ts`: price = base × 1.15^owned (€10 with 2 owned → €13.225, rounded up in 5.1); buying subtracts money and adds one; unaffordable or locked → `canBuy` false and buying changes nothing; unlock at the `totalEarned` threshold and stays unlocked after spending; verify the tests fail
- [x] 2.2 Implement `src/game/systems/buildings.ts`; verify the building tests pass
- [x] 2.3 Write `src/game/systems/manual.test.ts` (harvest ×3 → 3 soybeans; press 3 → 1 tofu; make wurst; press with 2 soybeans is unavailable and changes nothing), then implement `src/game/systems/manual.ts`; verify the tests pass
- [x] 2.4 Write `src/game/systems/production.test.ts`: 2 fields × 10 s → +20 soybeans; press at full speed with 100 soybeans × 10 s → +5 tofu, −15 soybeans; press with no input → no output and `waiting` names soybeans; partial supply → partial output and waiting; waiting clears when supply returns; stock never negative; same-tick flow from field to press to kitchen; one 60 s tick equals 600 × 0.1 s ticks for a stalled chain (reworked for whole units in 5.2); verify the tests fail
- [x] 2.5 Implement `src/game/systems/production.ts` and call `produce()` from `tick()`; verify production and existing tick tests pass
- [x] 2.6 Write `src/game/systems/sales.test.ts` (4 Tofu-Wurst + 2 Leverkas → +€62 money and earned, stocks 0; nothing in stock → `canSellAll` false), then implement `src/game/systems/sales.ts`; verify the tests pass

## 3. Save format 2 (tests first)

- [x] 3.1 Extend `src/game/save.test.ts`: round trip of money 1.5e320, stock and counts exactly; `waiting` is not written; a format 1 save migrates to format 2 with its play time and a zero economy; rejects negative, NaN or non-numeric amounts and negative or fractional counts; ignores unknown resource and building keys; verify the new tests fail
- [x] 3.2 Bump `CURRENT_FORMAT` to 2, add migration 1 → 2, and read/write the new fields in `src/game/save.ts`; verify all save and slot tests pass

## 4. UI

- [x] 4.1 Add `act()` to `src/ui/game.svelte.ts` (runs an action, bumps `version`); verify `npm run check` passes
- [x] 4.2 Add DE and EN translation keys for resources, buildings, manual actions, sell button, per-second label, price, waiting text (`{building}` waits for `{resource}`), chain titles and the money template; verify the dictionary parity test passes
- [x] 4.3 Build `Money.svelte`, `StockPanel.svelte`, `ManualActions.svelte`, `SellButton.svelte`, `ChainPanel.svelte` and `BuildingRow.svelte`, and lay them out in `App.svelte` with locked buildings and never-produced resources hidden; verify in `npm run dev` that a new game shows only the soy chain, the manual buttons work, and selling adds money

## 5. Whole units (tests first)

- [x] 5.1 Change the price test to €10 with 2 owned → €14 (rounded up), verify it fails, then round prices up with `ceil` in `buildingPrice`; verify the building tests pass
- [x] 5.2 Rewrite `production.test.ts` for whole units: 1 press with plenty of soybeans × 1 s → no tofu, soybeans unchanged, progress 0.5; another 1 s → exactly +1 tofu, −3 soybeans; 2 soybeans with a unit ready → nothing made, 2 soybeans kept, waiting; a press starved for 60 s then given 30 soybeans makes 1 tofu at once, not 10; all stock stays whole after many odd-length ticks; stalled chain 60 s once vs 600 × 0.1 s agrees within ±1 unit per building type; drop the fractional sales test; verify the new tests fail
- [x] 5.3 Add `progress` to `GameState`, implement discrete production in `src/game/systems/production.ts` as in the design; verify all production and tick tests pass
- [x] 5.4 Extend `save.test.ts` (progress round-trips; rejects fractional stock, fractional money and negative or non-finite progress), then save `progress` and validate whole amounts in `src/game/save.ts`; verify all save and slot tests pass
- [x] 5.5 Show a progress bar per building row (full when the type makes more than 10 units per second); verify `npm run check` passes and the bar fills in `npm run dev`

## 6. Shortage instead of waiting text (tests first)

- [x] 6.1 Add `shortage` tests to `production.test.ts` (a waiting press marks its input short; a press alternating between waiting and pressing over 20 s keeps it marked every tick; the mark clears 3 s after the last wait and not earlier; `shortage` is not saved), verify they fail, then implement the hold timer in `produce()` and add `shortage` to `GameState`; verify all tests pass
- [x] 6.2 Remove the waiting line from `BuildingRow.svelte` and the `building.waiting` key; colour short stock red in `StockPanel.svelte` with a "short" hint in DE and EN; verify `npm run check` and the dictionary test pass, and that row heights stay fixed and the red does not flicker in the browser

## 7. Verification

- [x] 7.1 Run `npm test`, `npm run check` and `npm run build`, rebuild the container (`docker compose up --build -d`, leave it running), then play-check against it in both languages: bootstrap by hand to the first soybean field; prices rise 15% per purchase; a press without fields turns the soybean stock red, which stays red while one field feeds the press and clears a few seconds after enough fields are bought; the wheat chain appears at €200 earned, Leverkas at €1,500, oats at €5,000; reload keeps money, stock and buildings; a save exported before this change (format 1) imports with its play time and a fresh economy; an export/import round trip keeps everything; stock and money never show a decimal; a slow building's progress bar fills and survives a reload
