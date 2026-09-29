# Tasks

## 0. Before starting

- [x] 0.1 Check that the tree is clean on 93b2584 or later and that the aktionen, sales and
  dev-tools deltas still match `openspec/specs/` (re-copy and recompute the scenario numbers if a
  change touching them was archived since).

## 1. Campaign reach

- [x] 1.1 Write Vitest tests in `systems/aktionen.test.ts` for the spec scenarios "First open farm
  day" (10 customers → 149), "First viral video" (10 customers → 749) and "Nearly full town"
  (19,000 → 19,007). Change the existing open farm day estimate test (15 at 19,000 customers) to
  7. Verify the new and changed tests fail.
- [x] 1.2 Set `openFarmDay.customers` to 150 and `viralReel.customers` to 750 in
  `content/aktionen.ts`. Verify the tests from 1.1 pass and the flyer tests are unchanged.

## 2. Demand knee

- [x] 2.1 Update the tests for the knee of 200: in `content/town.test.ts`, the knee is 200, 200 →
  10/s, 400 → 20/s, 800 → 30/s, 6,400 → 60/s, 20,000 → about 76.4/s, 800 with factor 1.5 →
  45/s, and each doubling adds `demandRate(200)`. In `systems/sales.test.ts`, use the spec
  scenarios (at the knee 200 → 100 in 10 s; twice 400 → 200, cap 600; four times 800 → 300, cap
  900; 6,400 → 600; scandal 1,600 → 200, cap 600; loyalty and scandal 6,400 → 45/s, cap 1,350).
  In `systems/salesStats.test.ts`, 800 → 1,800 per minute and 1,600 with scandal → 1,200. In
  `balance/curves.test.ts`, 800 customers → €90/s Tofu-Wurst. In `balance/steady.test.ts`,
  recompute the steady income case beyond the knee. Verify they fail on the knee of 750.
- [x] 2.2 Set `DEMAND_KNEE = 200` in `content/town.ts` and change the doc comment's example to
  10 orders per second at a knee of 200. Verify the tests from 2.1 pass and the 10-customer
  scenarios still pass.

## 3. Simulation tests

- [x] 3.1 Run the existing simulation tests. If a fed or tempted threshold moves only because
  customers are worth less now, adjust the threshold and note it in design.md. Do not retune
  other systems for it, and add no new simulation gate. Verify `balance/simulate.test.ts` passes.

## 4. Verification

- [x] 4.1 Run the tests, the type check, the production build and
  `openspec validate calmer-customer-growth --strict`, and check they all pass.
- [x] 4.2 Rebuild the container (`docker compose up -d --build web`) and play-check in the
  browser. In a new game, the first flyers win about 20 customers as before. The open farm day's
  button shows about 150 and the viral video's about 750. On the dev page, the demand ceiling
  chart bends at 200 customers and reads €90/s for Tofu-Wurst at 800. With a save that has
  thousands of customers, the sales panel's demand follows the new curve and open orders trim to
  the new cap on the next tick.
