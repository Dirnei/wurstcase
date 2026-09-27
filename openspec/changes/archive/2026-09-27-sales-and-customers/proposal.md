# Proposal

## Why

Selling is still the stopgap from `production-chain`: one button sells all stock at base price,
with no limit. Demand is the central tension of the game: the business can outgrow its customers,
and only the rescue half (awareness, from change 6) grows them. That tension needs a real sales
model first. This is row 5, `sales-and-customers`, in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md` (concept section 3.3 and the first
row of section 5).

## What Changes

- **Customers:** a new game starts with 10 curious neighbours as customers. The number stays at 10
  in this change; change 6 makes awareness convert more townspeople.
- **Open orders:** customers place orders over time (a fixed number per customer per second, in
  whole orders). Open orders pile up to at most 30 seconds' worth; beyond that, demand is lost.
- **Selling by hand:** a "Verkaufen" / "Sell" click fills as many open orders as the stock allows,
  **most expensive product first**, at each product's base price. The button shows what the sale
  will earn.
- **Automatic selling as a purchase:** selling stays manual until the player buys a one-time
  "Aushilfe" / "Shop assistant" (price and unlock threshold are content data). From then on, open
  orders are filled every tick, again most expensive first.
- **Overproduction joke:** when unsold products pile up far beyond what customers order, the sales
  panel shows a joke message.
- **BREAKING (for the stopgap only):** the "Sell everything" button is removed.
- **Save format 3:** customers, open orders and the assistant are saved; format 2 saves migrate to
  10 customers, no open orders and no assistant.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `sales`: replaces "Sell everything" with customers, open orders, selling by hand, most expensive
  first, the automatic-selling purchase and the overproduction message.
- `game-loop`: the determinism exception grows from "one unit per building type" to also cover a
  sale completing at the boundary of the period, since automatic sales are whole orders.

## Non-goals

- Growing the customer count through awareness and passive conversion, the town population of
  20,000 and saturation: `lebenshof-rescue` (6).
- Aktionen that convert customers faster: `aktionen-and-megameat` (7).
- A general upgrade system. The shop assistant is a single one-time purchase here; `upgrades` (8)
  can fold it into its upgrade list without changing its behaviour.
- The news ticker; the overproduction joke is a line in the sales panel, the ticker version comes
  with change 7.
- Price changes by demand, per-product demand or customer preferences: out of scope for v1.
- Pacing: all numbers are starting values, tuned in `release-v1` (13).

## Impact

- New: `src/game/content/town.ts` (starting customers, orders per customer, order cap, overstock
  threshold, assistant price and unlock), a `SalesPanel.svelte` with translations in DE and EN.
- Changed: `src/game/systems/sales.ts` (rewritten), `src/game/state.ts` (customers, open orders,
  order progress, assistant), `src/game/tick.ts` (orders and automatic sales after production),
  `src/game/save.ts` (format 3, migration 2 → 3), `src/ui/StockPanel.svelte` (sell button
  removed), `src/App.svelte`.
- Removed: `src/ui/SellButton.svelte`, the `sales.sellAll*` translation keys.
