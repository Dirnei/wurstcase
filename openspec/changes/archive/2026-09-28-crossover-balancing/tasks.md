# Tasks

## 1. Price growth per entry (tests first)

- [x] 1.1 In `src/game/systems/buildings.test.ts`, change the cost-scaling tests to the soybean field's 1.13 (€13 with 2 owned, €188 with 24 owned) and add the wheat field at 1.09 (€654 with 1 owned). In `rescue.test.ts`, expect the third chicken at €79, the second cow at €4,480, the second stable at €34 and the second pasture at €2,180. Verify these tests fail against the current constants.
- [x] 1.2 Add `priceGrowth` to `BuildingDef`, `ShelterDef` and `SpeciesDef` and fill it in `crops.ts`, `processors.ts`, `products.ts`, `shelters.ts` and `animals.ts` per design.md. Remove `PRICE_GROWTH` and `PRICE_GROWTH_ANIMALS`; make `buildingPrice`, `shelterPrice` and `animalPrice` use the entry's value. Verify that the tests from 1.1 pass and `npm run check` finds no remaining use of the removed constants.
- [x] 1.3 Add a content test in `content.test.ts` that every chain's growth is lower than the chain before it (soy > oat > wheat) and every species' growth is lower than the previous species'. Verify that it passes.

## 2. Chain order, base prices and unlocks (tests first)

- [x] 2.1 Update the unlock tests (`buildings.test.ts`, `manual.test.ts` and any others that use the €200 / €1.5K / €5K thresholds) to the new order: oat chain at €1,000, wheat field and seitan kitchen at €8,000, Leverkas oven at €15,000; a new game shows the oat chain's three locked cards. Verify these tests fail first.
- [x] 2.2 Reorder `CHAINS` to `['soy', 'oat', 'wheat']` and the entries in `crops.ts`, `processors.ts` and `products.ts` to match; set the base prices and unlocks from the production-chain delta spec. Verify that the unlock tests pass, and that the existing test that every building comes after its input's producer still passes.
- [x] 2.3 Update the upgrade prices in `upgrades.ts` (kneading machine €12,000, secret recipe €20,000, steam oven €40,000, barista course €4,000, new millstones €6,000) and any upgrade tests that assert them. Verify with `npx vitest run src/game/systems/upgrades.test.ts src/game/content`.

## 3. Milestone multipliers (tests first)

- [x] 3.1 Write `src/game/systems/ownedMilestones.test.ts`: `milestoneFactor` is 1 at 9, 2 at 10, 4 at 25, 8 at 50 and 8 at 80; `nextMilestone` is ×2 at 10 for 9 owned, ×4 at 25 for 10 owned and null for 50 owned; `outputFactor` is 4 for 10 soybean fields with "better seeds". Add production tests: 9 fields make 9 soybeans in 1 s, 10 make 20, 25 make 100. Verify they fail.
- [x] 3.2 Add `OWNED_MILESTONES` and `MILESTONE_FACTOR` to `content/buildings.ts`, implement `ownedMilestones.ts`, and use `outputFactor` in `production.ts`. Verify the tests from 3.1 pass.
- [x] 3.3 Use `milestoneFactor × rateFactor` in `balance/steady.ts` and add a steady test (10 soybean fields → 20 soybeans per second). Verify it passes.
- [x] 3.4 Show the next milestone on `BuildingCard.svelte` with the new `building.nextMilestone` key in `en.json` and `de.json`, and use `outputFactor` for the shown rate. Verify with the i18n dictionary test and `npm run check`.

## 4. Bulk buyers (tests first)

- [x] 4.1 Update `bulkSales.test.ts` to the new lots (37 soybeans to MegaMeat sell 35 for €14; 4 soybeans cannot be sold; €995 earned plus €6 unlocks the oat chain). Add a content test that checks every rule of the "Bulk buyers" requirement for every lot: the share ranges per step and buyer, biogas below MegaMeat, intermediates above their raw ingredients, products at least their intermediates. Verify both fail.
- [x] 4.2 Set the lots in `buyers.ts` from design.md and update its doc comment. Verify the tests from 4.1 pass.

