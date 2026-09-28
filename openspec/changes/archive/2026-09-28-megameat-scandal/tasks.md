# Tasks

## 0. Before starting

- [x] 0.1 On a clean tree at or after 95239d6, run the default, tempted and fed 60-minute
  simulations and note total earned at 5 / 10 / 60 minutes, customers of the fair and fed runs at
  30 and 60 minutes, the fed run's Leverkas time, units the fed run sold to MegaMeat and to the
  biogas plant, and the pacing table as the baseline.

## 1. Biogas products flood

- [x] 1.1 Write tests in `bulkSales.test.ts` for the flooded biogas products: fresh Leverkas
  market, 100 Leverkas at €17 → €1,152 and 48%; 1,000 soybeans to the biogas plant → lot stays 7
  for €3 and no flood moves; markets separate (soybean dump leaves the biogas Tofu-Wurst market
  fresh); recovery and split ticks for a biogas flood as for MegaMeat's. Verify they fail.
- [x] 1.2 Make the flood per buyer: `flood.resources` on `BuyerDef`, `biogasFlood` in `state.ts`,
  `marketLevel` / `floodedValue` / `timeUntil` / recovery taking the buyer, the biogas lot price
  scaled by its market level, `bulkSell` raising the right map. Verify the tests from 1.1 pass and
  the MegaMeat flood tests still pass unchanged.
- [x] 1.3 Write a save test: a save with a MegaMeat soybean flood of €400 from before this change
  loads with that flood, fresh biogas markets and everything else unchanged; a reload keeps a
  biogas Leverkas flood. Verify it fails, add the migration (+1: `biogasFlood` = {}, and
  `megaMeatScandal` = 0 from task 2.3), verify it passes.
- [x] 1.4 Update `curves.ts` `bulkTable` and its test: biogas products show a cap of about €55/s,
  biogas soybeans none, MegaMeat soybeans €54.6/s as before. Verify the tests pass and the dev
  page's bulk table shows the Leverkas cap.
- [x] 1.5 Biogas product offers show the market meter and recovery time like MegaMeat's, DE and
  EN. Verify in the browser after dumping 100 Leverkas.

## 2. Scandal level

- [x] 2.1 Write tests in `bulkSales.test.ts` for the MegaMeat scandal requirement: a €529 sale
  raises the scandal from 0 to €529 and leaves customers at 1,000; sales add up (€4,000 + €1,091);
  recovery €10,000 → €5,000 in 600 s; split ticks (6,000 × 0.1 s); biogas raises nothing; the
  factor at €10,000 is 0.5 and at €4,000 about 0.714. Verify they fail.
- [x] 2.2 Add `megaMeatScandal` to `state.ts` (0 in a new game), the scandal parameters to
  `feedCost` in `content/buyers.ts` (remove `horizonSeconds`), the raise in `bulkSell`, a
  `scandalFactor(state)` and an `advanceScandal(state, seconds)` decay in `bulkSales.ts` called
  from `tick.ts`. Verify the tests from 2.1 pass.
- [x] 2.3 Extend the save test from 1.3: a save from before this change loads with the scandal at
  0; a reload keeps €4,000. Verify it passes with the migration.

## 3. Feed cost, reach and orders

- [x] 3.1 Rewrite the feed-cost tests in `bulkSales.test.ts` to the new Price of feeding MegaMeat
  scenarios (customers stay, awareness 100 → 47 on €529, 12 customers stay 12, 30 customers with
  no income stay 30, cost preview €60 → 6 awareness and 1%, €529 → 6%, shares €121 → 13 and 2%,
  €1,091 → 110 and 10%). Verify they fail, then change `feedCostOf` to return awareness and the
  factor's loss after the sale and remove the customer loss from `bulkSell`. Verify they pass.
- [x] 3.2 Write tests in `aktionen.test.ts`: scandal €10,000 → flyers win 9 (10 → 19 customers);
  with the study active as well → 4 (10 → 14); estimate on the button reads 9. Verify they fail,
  multiply `aktionEstimate` by `scandalFactor(state)`, verify they pass.
- [x] 3.3 Write tests in `sales.test.ts` and `salesStats.test.ts`: scandal €10,000 with 1,000
  customers → 250 open orders in 10 s and a cap of 750; demand shows 1,500 per minute. Verify
  they fail, multiply `orderRate` and `demandPerMinute` by the factor, verify they pass.
- [x] 3.4 Write tests in `steady.test.ts`: `steadyIncome` with a demand factor of 0.5 sells half
  the orders; surplus Leverkas sold to the biogas plant is capped at about €55/s. Verify they
  fail, add the demand-factor argument (default 1) and the biogas cap in `surplusIncome`, pass
  `scandalFactor(state)` from `player.ts` (steady income and rescue valuation), verify they pass
  and the fair player's `withoutFeedCost` rule still skips MegaMeat. Update the Feeding the
  industry test in `simulate.test.ts` to the new gate (fewer customers at 30 min, ≤ 0.75 × total
  earned at 60).

## 4. UI

- [x] 4.1 MegaMeat offer buttons: replace the customer figure with "N awareness · −P% sales and
  campaigns", DE and EN. Verify in the browser with a fresh scandal that a €60 sale shows 6 and
  1%.
- [x] 4.2 Scandal line on the Verkauf tab and the Aktionen panel (percent less ordered and fewer
  won, minutes until below 5%) in reserved slots, shown from 1%, DE and EN. Verify in the
  browser: after a €10,000 sale both lines read 50% and about 42 min; they disappear once the
  scandal is under about €101.

## 5. Docs

- [x] 5.1 Update the concept doc section 3.3: every sale feeds a MegaMeat scandal that makes
  customers order less and campaigns win fewer for a while (half at €10,000, fading with a
  10-minute half-life), plus awareness; the biogas plant's product markets flood like
  MegaMeat's; drop the customer-loss sentence and the one-minute note; append "scandal and
  biogas flood by `megameat-scandal`" to the changed-by note. Verify by reading the passage.

## 6. Balancing

- [x] 6.1 Re-run the three simulations, compare with 0.1 against the gates in design.md: fed run
  fewer customers at 30 min and ≤ 0.75 × fair total earned at 60; tempted lead at 5 and 10 min and
  fair ≥ 1.5 × tempted at 60; fair total earned within 3% of 0.1. Report the fed customer share,
  the fed mean order factor, the fed Leverkas time, MegaMeat and biogas units and the pacing
  table. If gate 1 fails, tune K within 5,000–10,000 and H within 300–600 s; if a gate fails at
  every corner, stop and report to the head of development. Write the final K and H into the
  bulk-sales delta and the proposal.

## 7. Verification

- [x] 7.1 Run the tests, the type check and the production build and check they pass.
- [x] 7.2 Rebuild the container (`docker compose up -d --build web`) and play-check in the browser:
  sell 200 soybeans to MegaMeat; customers stay, awareness drops, the demand figure and the flyer
  estimate read lower, both tabs show the scandal line; wait ten minutes of game time and see it
  halve; dump 100 Leverkas on the biogas plant and see its Leverkas meter drop to about half and
  recover within a minute; sell soybeans to the biogas plant and see no meter at all.
