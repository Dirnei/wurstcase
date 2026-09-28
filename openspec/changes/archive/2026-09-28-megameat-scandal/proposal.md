# Proposal: megameat-scandal

## Why

Feeding MegaMeat costs the player customers: every sale drives away the share of customers that
the sale is of what they spend in the feed horizon. `chain-proportions` had to shorten that horizon
from 8 minutes to 60 seconds to keep the fed player (fair strategy, MegaMeat as surplus buyer) at
half the fair player's customers, and now a €529 soybean sale wipes 88% of a 1,000-customer base
and a €61 sale a tenth. The check sits on a cliff (65 s already fails) because the mechanic
measures the wrong thing: in a 20,000-person town both players convert everyone within the hour,
so a customer-count gate can only be met by punishing every single sale.

Two validator runs of earlier drafts showed where the fed player's money really comes from. Not
from MegaMeat, whose payments the euro flood caps at about €330 per second, and not from its
customers either once the scandal cuts their orders: from the **biogas plant**. It buys finished
products unlimited, unflooded and without any moral price (Leverkas at €17, Hafer-Cappuccino at
€8, Tofu-Wurst at €2). MegaMeat cash in the first twenty minutes buys the Leverkas oven at 16–23
minutes instead of 51; from then on every oven earns €4.25 per second from the biogas plant with
zero customers, and the scripted player keeps buying ovens because that surplus counts as income.
With the scandal on reach and orders the fed player still earned 2.6–4.6 × the fair player, €4–9M
of it from the biogas plant. Any early capital snowballs through that sink, for the fair player
too (late in the hour €0.84M of its €3.84M is bulk).

The user chose: feeding MegaMeat hurts the player's growth and sales, not the customers they
already have; and the biogas plant's finished-product markets flood like MegaMeat's, so surplus
stays a capped bonus.

The concept doc did not plan this change in its section 8 sequence; it revisits the price of
feeding MegaMeat and the flooded market from `megameat-outbids`, the campaign reach from
`aktionen-and-megameat` (row 7) and the order rate from `sales-and-customers` (row 5).

## What Changes

- **MegaMeat scandal** replaces the customer loss. Every euro a MegaMeat sale pays raises a
  scandal level (in euros); the level halves every 10 minutes of game time. While it is up, one
  scandal factor K ÷ (K + scandal), K = €10,000, applies twice: campaigns win the factor times
  their customers, and customers place the factor times their orders. A €10,000 scandal halves
  campaigns (as MegaMeat's study does) and halves the town's orders. Existing customers are never
  lost to a sale. A player who keeps feeding MegaMeat keeps their customers, but on average they
  order at about a fifth of the normal rate; a single €529 sale costs 5% and fades within about
  half an hour.
- **Biogas products flood.** The biogas plant's markets for Tofu-Wurst, Hafer-Cappuccino and
  Leverkas flood exactly like MegaMeat's (K = €1,575 of full-price sales, halving every 20 s), so
  each pays at most about €55 per second. Its raw ingredients and intermediates stay unflooded,
  so the "surplus to the biogas plant" story of a balanced chain is untouched. The biogas offers
  for products show the market meter MegaMeat's do.
- The awareness cost (1 point per €10) stays as it is.
- The feed horizon is removed from the content; the customer income stays (unchanged
  requirement, used by later acts).
- MegaMeat's sell buttons show the awareness cost and one percentage: how much less campaigns
  would win and customers would order right after the sale. The Verkauf tab and the Aktionen
  panel show the scandal while it costs at least 1%, with the game time until it is below 5%.
- The simulated fed player is measured against two gates: fewer customers than the fair player
  at 30 minutes, and at most three quarters of the fair player's total earned at 60 minutes.
  Validator numbers with these values: fed 0.56 × fair, fair −0.7%, tempted and crossover
  unchanged.
- Concept doc section 3.3 describes the scandal and the biogas flood instead of the customer
  loss.

## Non-goals

- A scandal banner like the counter-events, a news ticker headline, or a fact-check response to
  the scandal (the tab line is enough for v1; a headline can come with content work).
- Changing MegaMeat's prices, MegaMeat's flood, the biogas plant's prices or the awareness cost
  (the user rejected weakening MegaMeat's early cash and a lower biogas price).
- Flooding the biogas plant's raw and intermediate markets.
- Removing the customer income from the state.
- Changing how the tempted or fair scripted players sell.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `bulk-sales`: Price of feeding MegaMeat loses the customer loss and gains the scandal; the
  Flooded market covers the biogas plant's finished products; Market flood is saved covers the
  biogas floods; a new MegaMeat scandal requirement holds the level, its decay, the factor on
  reach and orders, the display and the save.
- `aktionen`: Running an Aktion multiplies the campaign reach by the scandal factor.
- `sales`: Open orders and the Demand figure multiply the order rate by the scandal factor.
- `dev-tools`: the Bulk buyer table shows the biogas products' caps; the Simulated playthrough's
  Feeding the industry scenario becomes fewer customers at 30 minutes and at most three quarters
  of the money at 60.

## Impact

- `src/game/content/buyers.ts` (`feedCost`: awareness only, plus scandal K and half-life; the
  biogas plant gets the flood for its products), `src/game/systems/bulkSales.ts` (feed cost,
  scandal raise and decay, factor, cost preview; flood per buyer), `src/game/systems/aktionen.ts`
  (reach factor), `src/game/systems/sales.ts` and `salesStats.ts` (order rate, demand figure),
  `src/game/balance/steady.ts` and `player.ts` (steady income and the rescue valuation take the
  demand factor; surplus income follows the biogas flood cap), `src/game/balance/curves.ts`
  (bulk table caps), `src/game/tick.ts` (decay), `src/game/state.ts` and `save.ts` (new
  `megaMeatScandal` and `biogasFlood`, migration), the Verkauf and Aktionen panels, the MegaMeat
  and biogas offer components (Svelte + DE/EN strings).
- Tests: `bulkSales.test.ts`, `aktionen.test.ts`, `sales.test.ts`, `salesStats.test.ts`,
  `steady.test.ts`, `curves.test.ts`, `save.test.ts`, `simulate.test.ts` (fed gates),
  `tick.test.ts`.
- `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md` section 3.3.
- Existing saves load with no scandal and fresh biogas markets; customers already lost to sales
  are not restored.
- Depends on the archived `chain-proportions` (95239d6). `customer-demand-curve` modifies the same
  Open orders and Demand requirements and is queued after this change; its deltas are re-based
  on the archived text.
