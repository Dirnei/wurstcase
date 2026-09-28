# Design

## Context

See proposal.md (Why). The relevant state of the code:

- `src/game/content/buyers.ts` holds the lots per buyer and resource, and MegaMeat's
  `feedCost: { eurosPerCustomer: 100, eurosPerAwareness: 10 }`.
- `src/game/systems/bulkSales.ts` has `bulkSell`, `bulkSaleCost` (the preview for the button) and
  `bestBuyer(resource, { withoutFeedCost })`.
- Customer sales add to money and `totalEarned` in `src/game/systems/sales.ts`. Recent sales are
  kept in `state.sales` (rolling buckets for the stock panel), which is not saved.
- `src/game/balance/value.ts` has `veganValue` (a unit's share of its chain's product price).
  The bulk buyer table (`curves.ts` `bulkTable`) and a content test measure shares against it.
- The scripted player sells surplus only to buyers without a feed cost; `steady.ts` prices surplus
  with `bestBuyer(resource, { withoutFeedCost: true })`.
- `milestone-upgrades` moves the save format to 8; this change comes after it.

## Goals / Non-Goals

**Goals:**
- Lots stay content data; the rules (market value, shares, processing pays) are enforced by a
  content test, so a retune cannot quietly break them.
- The feed cost scales with the game without any fixed euro amount.
- The simulation can show what feeding MegaMeat does to a whole game.

**Non-Goals:**
- No change to how the awareness cost works.
- No new UI beyond the cost line the sell button already has.

## Decisions

### Market value

`STEP_MARKUP = 0.25` in `buyers.ts` (the plan started at 0.2; see the tuning result).
`marketValue(resource)` in `balance/value.ts`: a product's base price; otherwise
`marketValue(consumer.output) / consumer.input.ratio / (1 + STEP_MARKUP)`, using the base recipe.
`veganValue` stays for building income on the cost charts.

| Resource | Market value | MegaMeat lot | Share | Biogas lot | Share |
|---|---|---|---|---|---|
| Soybeans | €0.64 | 7 for €4 | 89.3% | 7 for €3 | 67.0% |
| Tofu | €2.40 | 6 for €13 | 90.3% | 5 for €8 | 66.7% |
| Tofu-Wurst | €3.00 | — | — | 1 for €2 | 66.7% |
| Oats | €3.84 | 2 for €7 | 91.1% | 5 for €13 | 67.7% |
| Oat drink | €9.60 | 2 for €17 | 88.5% | 2 for €13 | 67.7% |
| Hafer-Cappuccino | €12.00 | — | — | 1 for €8 | 66.7% |
| Wheat | €4.00 | 5 for €18 | 90.0% | 3 for €8 | 66.7% |
| Seitan | €10.00 | 1 for €9 | 90.0% | 3 for €20 | 66.7% |
| Leverkas | €25.00 | — | — | 1 for €17 | 68.0% |

Each lot is the smallest one within 1.5 points of the target share. Every "processing pays" pair
holds for both buyers (for example MegaMeat: 3 soybeans €1.71 < 1 tofu €2.17; biogas: 2 seitan
€13.33 < 1 Leverkas €17). The content test checks shares against the ranges, MegaMeat above
biogas, and each processing pair, using `marketValue`.

Why a markup per step instead of the vegan value: the vegan value gives a raw ingredient the whole
value of the product it ends in, so any share high enough to tempt would let the player skip the
processing buildings. With the markup, raw soybeans sell for 57% (MegaMeat) or 43% (biogas) of
their vegan value, and the chain still pays.

### Customer income

`GameState.customerIncome: Decimal`, euros per second, saved. It is an exponentially decaying sum
with time constant `CUSTOMER_INCOME_SECONDS = 300` (content, `town.ts`):

- `recordCustomerSale(state, euros)` adds `euros / 300`; `sales.ts` calls it wherever customers
  pay (the shop assistant and selling by hand).
- `advanceCustomerIncome(state, seconds)` multiplies it by `exp(−seconds / 300)`; `tick` calls it.

At a steady rate r it settles at r, and a single sale fades within minutes. One number, no
history, and exact for any tick length, so one big offline tick and many small ones agree. New
system file `src/game/systems/customerIncome.ts`.

Alternative considered: the rolling `state.sales` buckets. They are not saved and cover only the
stock panel's window, so the feed cost would jump after a reload. Rejected.

### Feed cost

