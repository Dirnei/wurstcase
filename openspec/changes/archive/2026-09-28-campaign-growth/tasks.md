# Tasks

## 0. Before starting

- [x] 0.1 Check that the `storeroom` change is archived and the tree is clean, then run the default
  and MegaMeat 60-minute simulations on the balancing page and note final customers, total earned
  and the pacing table as the baseline.

## 1. Campaign scaling

- [x] 1.1 Write tests in `aktionen.test.ts` for the new scenarios: second-run cost 115 and reach 22
  from 10 customers, eighth run 267 / 53, the fact check staying at 300 after 5 runs, the flyers
  offered at €100 earned, the study halving reach (10 → 19 customers), the local newspaper (10 → 39)
  and Instagram under billboards after 3 runs (229). Verify they fail.
- [x] 1.2 Add `growth` to `AktionDef` and the content entries, set the flyers' `unlockAt` to €100,
  rename `EventFactors.conversion` to `reach` (study `0.5`) and `conversionFactor` to `reachFactor`,
  and apply growth and reach in `aktionCost`, `aktionEstimate` and `runAktion`. Verify the tests
  from 1.1 and the existing Aktionen, villain and upgrade tests pass (update expectations that
  assumed the old study or unlock values).

## 2. Remove passive conversion

- [x] 2.1 Rewrite the conversion tests in `awareness.test.ts` into the "No customers without
  campaigns" and "Empty Lebenshof" scenarios, and update `tick.test.ts` expectations that relied on
  conversion. Verify they fail.
- [x] 2.2 Remove `conversionRate`, `convert`, `CONVERSION_PER_AWARENESS`, the `convert` call in
  `tick()` and `conversionProgress` from `GameState`. Verify the tests from 2.1 pass and a search
  finds no remaining use.

## 3. Save

- [x] 3.1 Add tests to `save.test.ts`: a format-10 save with `conversionProgress` loads at format 11
  without it, with customers, pool and run counts unchanged. Verify they fail.
- [x] 3.2 Bump `CURRENT_FORMAT` to 11, add the 10 → 11 migration, and stop reading and writing
  `conversionProgress`. Verify all save tests pass.

## 4. Text

- [x] 4.1 Update `upgrade.effect.conversion` and `event.study.effect` in `en.json` and `de.json`.
  Verify the i18n key-parity test passes and the Upgrades and Aktionen tabs show the new texts.

## 5. Balancing

- [x] 5.1 Teach the scripted player to run the campaign with the most customers per awareness
  point whenever one is ready and affordable, log runs as `aktion` entries, and score rescues via
  that ratio. Show `aktion` entries in the dev page's purchase log with the awareness art. Add a
  `simulate.test.ts` case that a default run logs the first flyer run and ends above 10 customers.
  Verify the balance tests pass and runs stay deterministic.
- [x] 5.2 Re-run both simulations, compare with 0.1, and tune growth, base costs, base customers
  and cooldowns until the pacing milestones are in their windows, the default run heads towards
  about 80% of the town by 35–60 minutes, and the MegaMeat run still ends with at most half the
  default run's customers. Write the final values into the aktionen spec delta.

## 6. Documentation

- [x] 6.1 Update section 3.5 of `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`:
  no passive conversion, campaigns scale per run, idle growth planned for a later change.
- [x] 6.2 When archiving, update the Purpose sentences of `openspec/specs/awareness/spec.md` and
  `openspec/specs/aktionen/spec.md`, which still mention passive conversion.

## 7. Verification

- [x] 7.1 Run the tests, the type check and the production build and check they pass.
- [x] 7.2 Play-check in the browser: rescue a chicken, see the Aktionen tab unlock at €100, run
  the flyers several times and watch cost and reach grow run by run; leave the game alone and check
  customers stay put; trigger the study with the dev tools and check a flyer wins half; reload an
  older save and check customers, pool and flyer cost are as before the reload.
