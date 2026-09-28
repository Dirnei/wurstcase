# Tasks

The first implementation generated one milestone upgrade per building. Tasks marked done below
still hold for chain milestones; the rest rework the per-building code.

## 1. Remove the automatic milestones (done in the first implementation)

- [x] 1.1 Delete `src/game/systems/ownedMilestones.ts` and its test; switch `production.ts` and `balance/player.ts` to `rateFactor`; drop `milestoneFactor` from `steady.ts`. Verified by `npm run check` and the production and steady tests.
- [x] 1.2 In `BuildingCard.svelte`, remove `nextMilestone`, the `.milestone` span and its style, and use `rateFactor` for the rate; remove `building.nextMilestone` from both i18n files. Verified by `npm run check` and the i18n key test.

## 2. Chain milestone upgrades in content (tests first)

- [x] 2.1 Rewrite the tests: in `upgrades.test.ts`, the "milestone upgrades" block becomes chain milestones (25 of each soy building puts `soyChain25` on offer for €14,000; 60/60/24 offers nothing; 50 of each offers `soyChain25` and `soyChain50`; owning `soyChain25` gives `rateFactor` 2 for all three soy buildings and 1 for the oat field) and the complete list is 26. In `content.test.ts`, 9 chain milestones, prices with at most two significant digits and rising per chain, and 26 upgrades. In `production.test.ts` and `steady.test.ts`, replace `soybeanField25`-style ids with `soyChain25`. Verify these tests fail.
- [x] 2.2 Replace `MilestoneUpgradeId` and `MILESTONE_UPGRADES` in `upgrades.ts` with `ChainMilestoneId` and `CHAIN_MILESTONES` per design.md (all-buildings `when`, whole-chain `rate` effect, summed price). Verify that the tests from 2.1 pass except the i18n key test.
- [x] 2.3 Remove the 54 per-building names and lines from `de.json` and `en.json` and add the 9 chain milestone names and lines from design.md. Verify that the content i18n test passes and no `upgrade.<building><count>` key is left.

## 3. Dev charts (tests first)

- [x] 3.1 In `curves.test.ts`: `costCurve` income at 25 soybean fields is 25 and the spent step at 25 has no upgrade price; every soybean field pays back more slowly than the one before; chain set prices include the chain milestone a set completes (the soy set that brings the soy chain to 25 of each costs at least €14,000 more than the set before); the crossover test compares the 1st and 24th sets. Verify that they fail.
- [x] 3.2 In `curves.ts`, drop milestones from `costCurve` and `paybackCurves`, and make `chainSetPayback` add the chain milestone upgrades a set completes (price and doubling) per design.md. Verify with `npx vitest run src/game/balance`.

## 4. Save migration (tests first)

- [x] 4.1 Rewrite the format-7 tests in `save.test.ts`: 60 soybean fields, 55 tofu presses, 30 Tofu-Wurst kitchens and `betterSeeds` load with `betterSeeds` and `soyChain25` owned, and `soyChain50` is offered only once the kitchens reach 50; 60 soybean fields alone get no milestone upgrade. Verify they fail.
- [x] 4.2 Change the 7 → 8 migration in `save.ts` to grant chain milestones whose chain's buildings all reached the count. Verify that `npx vitest run src/game/save.test.ts src/save` passes.

## 5. Tuning and docs

- [x] 5.1 Run the 60-minute simulation and list, for each chain milestone, when it came on offer, its demand-aware gain (the simulation's upgrade offers) and when it was bought, next to the pacing table. Adjust `MILESTONE_PRICE_MULTIPLE` until every pacing milestone is in its window. Record the tuned multiple, the offer and purchase times and the 60-minute income and customers in design.md, and update the prices in the upgrades delta spec if the multiple changed. Verify that `simulate.test.ts` and `milestones.test.ts` pass.
- [x] 5.2 In section 3.2 of the concept doc, replace the milestone line with chain milestone upgrades (every building of a chain at 25, 50 and 100; the whole chain ×2). Verify by reading the section.

## 6. Verification

- [x] 6.1 Run `npm test`, `npm run check` and `npm run build`; all pass.
- [x] 6.2 Play-check in the browser (the running web container or `npm run dev`): building cards show no milestone text; with the dev tools, owning 25 of each soy building puts "Bio-Siegel" in the Upgrades tab with its line, the effect naming all three soy buildings ×2 and its price; buying it doubles each soy card's output per second. Check in German and English.