`FeedCost` becomes `{ horizonSeconds: 600, eurosPerAwareness: 10 }`. In `bulkSaleCost`:

- spend = `customerIncome × horizonSeconds`
- customers lost = spend > 0 ? `ceil(customers × euros / spend)` : every customer above
  `STARTING_CUSTOMERS`; then capped so customers stay at or above `STARTING_CUSTOMERS`
- awareness lost = `ceil(euros / eurosPerAwareness)`, capped at the pool, as today

`bulkSell` applies what `bulkSaleCost` returns, so the button and the sale cannot disagree. The
button text keys stay.

Why this form: income grows exponentially while customers are bounded by the town, so any fixed
euros-per-customer rate fades. Measuring the sale against the customers' own spending keeps the
trade the same all game: selling MegaMeat as much as your customers spend in a minute costs a
tenth of them. While customers are only the starting neighbours, MegaMeat costs nothing, so the
temptation is there from the start and the price arrives with the first real customers.

Alternatives considered: a fixed share of customers per sale (players would hoard and sell once);
a per-customer value from the dearest product (fades too, because at 60 minutes customers are
worth far less than their potential orders).

### Save migration 8 → 9

`CURRENT_FORMAT` becomes 9; the migration adds `customerIncome: '0'`. `readState` validates it as a
non-negative Decimal string, `writeState` writes it.

### Simulation with MegaMeat

`SimulationSettings.surplusBuyer: BuyerId` (default `'biogas'`). `sellSurplus` sells to that buyer
where it buys the resource, otherwise to the biogas plant. `steadyIncome` takes the surplus buyer
so the player's scoring values surplus at that buyer's price; it does not model the lost
customers, which is the point: the simulated player is the tempted one. The dev page gets a
select next to the click rate.

### Files

Changed content: `buyers.ts` (lots, `STEP_MARKUP`, `FeedCost`), `town.ts`
(`CUSTOMER_INCOME_SECONDS`).
Changed state and systems: `state.ts`, `sales.ts`, `bulkSales.ts`, `tick.ts`; new
`customerIncome.ts`.
Changed save: `save.ts` and `save.test.ts`.
Changed balance: `value.ts`, `curves.ts`, `steady.ts`, `player.ts`, `simulate.ts`.
Changed UI: `BulkBuyersPanel.svelte` if the cost preview's inputs change, `DevPage.svelte`.
Docs: the bulk buyers part of section 3 of the concept doc.

### Tuning result

Default and MegaMeat simulations, 60 minutes at 2 clicks/s, horizon 10 minutes kept:

| | Earned at 10 / 20 / 60 min | Customers at 60 min | Income at 60 min |
|---|---|---|---|
| Biogas (default) | €18K / €176K / €4.28M | 16,720 | €3,755/s |
| MegaMeat | €25K / €219K / €3.13M | 7,164 (43%) | €1,618/s |

Feeding MegaMeat pays more for the first 20–30 minutes and then falls behind, because the
customers it drives away are the ceiling. The target (at most half the default run's customers)
holds and is now a test.

The higher biogas prices speed up the default run. With a 20% markup the first wheat field (17.8
min), pig (8.7) and cow (18.5) came early and the first Leverkas oven late (37.1). Raising the
markup to 25% brought the oven back (34.0) but the first wheat field (18.5 min, window 20–35), pig
(9.0, window 10–20) and cow (19.2, window 20–35) stay up to 1.5 minutes early; the other pacing
milestones are in their windows. No markup or lot within the ranges fixes that, because the extra
bulk income moves every unlock threshold earlier. Raising the wheat, pig and cow unlock thresholds
is left to the release tuning pass (`release-v1`), which owns those numbers.

## Risks / Trade-offs

- [A save loaded after this change has customer income 0, so its first MegaMeat sale costs every
  customer above 10] → Accepted before release. Customer income reaches most of its level within
  5 minutes of play.
- [The biogas plant now pays more (67% of market value), which speeds up the default simulation]
  → The tuning task re-runs the pacing table and, if needed, raises the step markup (which lowers
  every earlier stage's price); lots are content.
- [A horizon of 10 minutes is too harsh or too mild] → Tuned with the MegaMeat simulation: the
  target is at most half the customers of the default run at 60 minutes, while still paying
  more in the short term.
- [MegaMeat is free while customers are 10] → Intended as the first temptation; the first
  customers above 10 make it cost.
