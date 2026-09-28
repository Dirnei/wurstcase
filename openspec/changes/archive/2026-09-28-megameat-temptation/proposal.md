# Proposal

## Why

Selling to MegaMeat should be a real temptation with a real price. Today it is neither:

- **It barely costs anything.** Every €100 MegaMeat pays costs 1 customer. A Leverkas customer
  orders €1.25 per second, so the lost customer's orders would have earned the €100 back in about
  80 seconds. The cost is a fixed euro amount, so it shrinks as income grows: at €1,250/s, a
  €10,000 sale costs 100 of 13,500 customers (0.7%), and the town reconverts them over time.
- **It barely tempts.** MegaMeat pays 40% of a raw ingredient's vegan value and 67% of an
  intermediate's, the biogas plant 30% and 50%. Both measure against the full value of the
  finished product, so selling raw looks cheap and the difference between the two buyers is small.

Veganism has to become mainstream, and that should be hard: customers are the ceiling of the game.
Feeding the industry should pay well now and cost the thing that is hardest to win back.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It is part of the balancing that
row 13 (`release-v1`) plans as its "pacing tuning pass", following `crossover-balancing` and
`milestone-upgrades`.

## What Changes

- **Market value per stage.** Every resource gets a market value: a product's is its price; an
  earlier stage's is worked out backwards, as the market value of what one unit becomes, minus the
  value one processing step adds (25%, the top of the 10–25% range). Soybeans are worth €0.64,
  tofu €2.40, Tofu-Wurst €3.
- **Bulk buyers pay a share of the market value:** MegaMeat about 90% for everything it takes, the
  biogas plant about 67% for everything it takes. MegaMeat always pays more than the biogas plant,
  and processing before selling still pays because each step adds value. The lots are recalculated.
- **Feeding MegaMeat costs a share of your customers, not a fixed euro amount.** A sale costs the
  share of customers equal to the sale's euros divided by what the customers spend in 10 minutes
  (starting value): selling MegaMeat as much as your customers spend in one minute drives away a
  tenth of them. This scales with the game, so it hurts early and late alike. The 10 starting
  neighbours still stay. The awareness cost is unchanged.
- **The game remembers what customers spend:** a saved, smoothed customer income per second that
  the feed cost uses. Save format bump with a migration.
- **The sell button shows the cost** in customers, as today.
- **Balancing page:** the bulk buyer table shows market values and shares of it; the simulation can
  be switched to a player who sells its surplus to MegaMeat instead of the biogas plant, so the
  cost of feeding the industry can be seen and tuned.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `bulk-sales`: "Bulk buyers" measures shares against the market value (90% / 67%); "Selling in
  bulk" gets the new lots in its scenarios; "Price of feeding MegaMeat" costs a share of customers
  based on customer income; a new "Customer income" requirement keeps the smoothed income.
- `dev-tools`: "Bulk buyer table" shows market values; "Simulated playthrough" can sell to MegaMeat.

## Non-goals

- Scaling the awareness cost of feeding MegaMeat; it keeps its €10 per point for now.
- MegaMeat reacting to feed sales with events or ticker headlines; a candidate for `release-v1`
  (13) or Act 2.
- Automatic bulk selling for the player.
- Efficiency upgrades (`efficiency-upgrades`) and chain milestones (`milestone-upgrades`). Market
  values use the base recipes, not upgraded yields.
- Final numbers. The step markup, the shares and the 10-minute horizon are starting values.

## Impact

- Content: `src/game/content/buyers.ts` (lots, step markup, feed cost shape).
- State and systems: `src/game/state.ts` (customer income), the customer sales system,
  `src/game/systems/bulkSales.ts` (feed cost).
- Save: `src/game/save.ts` format bump with a migration.
- Balance: `src/game/balance/value.ts` (market value), `curves.ts` (bulk table),
  `player.ts`, `simulate.ts`, `steady.ts` (surplus buyer setting).
- UI: `src/ui/BulkBuyersPanel.svelte` (cost line), `src/dev/DevPage.svelte`; i18n if the cost text
  changes.
- Docs: section 3 of the concept doc (bulk buyers).
