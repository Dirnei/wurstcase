# Tasks

## 1. Content and state

- [x] 1.1 Add `src/game/content/town.ts` with the design's values and `PRODUCTS_BY_PRICE` in `products.ts`; extend the content test (highest price first, Leverkas first); verify `npm test` passes
- [x] 1.2 Add `customers` (10), `openOrders` (0), `orderProgress` (0) and `assistant` (false) to `GameState`; extend the new-game test; verify `npm run check` and `npm test` pass

## 2. Sales system (tests first)

- [x] 2.1 Rewrite `src/game/systems/sales.test.ts`: 10 customers × 10 s → 5 open orders; 1 s → 0; 5 min → capped at 15 and no banked progress; sell with 5 orders, 10 Tofu-Wurst and 2 Leverkas → 2 Leverkas + 3 Tofu-Wurst, +€59 money and earned, no orders left; 8 orders and 3 Tofu-Wurst → +€9, 5 orders left; `saleValue` matches without changing state; `canSell` false without orders or without products; verify the tests fail
- [x] 2.2 Rewrite `src/game/systems/sales.ts` (`takeOrders`, `fillOrders`, `saleValue`, `canSell`, `sell`) and remove `sellAll`/`canSellAll`; verify the sales tests pass
- [x] 2.3 Write assistant and overstock tests (not offered below €50 earned; hiring at €160 leaves €10; can't hire twice; with the assistant, `takeOrders` sells 1 Leverkas + 1 Tofu-Wurst for 2 orders; 61 products overstocked, 60 not), then implement `canHireAssistant`, `hireAssistant` and `isOverstocked`; verify the tests pass
- [x] 2.4 Call `takeOrders()` after `produce()` in `tick()`; add a tick test that a Tofu-Wurst chain with the assistant over 60 s once vs 600 × 0.1 s differs by at most one open order and one Tofu-Wurst price in money; verify all tests pass

## 3. Save format 3 (tests first)

- [x] 3.1 Extend `src/game/save.test.ts`: customers, open orders, order progress and assistant round-trip; a format 2 save migrates to 10 customers, no orders, no assistant and keeps its buildings; a format 1 save passes through both migrations; rejects fractional or negative customers and orders, negative order progress, and a non-boolean assistant; verify the new tests fail
- [x] 3.2 Bump `CURRENT_FORMAT` to 3, add migration 2 → 3, and read/write the new fields; verify all save and slot tests pass

## 4. UI

- [x] 4.1 Add the DE and EN keys for the sales panel and remove `sales.sellAll` and `sales.sellAllHint`; verify the dictionary test passes
- [x] 4.2 Build `SalesPanel.svelte` (customers, open orders / cap, sell button with earnings, assistant offer or active line, overproduction joke), add it to `App.svelte` below money and play time, and delete `SellButton.svelte` from the stock panel; verify `npm run check` passes

## 5. Verification

- [x] 5.1 Run `npm test`, `npm run check` and `npm run build`, rebuild the container (`docker compose up --build -d`, leave it running), then play-check against it in both languages: a new game shows 10 customers and orders building up to 15; selling fills orders most expensive first and the button shows the right earnings; the assistant appears at €50 earned, costs €150, and then sells on its own with no sell button; piling up more than 60 products shows the joke message; a format 2 save exported before this change imports with 10 customers and its buildings; reload keeps open orders and the assistant
