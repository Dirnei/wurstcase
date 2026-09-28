# Tasks

## 0. Before starting

- [x] 0.1 Check that `campaigns-unlock-by-awareness` is archived. The worker's uncommitted
  pegged-pricing work stays in the working tree and is built on. Run the default and MegaMeat
  60-minute simulations with it and note total earned and final customers at 5, 10 and 60 minutes
  as the baseline.

## 1. Full prices (pegged)

- [x] 1.1 Make sure `bulkSales.test.ts` and `content.test.ts` cover the full prices: soybeans €3.15,
  tofu €1.575, oats €12.60, oat drink €6.30, wheat €26.25, seitan €13.125; with mustard soybeans
  €4.20; lots of 20; no MegaMeat lot for products; biogas pays less than MegaMeat's full price for
  raw ingredients only, while tofu and oat drink are below biogas. Verify they pass with the
  existing pegged implementation.

## 2. Flooded market

- [x] 2.1 Write tests for the flood scenarios: a fresh 20-soybean sale pays €61 and sets the flood
  to 20; at flood 500 the market shows 50% and 20 soybeans pay €31; a fresh 1,000-soybean dump
  pays €1,730; 20 s turn flood 500 into 250 (67%, about 1:05 to 95%); one 20 s tick and 200 ticks of
  0.1 s agree; flooding soybeans leaves other markets fresh; biogas sales change no flood; 47
  soybeans at a fresh market sell 40 for €121; the feed cost of a fresh 200-soybean sale (€529) at
  1,000 customers and €10/s is 111 customers and 53 awareness (horizon 480 s). Verify they fail.
- [x] 2.2 Add `flood` to MegaMeat's content, `megaMeatFlood` to the state, `floodedValue`,
  `marketLevel`, `timeToRecover` and `recoverMarkets` to `bulkSales.ts`, call `recoverMarkets` in
  `tick()`, and use the flooded value in `bulkSaleValue` and `bulkSell`. Verify the tests from 2.1
  and all existing bulk, feed-cost and tick tests pass.

## 3. Save

- [x] 3.1 Add tests to `save.test.ts`: floods round-trip exactly (including a Decimal above 2^53);
  a format-12 save loads with every flood at 0; a negative flood is invalid. Verify they fail.
- [x] 3.2 Bump `CURRENT_FORMAT` to 13, add the 12 → 13 migration, and read/validate/write the
  floods. Verify all save tests pass.

## 4. UI

- [x] 4.1 Add the market texts (`bulk.market`, `bulk.recover`) to `en.json` and `de.json`, and show
  the market level, meter and recovery time on each MegaMeat offer in reserved fixed-width slots.
  Verify the i18n key-parity test passes, and in the browser that selling floods the market, the
  percentage and time tick back, and nothing on the Verkauf tab moves.

## 5. Balancing

- [x] 5.1 Add the tempted strategy to `simulate.ts` / `player.ts` and the strategy option to the dev
  page; make `steady.ts` use the current flooded price for MegaMeat surplus. Add `simulate.test.ts`
  checks that the tempted run out-earns the default run at 5 and 10 minutes and that the default
  run ends with at least 1.5× the tempted run's total earned at 60 minutes. Verify runs stay
  deterministic.
- [x] 5.2 Tune `halfLifeSeconds` and `halfPriceUnits` until the checks from 5.1 pass and the
  default run's pacing milestones stay in their windows. Write the final K and H, and every
  scenario number they change, into the bulk-sales and dev-tools spec deltas. If K and H cannot
  satisfy both the early lead and the 60-minute gap, stop and report the numbers.
- [x] 5.3 Update the dev page's bulk buyer table to show full prices at base product prices, K, H
  and each resource's income cap. Verify soybeans read €0.64, MegaMeat €3.15 (492%) with about
  €55/s at the tuned values, and biogas €0.43 (67%).
- [x] 5.4 Update concept doc section 3.3 to describe MegaMeat outbidding the product and its market
  flooding.

## 6. Verification

- [x] 6.1 Run the tests, the type check and the production build and check they pass.
- [x] 6.2 Play-check in the browser: early game, sell 20 soybeans to MegaMeat for about €61 and see
  the market drop slightly; dump a large stock and see the flooded price and the recovery time;
  wait and see it recover; buy "mustard on the side" and see the full price rise; reload and check
  the market level is kept.
