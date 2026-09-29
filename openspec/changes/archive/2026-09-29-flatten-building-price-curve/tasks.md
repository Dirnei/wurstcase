# Tasks

## 1. Tests first

- [x] 1.1 Update the price tests in `systems/buildings.test.ts` to the spec scenario values: €12 for
  field 3, €40 with 24 fields, press €28, wheat field €409, and €418 / €941 after one wheat set.
  Verify they fail against the current growth values.
- [x] 1.2 Update or add the milestone tests in `systems/upgrades.test.ts` and
  `systems/production.test.ts`: soy 25 costs €5,500, soy 75 costs €390,000 and is on offer at 75,
  a soy field shows 600/s at 75 and 12,800/s at 200 with all milestones. In
  `content/content.test.ts`, expect `CHAINS.length * 6` milestones with prices rising within each
  chain. Verify the new cases fail.
- [x] 1.3 Add a save test: a current-version save with 80 of each oat building and oat 25/50 loads
  with the oat 75 milestone on offer and not owned. Verify it fails until 2.2.

## 2. Content

- [x] 2.1 Set `SET_GROWTH` in `src/game/content/buildings.ts` to soy 1.09, oat 1.05, wheat 1.045, and
  verify the 1.1 tests pass.
- [x] 2.2 Set `OWNED_MILESTONES` in `src/game/content/upgrades.ts` to `[25, 50, 75, 100, 150, 200]`,
  and verify the 1.2 and 1.3 tests pass and `tsc` is clean.
- [x] 2.3 Add DE and EN name + joke line for `soyChain75/150/200`, `oatChain75/150/200` and
  `wheatChain75/150/200` in `src/i18n/de.json` and `src/i18n/en.json`. Keep the tone of the
  existing milestone names: funny, food satire, no preaching. Verify the dictionary tests pass.

## 3. Balance sanity

- [x] 3.1 Run `balance/curves.test.ts` and fix fixed numbers that only moved because of the new
  growth. In the crossover test, keep the set 1 assertion unchanged and re-baseline the set 24
  assertion to the measured order (soy < oat < wheat, about 1,472 / 1,582 / 1,621 s), with a
  comment naming this change and the suspended gate (design.md, "Suspended gates"). Don't skip or
  delete it. Verify set 24 payback is at least 25 % lower than before in every chain.
- [x] 3.2 In `balance/simulate.test.ts` ("tempted by MegaMeat"), keep the 5-minute assertion and
  re-baseline the 10-minute one to the measured values (tempted about €27,320 below fair about
  €38,239), with the same kind of comment. Don't skip or delete it. The 60-minute two-thirds check
  and the fed check must pass unchanged.
- [x] 3.3 Run the 60-minute sim and the milestones/pacing tests. Widen pacing windows if needed
  (they are guidelines), and apply the stop conditions in design.md. Log any knob change in
  design.md.

## 4. Verification

- [x] 4.1 Run `npm test`, `npm run build` and `openspec validate flatten-building-price-curve
  --strict`, and verify all pass.
- [x] 4.2 Rebuild the container (`docker compose up -d --build web`) and play-check in the browser.
  Building prices climb visibly slower. With a dev save at 75 of each soy building, the new
  milestone shows its DE and EN name and price. An existing save loads with buildings and upgrades
  intact.
