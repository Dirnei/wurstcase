# Tasks

## 1. Rolling window (tests first)

- [x] 1.1 Write `src/game/systems/rollingWindow.test.ts`: empty window sums 0; `add` without a bucket creates one; 1 unit added every second for 60 s sums 60; values older than the window drop out; one 120 s bucket with 120 units counts 60 in a 60 s window; 600 advances of 0.1 s equal one advance of 60 s; never more than window + 1 buckets after 10 000 small advances. Verify the tests fail
- [x] 1.2 Implement `src/game/systems/rollingWindow.ts`; verify the tests pass

## 2. Sales figures (tests first)

- [x] 2.1 Add the non-saved `sales` field to `GameState` (empty in `createInitialState`) and write `src/game/systems/salesStats.test.ts`: 10 customers → demand 30/min; 15 Leverkas sold over 60 s → 15/min and €375/min; a hand sale of 3 Tofu-Wurst → 3/min and €9/min, back to 0 after 60 s without sales; a bulk sale changes nothing; a new state shows 0 for every product. Verify the tests fail
- [x] 2.2 Implement `src/game/systems/salesStats.ts` (`demandPerMinute`, `soldPerMinute`, `incomePerMinute`), record sold units in `fillOrders` and call `advanceSalesStats` in `tick()`; verify the tests pass
- [x] 2.3 Extend `src/game/tick.test.ts` with the playtest case: 10 customers, assistant hired, 2 Leverkas ovens and 2 café bars fully supplied, Tofu-Wurst in stock, 60 s → Tofu-Wurst 0/min and demand 30/min. Extend `src/game/save.test.ts`: `sales` is not written and is empty after decoding. Verify `npm test` passes

## 3. Sales panel

- [x] 3.1 Add `sales.demand`, `sales.income`, `sales.soldTitle`, `sales.soldPerMinute` and `sales.demandLimit` to `src/i18n/en.json` and `src/i18n/de.json`; verify the dictionaries test (same keys in DE and EN) passes
- [x] 3.2 In `src/ui/SalesPanel.svelte`, show demand and income, one sold line per shown product (highest price first, muted when in stock but 0/min), and the demand-limit hint below the overproduction message; verify `npm run check` passes

## 4. Verification

- [x] 4.1 Run `npm test` and `npm run build` and confirm both succeed
- [x] 4.2 Play-check in the browser (dev server or the running container): a new game shows demand 30/min and 0 sold; hand sales show up and drop out after a minute; with the assistant and more Tofu-Wurst than orders the Tofu-Wurst line shows 0/min and the hint appears with the overproduction message; bulk sales do not change income; texts read correctly in DE and EN; the panel stays tidy in light and dark mode and at phone width
