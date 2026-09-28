# Proposal: customer-demand-curve

## Why

Demand grows in a straight line with customers (0.05 orders/s each), while awareness, campaigns
and customers all grow on top of each other. In the 60-minute simulation on the archived
`megameat-scandal` content (e17f6fb) demand passes production at about minute 10 and stays far
above it until the flagship chain arrives in the last ten minutes:

| Minute | Customers | Demand | Products made |
|---|---|---|---|
| 10 | 428 | 21.4/s | 20/s |
| 20 | 4,043 | 202/s | 29/s |
| 30 | 9,245 | 462/s | 72/s |
| 60 | 17,990 | 900/s | 448/s |

For fifty minutes customers do not matter, the storeroom is always empty and the bulk buyers
never see surplus. That contradicts the concept doc's section 3.3: Act 1 lives in overproduction
and surplus goes to bulk buyers. A viral reel at 10,000 customers adds 75 orders/s, more than the
whole production of a 30-minute game.

The concept doc did not plan this change in its section 8 sequence; it revisits the demand rule of
`sales-and-customers` (row 5).

## What Changes

- **Diminishing demand**: the first 750 customers order 0.05/s each (37.5 orders/s at the knee);
  beyond that, every *doubling* of the customer count adds another 37.5 orders/s. The loyalty card
  and MegaMeat's scandal multiply the result as today. A new content constant holds the knee.
- The demand figure in the sales panel, the open-order cap, the overproduction threshold, the
  demand ceiling chart and the simulated player (steady income and the rescue valuation, which
  counts the orders the *next* customers add, not a flat rate) all follow the curve.
- With the tuned knee of 750 the simulated fair run's demand is 21.4 / 129 / 174 / 318 orders/s at
  minutes 10 / 20 / 30 / 60 (the player buys the loyalty card, ×1.5, around minute 40); the whole
  town orders about 215/s without the card and 323 with it. Production overtakes demand at about
  minute 38.5 (at knee 500: 34.7; at 1,000: 49.7), so the surplus goes to the bulk buyers for the
  last third of the hour, and the first Leverkas oven moves from 52 to about 37 minutes, because
  extra Tofu-Wurst kitchens earn nothing once demand binds while Leverkas sells first. Games up to
  750 customers (the first ten minutes and more) are untouched.
- Knob, range and stop condition (design.md, Acceptance): `DEMAND_KNEE` from 500 up to 1,000
  (tuned to 750; 1,000 doubles every number beyond the knee against 500, so demand would bind
  only in the last few minutes); no other value moves. If the hard gates do not hold within that range, the change
  comes back to the product owner.

## Non-goals

- Changing how many customers campaigns win, what they cost, or the awareness rates (the user
  wants customer growth as it is; demand is the lever).
- Changing product prices, the order cap in seconds, or the overstock threshold in seconds.
- Save changes: customers and open orders stay as saved; only the rate derived from them changes.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `sales`: the Open orders requirement gets the demand curve (knee and doubling rule) with
  scenarios at and beyond the knee; the Sales figures requirement's Demand line follows it.
- `dev-tools`: the demand ceiling chart and the simulated player's income and rescue valuation
  use the curve.

## Impact

- `src/game/content/town.ts`: the knee constant and the pure demand function.
- `src/game/systems/sales.ts` (`orderRate`), `src/game/systems/salesStats.ts` (`demandPerMinute`),
  `src/game/balance/steady.ts` (`steadyIncome`), `src/game/balance/curves.ts` (`demandCeiling`),
  `src/game/balance/player.ts` (`rescueScore`).
- Tests: new unit tests for the curve; `simulate.test.ts` pacing must still pass and may need the
  knee re-tuned.
- Builds on the archived `chain-proportions` (95239d6) and `megameat-scandal` (e17f6fb), which
  replaced the customer loss of feeding MegaMeat with a scandal factor on campaigns and orders
  (K €10,000, halving every 600 s), flooded the biogas plant's product markets, and turned the
  fed gate into money plus direction. The validator had found the old customer-ratio gate chaotic
  under this curve (66% at knee 500, 44–56% between 550 and 900, failing again at 950–1,000).
  The sales delta is re-based on the archived text: the curve applies to the customer count, the
  scandal and upgrade factors multiply its result, and the cap follows.
