# Tasks

## 1. Market value and lots (tests first)

- [x] 1.1 In `src/game/balance/value.test.ts`, add `marketValue` tests: Tofu-Wurst €3, tofu €2.50, soybeans €0.694, seitan €10.42, wheat €4.34. In `content.test.ts`, replace the vegan-value share checks with market-value ones: MegaMeat 85–95%, biogas 62–72%, MegaMeat above biogas, and each processing pair pays for both buyers. Update `bulkSales.test.ts` and `curves.test.ts` (bulk table) to the new lots. Verify these tests fail.
- [x] 1.2 Add `STEP_MARKUP` to `buyers.ts`, `marketValue` to `value.ts`, and set the lots from design.md; update the doc comment in `buyers.ts` and the bulk table in `curves.ts` (market value column, header markup). Verify with `npx vitest run src/game/content src/game/balance src/game/systems/bulkSales.test.ts`.

## 2. Customer income (tests first)

- [x] 2.1 Add `src/game/systems/customerIncome.test.ts`: a steady €10/s over 30 minutes settles at €10/s within 1%; one big tick and many small ticks agree; a bulk sale does not change it; it starts at 0. Add a `sales.test.ts` case that a customer sale records into it. Verify they fail.
- [x] 2.2 Add `customerIncome` to `GameState` and `createInitialState`, `CUSTOMER_INCOME_SECONDS` to `town.ts`, the new system file, the call in `sales.ts` and in `tick`. Verify with `npx vitest run src/game`.

## 3. Feed cost (tests first)

- [x] 3.1 Rewrite the feed cost tests in `bulkSales.test.ts` to the spec scenarios: 1,000 customers at €10/s and a €600 sale cost 100 customers and 60 awareness; €5 costs 1 customer; 12 customers drop to 10; income 0 drops 30 customers to 10; biogas costs nothing; the preview equals what the sale applies. Verify they fail.
- [x] 3.2 Change `FeedCost` to `{ horizonSeconds, eurosPerAwareness }` and `bulkSaleCost` / `bulkSell` per design.md. Check `BulkBuyersPanel.svelte` still shows the cost. Verify with `npx vitest run src/game/systems/bulkSales.test.ts` and `npm run check`.

## 4. Save (tests first)

- [x] 4.1 In `save.test.ts`, add: customer income round-trips exactly; a format-8 save loads with customer income 0; a negative or non-numeric value is rejected. Verify they fail.
- [x] 4.2 Bump `CURRENT_FORMAT` to 9 with the migration, and read and write `customerIncome` in `save.ts`. Verify with `npx vitest run src/game/save.test.ts src/save`.

## 5. Simulation with MegaMeat (tests first)

- [x] 5.1 In `simulate.test.ts`, add: with `surplusBuyer: 'megaMeat'` the run sells to MegaMeat (its units sold grow), resources MegaMeat does not buy still go to the biogas plant, and the run is deterministic. Verify they fail.
- [x] 5.2 Add `surplusBuyer` to `SimulationSettings`, pass it through `player.ts` (`sellSurplus`, scoring) and `steady.ts`, and add the select on `DevPage.svelte`. Verify with `npx vitest run src/game/balance` and on the dev page.

## 6. Tuning and docs

- [x] 6.1 Run the default and the MegaMeat simulations (60 minutes). Tune the horizon until the MegaMeat run ends with at most half the default run's customers, and check that the default run's pacing table is still in its windows with the higher biogas prices; adjust `STEP_MARKUP` or the lots if not. Record the tuned numbers and both runs' 60-minute income and customers in design.md, and update the spec scenarios if numbers changed. Add the "Feeding the industry" check to `simulate.test.ts`. Verify that `simulate.test.ts` and `milestones.test.ts` pass.
- [x] 6.2 Update the bulk buyer part of section 3 of the concept doc: market value with a markup per step, MegaMeat 90%, biogas 67%, and the feed cost as a share of customer spending. Verify by reading the section.

## 7. Verification

- [x] 7.1 Run `npm test`, `npm run check` and `npm run build`; all pass.
- [x] 7.2 Play-check in the browser: the bulk buyers panel shows the new lots; with customers above 10, a MegaMeat button shows a customer cost that matches the sale; selling drops customers by that amount; the biogas plant costs nothing. Check the dev page's bulk table and the MegaMeat simulation. Check in German and English.
