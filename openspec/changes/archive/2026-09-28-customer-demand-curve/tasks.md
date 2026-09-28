# Tasks

## 0. Before starting

- [x] 0.1 Check that `megameat-scandal` is archived and the tree is clean, then run the default,
  tempted and fed 60-minute simulations and note the pacing table, total earned at 5 / 10 / 60
  minutes, final customers of the fair and fed runs, the set-1 / set-24 paybacks per chain, and
  demand vs. products made per second at minutes 10 / 20 / 30 / 60 as the baseline.

## 1. The curve

- [x] 1.1 Write Vitest tests for `demandRate` in `content/town.test.ts` (or the nearest existing
  content test): 10 customers → 0.5/s, 750 → 37.5/s, 1,500 → 75/s, 6,000 → 150/s, 20,000 → about
  215.1/s, and 1,500 with factor 1.5 → 112.5/s (knee 750, recomputed from the draft's 500). Verify they fail because the function does not
  exist.
- [x] 1.2 Add `DEMAND_KNEE = 750` and `demandRate(customers, factor)` to `content/town.ts` with the
  doubling rule in its doc comment. Verify the tests from 1.1 pass.

## 2. Consumers

- [x] 2.1 Add tests in `sales.test.ts` for the spec scenarios "Twice the knee" (1,000 customers,
  10 s → 500 open orders, cap 1,500), "Each doubling adds the same" (4,000 customers → 1,000
  orders in 10 s) and "Scandal and loyalty card together" (4,000 customers, card, scandal
  €10,000 → 75 per second, cap 2,250), and in `salesStats.test.ts` for 1,000 customers → 3,000
  per minute. Verify they fail and the existing "Scandal halves orders" test still passes
  (1,000 customers sit at the curve's 50 per second).
- [x] 2.2 Route `orderRate` in `systems/sales.ts` and `demandPerMinute` in `systems/salesStats.ts`
  through `demandRate`. Verify the tests from 2.1 pass and the existing 10-customer scenarios
  still pass.
- [x] 2.3 Add tests in `curves.test.ts` (demand ceiling at 2,000 customers → €225/s Tofu-Wurst)
  and `steady.test.ts` (steady income with 1,000 customers and enough kitchens caps at 50 sold per
  second). Verify they fail.
- [x] 2.4 Route `steadyIncome`, `demandCeiling` and `rescueScore` (marginal orders
  `demandRate(c + won) − demandRate(c)`) through `demandRate`; remove the direct
  `ORDERS_PER_CUSTOMER` uses outside `town.ts`. Verify the tests from 2.3 pass and
  `grep ORDERS_PER_CUSTOMER src` only hits `town.ts` and its test.

## 3. Balancing

- [x] 3.1 Re-run the default, tempted and fed simulations, compare with 0.1, and check the hard
  gates in design.md: fed run with fewer customers than fair at 30 min and ≤ 0.75 × its total
  earned at 60,
  tempted lead at 5 and 10 min and fair ≥ 1.5 × tempted at 60. Report the pacing table, the fed
  customer share and the set-1 / set-24 paybacks. If a gate fails, retune
  `DEMAND_KNEE` (try 1,000 next; never above); if the money gate still fails, tune the scandal's
  K within 5,000–10,000 and H within 300–600 s; if the gates do not hold there either, stop and
  report to the head of development. Write the final knee (and scandal values, if moved) into
  the sales and bulk-sales spec deltas and the proposal table.
- [x] 3.2 Verify on the dev page that the demand ceiling chart bends at the knee and reads about
  €645/s for Tofu-Wurst at the town size (215 × €3) with the final knee.

## 4. Verification

- [x] 4.1 Run the tests, the type check and the production build and check they pass.
- [x] 4.2 Rebuild the container (`docker compose up -d --build web`) and play-check in the browser:
  with a save beyond the knee, the sales panel's demand per minute matches the curve, open orders
  trim to the new cap on the next tick, and the storeroom fills once production passes demand
  while the bulk buyers take the surplus.
