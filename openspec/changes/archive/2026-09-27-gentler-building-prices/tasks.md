# Tasks

## 1. Price growth (tests first)

- [x] 1.1 Update the cost-scaling test in `src/game/systems/buildings.test.ts` to 10% per copy: a €10 building costs €11 with 1 owned, €13 with 2 owned and €99 with 24 owned. Keep the "stays finite for very many copies" test. Verify that the updated test fails against the current 1.15.
- [x] 1.2 Change `PRICE_GROWTH` in `src/game/systems/buildings.ts` from 1.15 to 1.10 and update its comment if needed. Verify that all building tests pass.
- [x] 1.3 Add a test that a state loaded with 2 soybean fields prices the next one at €13 and leaves money and building counts unchanged. Verify that it passes without any save migration.

## 2. Docs

- [x] 2.1 Change the cost-scaling line in section 3.2 of `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md` from "about 15%" to "about 10%". Verify by grepping the doc: no "15%" should remain for building costs.

## 3. Verification

- [x] 3.1 Run `npm test`, `npm run check` and `npm run build`. Rebuild the container with `docker compose up --build -d` and leave it running. Then play-check the game:
  - A new game shows the soybean field at €10, then €11 after one purchase and €13 after two.
  - The wheat and oat buildings start at their unchanged base prices.
  - An existing save loads with its buildings and shows the lower next prices.
