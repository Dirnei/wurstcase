# Tasks

## 1. Content and state

- [x] 1.1 Add `src/game/content/upgrades.ts` with the 17 upgrades from the spec. Extend the content test:
  - ids are unique
  - prices are whole and positive
  - every condition names known buildings, shelters, species and Aktionen
  - manual factors, price additions and space additions are whole numbers
  - factors are positive
  - every upgrade has at least one condition
  - the upgraded Leverkas, Hafer-Cappuccino and Tofu-Wurst prices keep the same order

  Verify `npm test` passes
- [x] 1.2 Add `upgrades: []` to `GameState` and to the new-game test; verify `npm run check` and `npm test` pass

## 2. Offers, buying and lookups (tests first)

- [x] 2.1 Write `src/game/systems/upgrades.test.ts`. Verify the tests fail. Cases:
  - nothing on offer in a new game
  - "strong hands" at €30 earned
  - "better seeds" only from the 5th soybean field
  - spending keeps offers
  - buying with €50 leaves €10, keeps `totalEarned` and is owned once
  - not affordable → cannot buy
  - an owned upgrade is not offered
  - lookups: `rateFactor` stacks better seeds and second farmer to ×3; `priceBonus` Leverkas +10; `ordersFactor` 1.5; `spaceBonus` stable +2; `animalPriceFactor` 0.8; `aktionCostFactor` 0.75; `awarenessFactor` chicken 2; `conversionFactor` 1.5; `manualFactor` 2
  - all lookups are neutral without upgrades
- [x] 2.2 Implement `src/game/systems/upgrades.ts`; verify the tests pass

## 3. Effects in the systems (tests first)

- [x] 3.1 Add effect tests to the existing system tests. Verify the new tests fail. Cases:
  - production: 5 soybean fields with better seeds make 10 soybeans in 1 s
  - manual: strong hands press 6 → 2 tofu, and 4 → 1 tofu with 1 soybean left
  - sales: selling 2 Leverkas with the secret recipe earns €70, and the order stays most expensive first
  - sales: the loyalty card gives 7 open orders from 10 customers in 10 s
  - rescue: more straw with 2 stables gives 12 space; the negotiator makes the first chicken €40
  - awareness: hen photo shoot with 3 chickens gives 6/s; the local newspaper converts ×1.5
  - aktionen: flyers cost 75 with Instagram and 150 under billboards
- [x] 3.2 Wire the lookups into `production.ts`, `manual.ts`, `sales.ts` (`productPrice`, `productsByPrice`, orders), `rescue.ts`, `awareness.ts` and `aktionen.ts`; verify all tests pass

## 4. Save format 7 (tests first)

- [x] 4.1 Extend `src/game/save.test.ts`. Verify the new tests fail. Cases:
  - owned upgrades round-trip in order
  - a format 6 save with 6 soybean fields migrates with none owned and "better seeds" on offer
  - unknown ids and duplicates are dropped
  - a non-array is rejected
- [x] 4.2 Bump `CURRENT_FORMAT` to 7, add migration 6 → 7, and read and write `upgrades`; verify all save and slot tests pass

## 5. Ticker hint (tests first)

- [x] 5.1 Add a ticker test: the upgrades hint applies while an upgrade is offered and none is owned, and stops after the first purchase. Verify it fails, then add the clause kind and the hint to `headlines.ts` and `ticker.ts` and verify it passes

## 6. UI and text

- [x] 6.1 Add the DE and EN keys: upgrade names and lines from the design, effect templates per kind, the panel title, "owned", and the new hint. Verify the dictionary test passes
- [x] 6.2 Build `UpgradesPanel.svelte` (offers cheapest first with buy button, line and effect; collapsed owned list), and add it after the chain panels in `App.svelte`. Check that the stock, sales, Lebenshof and Aktionen panels show upgraded values. Verify `npm run check` passes

## 7. Balancing page

- [x] 7.1 Extend `balance/steady.test.ts` and `simulate.test.ts`. Verify the new tests fail. Cases:
  - `steadyIncome` with better seeds and the secret recipe
  - the scripted player buys "better seeds" after its 5th field when it pays back faster than a sixth field
  - runs stay deterministic
- [x] 7.2 Implement the upgrade support in `steady.ts` and `player.ts`, and add the upgrades table (conditions, price, payback at unlock) and `upgrade` purchases in the log to `DevPage.svelte`. Verify the tests pass and the page renders in `npm run dev`

## 8. Verification

- [x] 8.1 Run `npm test`, `npm run check` and `npm run build`, rebuild the container (`docker compose up --build -d`, leave it running), then play-check against it in both languages:
  - the panel appears at €30 earned with "strong hands"
  - buying it makes clicks yield 2
  - "better seeds" appears with the 5th soybean field and doubles the field output shown in the stock trend
  - the secret recipe raises Leverkas sales to €35
  - more straw raises the space shown
  - the ticker shows the upgrades hint until the first purchase
  - reloading keeps owned upgrades
  - a format 6 save exported before this change imports with none owned
  - the balancing page lists the upgrades and the simulation buys some
