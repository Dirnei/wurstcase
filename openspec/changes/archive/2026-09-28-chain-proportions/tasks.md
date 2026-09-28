# Tasks

## 0. Before starting

- [x] 0.1 With the tree as it is (rule test and rates in place), run the default, tempted and fed
  60-minute simulations and note the pacing table, total earned at 5, 10 and 60 minutes, final
  customers of the fair and fed runs, and the set-1 / set-24 paybacks per chain as the baseline.

## 1. Rule and rates (already in the tree; verify)

- [x] 1.1 Verify `content.test.ts` asserts field ≥ processing ≥ product, field > product and base
  prices strictly ascending for every chain, and that the oat and wheat rates are 0.5 / 1/3 with
  prices 400/700/1,000 and 300/400/450. Verify the check fails when a wheat field's price is set
  above the seitan kitchen's.

## 2. Prices per balanced set

- [x] 2.1 Write tests for a set-share helper in `content/buildings.ts` (or its test file): soy
  1.5 / 1 / 1, oat 2 / 1.5 / 1, wheat 2 / 1.5 / 1, derived from the rates and recipes. Verify they
  fail because the helper does not exist.
- [x] 2.2 Add `setGrowth` per chain (1.13 / 1.07 / 1.06) to the chain content and the set-share
  helper; remove `priceGrowth` from the building defs. Verify the tests from 2.1 pass and the type
  check names every remaining `priceGrowth` use on buildings.
- [x] 2.3 Write tests in `buildings.test.ts` for the spec scenarios: 2 soybean fields owned → €12,
  24 owned → €71, 1 tofu press → €29, 1 wheat field → €309, and one whole wheat set owned → next
  field and next oven at 1.06 × base, rounded up. Verify they fail.
- [x] 2.4 Change `buildingPrice` to `basePrice × setGrowth^(owned / share)`, rounded up, and the
  chain milestone price in `content/upgrades.ts` to the multiple of Σ basePrice ×
  setGrowth^((at − 1) / share). Verify the tests from 2.3 pass, and update the tests that assumed
  ×1.13 per soybean field or the old milestone prices (upgrade tests, `curves.test.ts`: first soy
  set €173 and about 58 s; cost chart second copy €11).
- [x] 2.5 Show each chain's set growth and the resulting growth per copy in the dev page header
  (`balance/curves.ts` data + the header component, DE and EN strings). Verify on the dev page.

## 3. MegaMeat's flood in euros

- [x] 3.1 Write tests in `bulkSales.test.ts` for the spec scenarios: fresh market 20 soybeans →
  €61 and flood €63; flood €1,575 → 50% and €31; 1,000 soybeans → €1,730; 60 wheat at a fresh
  market → €1,091 and 50%; recovery €1,575 → €787.50, 67%, about 1:05; split ticks. Verify the
  wheat and the flood-in-euros assertions fail.
- [x] 3.2 Replace `halfPriceUnits` with `halfPriceEuros: 1575` in `content/buyers.ts`, keep the
  flood level in euros of full price in `bulkSales.ts` (price share, sale value, flood raise, time
  until 95%) and update `curves.ts` `bulkTable` (cap per second = K × ln 2 ÷ H for every MegaMeat
  resource). Verify the tests from 3.1 pass and `curves.test.ts` still reads €54.6/s for soybeans.
- [x] 3.3 Write a save test: a save with a soybean flood of 500 units loads with fresh markets.
  Verify it fails, then add the migration step that drops `megaMeatFlood`, and verify it passes.

## 4. Pacing windows and docs

- [x] 4.1 Set the first Leverkas oven window to [20, 40] and the first cow to [18, 35] in
  `balance/milestones.ts`; add a milestones test that 38 minutes is in the Leverkas window.
  Verify it passes.
- [x] 4.2 Update the concept doc: section 3.3 (MegaMeat pays at most about €55 per second for any
  one resource, flood in euros; note "Changed by `chain-proportions`"), section 5 (20–40 min row
  for the Leverkas and cows), and the pricing sentence in section 3 or 4 that describes per-copy
  cost scaling. Verify by reading the three passages.

## 5. Balancing

- [x] 5.1 Re-run the three simulations and compare with 0.1 against the acceptance list in
  design.md: crossover at set 24, tempted lead at 5 and 10 min and fair ≥ 1.5 × tempted at 60, fed
  customers ≤ 50% of fair, Leverkas in 20–40 and cow in 18–35. Tune, in this order: oat and wheat
  set growth (oat ≤ 1.078), oat and wheat base prices keeping the order, then the soybean field's
  base price by €1–2. Write the final values into the production-chain and dev-tools spec deltas
  and the proposal.
- [x] 5.2 Only if 5.1 cannot reach the feed check: report the numbers to the head of development,
  then shorten the feed horizon in `content/buyers.ts`, add the Price of feeding MegaMeat
  requirement to the bulk-sales delta with recomputed scenarios, and re-run 5.1.
- [x] 5.3 Verify on the dev page that the chain balance table shows 3 : 2 : 2 for soy and
  4 : 3 : 2 for oat and wheat, the chain set payback chart crosses, and the pacing table shows the
  widened windows.

## 6. Verification

- [x] 6.1 Run the tests, the type check and the production build and check they pass.
- [x] 6.2 Rebuild the container (`docker compose up -d --build web`) and play-check in the browser:
  in the oat and wheat rows the Buy prices rise from field to product and grow slowly per copy;
  the cards show 0.5 oats/s, 0.33 oat drink/s, 0.5 wheat/s, 0.33 seitan/s without layout shifts;
  a line of 2 fields, 2 processors and 1 product building runs without the product building
  waiting; dumping 60 wheat on MegaMeat halves its market and the meter recovers in about a
  minute.
