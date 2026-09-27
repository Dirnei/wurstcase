# Design

## Context

`fillOrders` in `src/game/systems/sales.ts` is the one place where products are sold to
customers: `sell` (by hand) and `takeOrders` (the assistant, inside `tick()`) both call it.
Bulk sales go through `bulkSell` in `bulkSales.ts` and never touch `fillOrders`. `orderRate`
already gives demand per second. `isOverstocked` already drives the overproduction message.

`GameState` has non-saved fields (`waiting`, `shortage`) that `writeState` leaves out and that
`readState` gets empty from `createInitialState()`.

The pending change `stock-trend-indicator` plans the same kind of rolling window (10 s of stock
changes in 1-second buckets).

## Goals / Non-Goals

**Goals:**
- The figures read the same whether time came in one big step or many small ones.
- Constant cost per tick, independent of how long the game has run.

**Non-Goals:**
- Measuring production or bulk sales.

## Decisions

### 1. Record at `fillOrders`, advance time in `tick()`

`fillOrders` adds each product's sold units to the newest bucket. `tick()` calls
`advanceSalesStats(state, seconds)` so the window moves with game time. A hand sale between
ticks lands in the newest bucket (a bucket is created if none exists yet).

*Alternative:* derive sales from stock differences. Rejected: production and sales change the
same stock in the same tick and cannot be told apart afterwards.

### 2. Store units only; derive income

New non-saved field on `GameState`:

```ts
/** Units sold to customers, newest bucket last; each bucket covers up to 1 s of game time. Not saved. */
sales: { seconds: number; sold: Record<ProductId, Decimal> }[]
```

Income per minute is Σ sold × `PRODUCT_PRICES`, because prices are fixed per product. That
keeps one number fewer in each bucket and cannot drift from the real earnings.

### 3. A generic rolling window

`src/game/systems/rollingWindow.ts` holds the bucket logic, generic over
`Record<K, Decimal>`:

- `advance(buckets, seconds, windowSeconds)`: adds `seconds` to the newest bucket while it is
  under 1 s, otherwise starts an empty one, then drops buckets completely outside the window.
- `add(buckets, key, amount)`: adds to the newest bucket.
- `sum(buckets, key, windowSeconds)`: sums the window; a bucket reaching past its start counts
  only with its share inside the window, so one 120 s tick gives the same figures as many small
  ones.

`salesStats.ts` uses it with `SALES_WINDOW_SECONDS = 60`. Whichever of this change and
`stock-trend-indicator` is applied second should build on the same helper instead of a second
copy of the bucket logic.

### 4. Always divide by the full 60 seconds

`soldPerMinute = sum over window × 60 / 60`, i.e. the units sold in the last 60 seconds.
Dividing by the time actually covered would make the figures fill faster after loading, but a
hand sale of 3 units right after loading would then show 180 per minute. The fixed window means
a minute of play to reach full value, which matches "fills up as time passes".

*Alternative:* per second. Rejected in the proposal: `formatNumber` truncates small numbers to
one decimal place, so 0.05/s would show 0.

### 5. UI

`SalesPanel.svelte` adds under the customer and order numbers:

- `Demand: 30/min · Income: €375/min`
- one line per shown product (same `isResourceShown` filter as the stock panel), highest price
  first to match the selling order: `Leverkas 15/min`, `Hafer-Cappuccino 0/min`,
  `Tofu-Wurst 0/min`. A product with stock but 0 sold is drawn in `--text-muted`.

The demand-limit hint renders in the existing always-rendered overstock area, below the joke,
so the panel keeps its height rule.

New i18n keys (DE/EN): `sales.demand`, `sales.income`, `sales.soldPerMinute`, `sales.soldTitle`,
`sales.demandLimit`. English hint: "Your customers already buy everything they order. Cheaper
products wait until you have more customers, and more customers come from awareness at the
Lebenshof."

### Files

- **Added:** `src/game/systems/rollingWindow.ts`, `rollingWindow.test.ts`,
  `src/game/systems/salesStats.ts`, `salesStats.test.ts`
- **Changed:** `src/game/state.ts` (field `sales`), `src/game/systems/sales.ts` (record in
  `fillOrders`), `src/game/tick.ts`, `src/game/systems/sales.test.ts`, `src/game/tick.test.ts`,
  `src/game/save.test.ts`, `src/ui/SalesPanel.svelte`, `src/i18n/de.json`, `src/i18n/en.json`
- **Content entries:** none

## Risks / Trade-offs

- [Figures lag up to a minute behind a change] → intended for averages; the trend arrows react
  within 10 s.
- [The hint appears only once 2 minutes of orders are in stock] → it reuses a tested condition,
  and the 0/min figure already shows the problem earlier.
- [60 buckets of 3 Decimals each] → a few hundred small objects; negligible.

## Migration Plan

No save version change: `sales` is not written and is empty after every load.
