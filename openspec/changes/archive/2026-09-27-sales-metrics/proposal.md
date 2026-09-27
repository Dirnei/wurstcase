# Proposal

## Why

Customers place a fixed number of orders (0.05 per customer per second), and every order takes
the most expensive product in stock. When Leverkas and Hafer-Cappuccino cover most of the
orders, Tofu-Wurst gets only the rest, which is often nothing. The player sees Leverkas and
Cappuccino sitting at 0 and Tofu-Wurst piling up, and reads it as a bug. A playtest just did
exactly that. The rules work as specified, but the sales panel only shows customers and open
orders. It never shows how much demand there is, how much of each product actually sells, or
that customers, not production, are the limit.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It makes the sales rules of row 5
(`sales-and-customers`) readable, and points the player at the Lebenshof (row 6) as the way to
more demand.

## What Changes

- **Sales figures in the sales panel**, measured over the last 60 seconds of game time and shown
  per minute:
  - **Demand:** orders per minute from all customers.
  - **Sold per product:** units of each shown product sold to customers per minute, including
    0 for a product that is in stock but not selling.
  - **Income:** euros per minute from customer sales.
- **Per minute, not per second:** early rates are small (one Leverkas oven makes 0.25 per
  second), and numbers below 1000 show one decimal place, truncated. "0.2/s" and "0/s" would
  hide exactly the slow sales the figures are meant to show. Per minute they read 15/min and
  3/min.
- **"Customers are the limit" hint:** while the existing overproduction condition holds (more
  products in stock than 2 minutes of orders), the panel shows a plain hint below the joke
  message: all orders are filled, cheaper products wait until there are more customers, and
  more customers come from awareness in the Lebenshof.
- Only sales to customers (by hand or by the assistant) count. Bulk sales to MegaMeat and the
  biogas plant stay out of these figures; the bulk buyers panel already shows what they pay.
- The figures are not saved; after loading they start at 0 and fill up as time passes.

## Non-goals

- Changing who buys what. Most-expensive-first stays; letting customers spread orders across
  products would be a balancing change for `release-v1` (row 13).
- Production rates (units made per minute) in the stock panel. The trend arrows of
  `stock-trend-indicator` cover rising and falling stock.
- Charts or history of sales over time; the `#dev` balancing page covers curves for the author.
- A separate figure for bulk sale income.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `sales`: adds a requirement for sales figures (demand, units sold per product, income) and a
  requirement for the demand-limit hint.

## Impact

- New system `src/game/systems/salesStats.ts` (pure logic, tested) and a new non-saved field on
  `GameState`.
- `src/game/systems/sales.ts` records each filled order; `src/game/tick.ts` moves the window on.
- `src/ui/SalesPanel.svelte` shows the figures and the hint.
- `src/i18n/de.json`, `src/i18n/en.json` get new labels.
- No save format change.
