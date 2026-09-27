# Design

## Context

See proposal.md (Why) and the specs. After `production-chain`, `GameState` holds money, stock,
building counts and per-building `progress`; all stock and money are whole numbers, and
production works in whole units with a fractional progress accumulator. `sellAll()` in
`src/game/systems/sales.ts` is the stopgap, called from `SellButton.svelte` inside the stock
panel. `tick()` runs `produce()` only. The save is at format 2.

## Goals / Non-Goals

**Goals:**
- Orders use the same whole-unit pattern as production, so money and stock stay whole.
- One sale function (`fillOrders`) shared by the manual click and the assistant, so both follow
  the same most-expensive-first rule.
- Customers are a state value that change 6 can grow without touching sales.

**Non-Goals:**
- A generic upgrade mechanism for the assistant (see proposal Non-goals).

## Decisions

### Files

```
src/game/content/town.ts         STARTING_CUSTOMERS 10, ORDERS_PER_CUSTOMER 0.05/s,
                                 ORDER_CAP_SECONDS 30, OVERSTOCK_SECONDS 120,
                                 ASSISTANT { price 150, unlockAt 50 }
src/game/content/products.ts     + PRODUCTS_BY_PRICE: products sorted by price, highest first
src/game/systems/sales.ts        rewritten: orderRate, orderCap, takeOrders, saleValue, canSell,
                                 sell, fillOrders, canHireAssistant, hireAssistant, isOverstocked
src/game/state.ts                + customers, openOrders, orderProgress, assistant
src/game/tick.ts                 produce(), then takeOrders() (which also sells when the assistant is hired)
src/game/save.ts                 format 3, migration 2 → 3
```

### State

```ts
customers: Decimal       // whole; Decimal because change 6 grows it towards town sizes and beyond
openOrders: Decimal      // whole
orderProgress: number    // fraction towards the next order; plain number like building progress
assistant: boolean
```

### Taking orders and the cap

`takeOrders(state, seconds)` per tick:

1. `orderProgress += customers × ORDERS_PER_CUSTOMER × seconds`; `new = floor(orderProgress)`,
   `orderProgress −= new`, `openOrders += new`.
2. If the assistant is hired: `fillOrders(state)`.
3. Cap: `openOrders = min(openOrders, orderCap)` with `orderCap = floor(rate × 30 s)`. While the
   cap is reached, `orderProgress` is reset to 0, so no order is banked (the same rule as a
   waiting building).

Selling (step 2) runs before the cap (step 3) on purpose. With the assistant, a 60 s tick first
creates 30 orders and sells them from the stock produced in the same tick, as 600 small ticks
would. If the cap came first, one big tick could only sell 15 orders. Without the assistant, the
cap applies to both big and small ticks in the same way.

`customers` is a `Decimal`, but `rate × seconds` for 10 customers is tiny; the multiplication
goes through `Decimal` and converts to a number only for the fractional progress. For the counts
change 6 reaches, `floor` on a `Decimal` keeps it exact enough; any rounding is far below one
order per tick.

### Filling orders, most expensive first

`fillOrders(state)` walks `PRODUCTS_BY_PRICE` (content, highest price first; Leverkas €25,
Hafer-Cappuccino €12, Tofu-Wurst €3). For each product: `sold = min(stock, openOrders)`,
stock −= sold, openOrders −= sold, money and totalEarned += sold × price. `saleValue(state)` runs
the same loop on a copy of the numbers without mutating, for the button label. `sell(state)` is
`fillOrders` behind `canSell` (open orders > 0 and any product stock > 0).

Alternative: fill orders proportionally across products. Rejected because the concept wants the
move up to Leverkas to pay off directly (section 3.3).

### Assistant

`canHireAssistant`: not hired, `totalEarned ≥ unlockAt`, `money ≥ price`. `hireAssistant` subtracts
the price and sets `assistant = true`. The panel shows the offer only once `totalEarned` reaches
`unlockAt`, and after hiring replaces the sell button with a short line ("Deine Aushilfe
verkauft.").

When `upgrades` (8) lands, the assistant can become an entry in its upgrade list that sets the
same flag; the sales system only reads `assistant`.

### Overproduction

`isOverstocked(state)`: sum of product stock > `orderRate × OVERSTOCK_SECONDS` (0.5/s × 120 s = 60
units at the start). Stock changes in whole units and slowly compared with the 10 ticks per
second, so no hold timer is needed, unlike the shortage mark.

### UI

`SalesPanel.svelte` (new, placed right after money / play time): customers, "open orders
7 / 15", the sell button with its earnings ("Verkaufen (+21 €)"), the assistant offer or the
"assistant is selling" line, and the overproduction joke. The sell button and its keys are removed
from the stock panel. Translations: `sales.title`, `sales.customers`, `sales.orders`,
`sales.sell`, `sales.assistant.offer`, `sales.assistant.hire`, `sales.assistant.active`,
`sales.overstock` in DE and EN.

### Save format 3

Bump `CURRENT_FORMAT` to 3. Migration 2 → 3 adds `customers: "10"`, `openOrders: "0"`,
`orderProgress: 0`, `assistant: false`. `readState` validates customers and open orders like other
whole amounts, `orderProgress` as a finite number ≥ 0, and `assistant` as a boolean.

## Risks / Trade-offs

- [With demand fixed at 10 customers, a second product only sells when the more expensive one is
  sold out, so the oat chain (Hafer-Cappuccino, €12) barely sells while Leverkas is in stock] →
  Intended pressure towards change 6, which grows demand. Until then the oat chain is mainly an
  unlock; the tuning pass (13) revisits it.
- [Income is now capped at about €12.50/s (0.5 orders/s of Leverkas), so the €1,500 Leverkas unlock
  takes roughly 15 minutes of Tofu-Wurst sales] → Within the concept's 20–35 min window for
  Leverkas; numbers are content and get tuned in play.
- [Manual selling means an idle player loses orders past the 30 s cap] → Intended: "full manual
  until a certain point". The assistant is cheap (€150) and unlocks early (€50 earned).

## Migration Plan

Format 2 saves load through migration 2 → 3 and keep their economy; they gain 10 customers, no
open orders and no assistant. Format 1 saves pass through 1 → 2 → 3.
