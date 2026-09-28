# Tasks

## 0. Before starting

- [x] 0.1 Check that `megameat-outbids` is archived and the tree is clean. Then compare this
  change's deltas with the archived main specs (`openspec/specs/bulk-sales/spec.md`,
  `openspec/specs/game-screen/spec.md`): copy any requirement text the balancing changed, and
  recompute every scenario number (lot size and price, units, euros, customer and awareness costs)
  from the final MegaMeat lot size, prices and feed-cost values before writing tests.

## 1. Shares in the sale rules

- [x] 1.1 Write tests in `bulkSales.test.ts` for the share scenarios: 50% of 130 soybeans sells 60
  for €178; 10% of 500 sells 40; with 150 soybeans 10% is unavailable and 50%/100% sell 60/140;
  with 19 soybeans no share is available; the MegaMeat cost for 10% and 100% of 500 soybeans at
  1,000 customers and €10/s is 26/13 and 228/110 (numbers recomputed in 0.1 from the
  flooded market and the 480 s feed horizon); calls without a share behave as 100%. Verify
  they fail.
- [x] 1.2 Add `BULK_SHARES` to `content/buyers.ts` and the optional `share` parameter to
  `wholeLots`, `bulkSaleUnits`, `bulkSaleValue`, `bulkSaleCost`, `canBulkSell` and `bulkSell`.
  Verify the tests from 1.1 and all existing bulk, balance and simulation tests pass.

## 2. Panel

- [x] 2.1 Add the share label and `bulk.sellShare` aria keys to `en.json` and `de.json`. Verify the
  i18n key-parity test passes.
- [x] 2.2 Rebuild the offer row in `BulkBuyersPanel.svelte`: header line with art, name and lot,
  then three equal buttons with share, sale (`liveCount` → `liveEuros`) and, for MegaMeat, a
  reserved cost line. Verify in the browser that 500 soybeans show 40 → €121, 240 → €617 and
  500 → €1,091, and that selling with each button changes stock and money as shown.
- [x] 2.3 Verify in the browser that stock ticking from 190 to 200 soybeans turns the 10% button
  from a dash into a sale without moving anything, and that the soybean rows of both buyer cards
  still line up.

## 3. Verification

- [x] 3.1 Run the tests, the type check and the production build and check they pass.
- [x] 3.2 Play-check in the browser in DE and EN at 1280 × 720, 900 px and 375 × 667: all three
  buttons fit in every offer with German values in the thousands, buttons are at least 44 px tall
  on the phone, the sales figures stay visible at 1280 × 720, and a screen reader reads each
  button's full sale and cost.
