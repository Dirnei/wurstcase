# Tasks

## 1. Trend system (tests first)

- [x] 1.1 Add the non-saved `trend` field to `GameState` (empty in `createInitialState`) and write `src/game/systems/trend.test.ts`: no buckets → every resource steady; +3 soybeans over 10 s → rising; −3 tofu → falling; ±1 → steady; a resource in `state.shortage` with +5 → steady; one 10 s record equals 100 records of 0.1 s; changes older than 10 s drop out (rising, then 10 s of no change → steady); one 60 s record of +60 counts as +10 in the window; never more than 11 buckets after 1000 small records. Verify the tests fail
- [x] 1.2 Implement `recordTrend` and `stockTrend` in `src/game/systems/trend.ts` with `TREND_WINDOW_SECONDS = 10` and `TREND_STEADY_UNITS = 1`; verify the trend tests pass

## 2. Wiring into tick and save (tests first)

- [x] 2.1 Extend `src/game/tick.test.ts`: 1 soybean field for 10 s → soybeans rising; 100 tofu with 2 Tofu-Wurst kitchens and no press for 10 s → tofu falling, Tofu-Wurst rising; a manual harvest and a bulk sale between ticks do not change the trend; a new game shows all steady. Extend `src/game/save.test.ts`: `trend` is not written and is empty after decoding. Verify the new tests fail
- [x] 2.2 In `src/game/tick.ts`, copy the stock before the systems run and call `recordTrend` after them; verify all tests pass with `npm test`

## 3. Stock panel

- [x] 3.1 Add `stock.trend.rising` / `.falling` / `.steady` to `src/i18n/en.json` ("rising", "falling", "steady") and `src/i18n/de.json` ("steigend", "fallend", "gleichbleibend"); verify the dictionaries test (same keys in DE and EN) passes
- [x] 3.2 In `src/ui/StockPanel.svelte`, show ▲ / ▼ / ▬ after each amount with the design's colours, a `title` tooltip and the label in the visually hidden span; give the list a fixed third column so amounts stay aligned; verify `npm run check` passes

## 4. Verification

- [x] 4.1 Run `npm test` and `npm run build` and confirm both succeed
- [x] 4.2 Play-check in the browser (dev server or the running container): a new game shows all steady; after buying a soybean field soybeans turn rising within a few seconds; with a tofu press added and soybeans short they show steady without flicker; manual harvesting and a MegaMeat bulk sale do not flip the arrow; tooltips read correctly in DE and EN; the layout stays aligned in light and dark mode and at phone width