- [x] 4.3 Add `bulkSell` tests for the "Price of feeding MegaMeat" scenarios (€250 costs 3 customers and 25 awareness; €14 costs 1 and 2; floors at 10 customers and 0 awareness; biogas costs nothing) and for a `bulkSaleCost` preview. Verify they fail, then add `feedCost` to MegaMeat in `buyers.ts` and apply it in `bulkSales.ts`. Verify they pass.
- [x] 4.4 Show the cost on MegaMeat's sell buttons in `BulkBuyersPanel.svelte` with a new `bulk.cost` key in `en.json` and `de.json`. Verify with the i18n dictionary test and `npm run check`.

## 5. Steady model and scripted player (tests first)

- [x] 5.1 Add steady tests: 3 soybean fields with nothing else earn €1.20 per second from MegaMeat; Tofu-Wurst beyond the customers' orders earns €1.50 each from the biogas plant. Verify they fail, then add the bulk term to `steadyIncome` and verify they pass.
- [x] 5.2 Add a simulation test that a run where production exceeds demand records bulk sales (total earned grows by more than the customer sales) and stays deterministic. Verify it fails, then add `sellSurplus` to `player.ts` (every 10 s, keep 30 s of use or orders, sell the rest to the best-paying buyer through `bulkSell`) and verify it passes.
- [x] 5.4 Make the steady model and `sellSurplus` use only buyers without a feed cost; update the steady tests (3 soybean fields alone earn €0.90/s from the biogas plant). Verify with `npx vitest run src/game/balance`.
- [x] 5.5 Score rescues by future customers in `chooseTarget` (design.md). Verify that the "rescues animals" simulation test passes again and that a new test, a 60-minute run ending with more than 10 customers, passes.
- [x] 5.3 Update `balance/milestones.ts` to oat field 10–20 min, wheat field 20–35 min, Leverkas oven 20–35 min and its test. Verify with `npx vitest run src/game/balance`.

## 6. Dev page

- [x] 6.1 Include `milestoneFactor` in `costCurve` and `paybackCurves`, and add tests: 9 fields earn €9/s and 10 earn €20/s; the 10th field pays back faster than the 9th. Verify they pass.
- [x] 6.2 Add `chainSetPayback` to `curves.ts` with a test that the first soy set costs €175, earns €3/s and pays back in about 58 s. Verify it passes.
- [x] 6.3 In `DevPage.svelte`, add the chain set payback chart, replace the growth line in the header with a table of each building's, shelter's and species' price growth, and add "(lines differ only by price)" to the demand chart title. Verify on the dev page in the browser that the new chart renders with three lines.

## 7. Tuning

- [x] 7.1 Run the default 60-minute simulation on the dev page. Adjust base prices, unlocks, milestone thresholds and lot prices (content only) until: every pacing row is in its window; the chain set payback chart shows soy crossing oat and oat crossing wheat; the purchase log shows soy buying slow down after the crossing instead of running in lockstep. Record the final 60-minute income, customers and pacing times in this task's notes.
- [x] 7.2 Copy the tuned numbers into the delta specs (production-chain table and scenarios, bulk lots, upgrade prices, dev-tools scenarios) and the tests. Verify with `openspec validate crossover-balancing --strict` and `npm test`.

## 8. Docs

- [x] 8.1 In `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`, update section 5 (10–20 min: oat chain and Hafer-Cappuccino; 20–35 min: wheat chain and ⭐ Leverkas) and the cost-scaling line in section 3.2 (growth per tier, milestone multipliers). Verify by reading both sections: they match the specs.

## 9. Verification

- [x] 9.1 Run `npm test`, `npm run check` and `npm run build`. Rebuild the container with `docker compose up --build -d` and leave it running. Then play-check the game:
  - A new game shows the soy chain and the oat chain locked at "€30K earned".
  - The soybean field costs €10, then €12, then €13; the card shows "×2 at 25".
  - Selling 37 soybeans to MegaMeat sells 35 for €14, and the button shows the customer and awareness cost first.
  - An existing save loads with its buildings, new prices and the multipliers applied.
