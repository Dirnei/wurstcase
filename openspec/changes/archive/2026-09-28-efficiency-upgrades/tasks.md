# Tasks

Apply after `milestone-upgrades` is archived.

## 1. Yield effect (tests first)

- [x] 1.1 In `upgrades.test.ts`, add `yieldPerRun` tests: 1 without upgrades, 2 with the hydraulic press for the tofu press and 1 for the oat mill. In `production.test.ts`, add the spec scenarios: 1 press with the hydraulic press makes 10 tofu from 15 soybeans in 10 s; 2 presses with 30 soybeans do 10 runs and make 20 tofu; yield and the soy chain milestone stack (2 tofu per second from 3 soybeans per run); manual pressing with the hydraulic press still makes 1 tofu from 3 soybeans. In `content.test.ts`, yield effects only on buildings with an input and whole positive `add`, and 28 upgrades. Verify these tests fail.
- [x] 1.2 Add the `yield` effect kind and `yieldPerRun`, change the four effects, add `sausageFiller` and `oatFoamNozzle`, and make `produce` add `runs × yield`. Update the doc comments on `rate` and `input.ratio`. Verify that the tests from 1.1 pass except the i18n key test.
- [x] 1.3 Add `upgrade.effect.yield` and the two names and lines to `de.json` and `en.json`. Verify that the content i18n test passes.

## 2. Balance model (tests first)

- [x] 2.1 In `steady.test.ts`, add: 1 soybean field, 1 tofu press with the hydraulic press → the press is input-limited at 1/3 run per second and makes 2/3 tofu per second; with 3 fields it makes 1 tofu per second. Add a `player.ts`-level test (or extend `simulate.test.ts`) that the simulated player buys the hydraulic press. Verify they fail.
- [x] 2.2 Count yield in `steadyOutput` and in `player.ts` (buildings needed per demand). Verify with `npx vitest run src/game/balance`.

## 3. UI

- [x] 3.1 Show yield in `BuildingCard.svelte` (recipe output and output per second) and the yield effect text and art in `UpgradesPanel.svelte`. Verify with `npm run check` and in the browser: the tofu press card reads "3 Sojabohnen → 2 Tofu" after buying the hydraulic press.

## 4. Tuning and docs

- [x] 4.1 Run the 60-minute simulation and list each yield upgrade's offer time, demand-aware gain and purchase time next to the pacing table. Adjust prices or conditions until every pacing milestone is in its window and no yield upgrade is a dead offer (payback over 30 minutes when offered) without a reason. Record the results in design.md and update the spec table if prices changed. Verify that `simulate.test.ts` and `milestones.test.ts` pass.
- [x] 4.2 In the upgrades part of section 3 of the concept doc, describe yield upgrades (more output per run, same input). Verify by reading the section.

## 5. Verification

- [x] 5.1 Run `npm test`, `npm run check` and `npm run build`; all pass.
- [x] 5.2 Play-check in the browser: buy the hydraulic press, the sausage filler and new millstones with the dev tools; each card's recipe and output per second change, the upgrade shows "+1 … per run", and manual pressing is unchanged. Check in German and English.
