# Tasks

## 1. Chain resources

- [x] 1.1 In `content.test.ts`, add tests that `CHAIN_RESOURCES` follows `CHAINS` order, that the
  soy group is `soybeans, tofu, tofuWurst`, oats is `oats, oatDrink, haferCappuccino` and wheat is
  `wheat, seitan, leverkas`, and that every resource appears in exactly one group. Verify they
  fail.
- [x] 1.2 Add `CHAIN_RESOURCES` to `src/game/content/buildings.ts`, derived from `CHAINS` and
  `BUILDINGS`. Verify the tests from 1.1 pass.
- [x] 1.3 Remove `RESOURCE_KINDS` / `ResourceKind` from `resources.ts` and the `stock.raw`,
  `stock.intermediate`, `stock.product` keys from `en.json` and `de.json`. Verify with a search
  that nothing uses them and that the type check and i18n key-parity test pass.

## 2. Rail

- [x] 2.1 In `ResourceRail.svelte`, build groups from `CHAIN_RESOURCES`, keep only shown
  resources, drop empty groups, and render each group with an `h3` chain name (`chain.<id>`) and
  its own `<dl>` of the existing rows. Verify in the browser that a new game shows only a Soy group
  with soybeans, tofu and Tofu-Wurst.
- [x] 2.2 Style the headings as small muted labels, and at 768–1023 px hide them visually and
  separate groups with a top border. Verify in the browser at 1024 px and 900 px that amounts and
  trend marks line up across groups.

## 3. Verification

- [x] 3.1 Run the tests, the type check and the production build and check they pass.
- [x] 3.2 Play-check in the browser with the dev tools: unlock all chains and check the order
  Soy, Oats, Wheat; unlock the seitan kitchen without the Leverkas oven and check the Wheat group
  has no Leverkas; at 1280 × 720 check the Sell button stays visible; at 375 × 667 open the stock
  drawer and check it shows the same groups.
