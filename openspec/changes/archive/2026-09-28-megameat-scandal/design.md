# Design: megameat-scandal

## Context

See proposal.md - Why. What we found in the code and the numbers:

- `systems/bulkSales.ts` `feedCostOf` computes customers lost = customers × euros ÷ (customer
  income × horizon) and awareness lost = euros ÷ 10; `bulkSell` applies both. `content/buyers.ts`
  holds `feedCost: { horizonSeconds: 60, eurosPerAwareness: 10 }`. `bestBuyer(withoutFeedCost)`
  lets the fair scripted player avoid buyers with a feed cost.
- The flood is MegaMeat-only: `state.megaMeatFlood[resource]`, `getBuyer('megaMeat').flood`,
  `marketLevel`/`floodedValue`/`timeUntil` read that one map, and `BuyerDef.flood` is documented
  "only for pegged prices". The biogas plant sells in fixed lots (`lots`), 1 unit per product.
- `systems/aktionen.ts` `aktionEstimate` multiplies a campaign's customers by
  `activeFactors(state).reach` (MegaMeat's study: ½) and the upgrade reach factor, then by the
  unconverted share. `systems/sales.ts` `orderRate` multiplies customers by the flat rate and
  the loyalty-card factor; `salesStats.ts` `demandPerMinute` repeats it; `balance/steady.ts`
  `steadyIncome(buildings, customers, upgrades, surplusBuyer)` repeats it once more for the
  scripted player and prices surplus at the surplus buyer's unit price; `player.ts`
  `rescueScore` prices the customers a rescue wins with it.
- Validator, reach-only draft, on 95239d6: fed earned 4.1–5.2 × fair at every corner. Reach +
  orders draft: 2.6–4.6 ×, a separate orders K down to 1,000 changing nothing, because the money
  changes buyer: MegaMeat pays at most €328/s, the fed run's bulk income was €5.3–10.3M, so
  €4–9M came from the biogas plant. It buys Leverkas at €17, unlimited and unflooded; MegaMeat
  cash buys the oven at 16–23 min (fair 51.5) and each oven then earns €4.25/s with zero
  customers. Variant A (biogas products flood like MegaMeat's) at the scandal's starting values:
  fed 0.94 × fair, fed bulk €6.57M → €0.86M, fair −0.7%, tempted and crossover unchanged. With
  the scandal at K 10,000 / H 600: fed 0.56 × fair (mean order factor 0.19, fed Leverkas at
  23.0 min); 5k/300: 0.42; 5k/600: 0.32; 5k/120, 12.5k/360 and 20k/600 fail (1.05–1.23). The
  ratio is almost linear in the mean order factor; 0.75 sits near 0.21. Planning surplus at 0
  (B) broke the fair run (€0.59M, no oven); biogas at 40% (D) gave 1.43 and cost the tempted
  lead.

**src/game/ files and content entries:** `content/buyers.ts` (`feedCost` becomes
`{ eurosPerAwareness, scandal: { halfReachEuros: 10_000, halfLifeSeconds: 600 } }`; the biogas buyer
gets `flood: { halfPriceEuros: 1_575, halfLifeSeconds: 20, resources: PRODUCTS }`),
`systems/bulkSales.ts` (flood per buyer, scandal raise, decay, `scandalFactor(state)`, preview),
`systems/aktionen.ts` (reach), `systems/sales.ts` and `salesStats.ts` (orders, demand figure),
`balance/steady.ts` (`steadyIncome` gains a demand factor argument, default 1; surplus income
already follows `surplusIncome`, which must read the biogas cap), `balance/player.ts` (passes the
scandal factor; rescue valuation likewise), `balance/curves.ts` (bulk table caps for biogas
products), `tick.ts` (decay call), `state.ts` + `save.ts` (`megaMeatScandal: Decimal`,
`biogasFlood: Partial<Record<ProductId, Decimal>>`, migration), the Verkauf and Aktionen panels,
the MegaMeat and biogas offer components with DE/EN strings.

## Goals / Non-Goals

**Goals:**
- Feeding MegaMeat is a trade-off the player can read: money now, fewer sales and slower growth
  for a while.
- No bulk buyer is an unlimited sink for finished products, so early capital cannot snowball.
- The fed scripted player is measurably behind the fair one in money and customers, with a check
  that moves smoothly with the knobs.

**Non-Goals:**
- Any change to what MegaMeat or the biogas plant pays per unit.
- A scandal banner or ticker headline (content work, later).

## Acceptance (the simulation's gates)

Hard gates, checked on the archived `chain-proportions` content (95239d6):

1. Feeding the industry: the fed run (fair strategy, MegaMeat as surplus buyer) has fewer
   customers than the fair run at 30 minutes and has earned at most 0.75 × the fair run's total
   at 60 minutes. The customer half is read at 30 minutes because both runs can sit near the
   20,000 town by the hour's end, where "fewer" would be decided by a hair or fail on equality.
2. Tempted player: ahead of the fair player at 5 and 10 minutes; fair earns at least 1.5 × tempted
   at 60 minutes.
3. The fair run keeps its money: total earned at 60 minutes within 3% of the run before this
   change (the biogas flood must not cost the fair player; the validator saw −0.7%).

Reported, not gated: the fed run's customer share of the fair run, the mean order factor of the
fed run, the pacing table (the fed run's Leverkas time in particular), and how much the fed run
sells to MegaMeat and to the biogas plant.

Knobs and ranges: scandal `halfReachEuros` K from 5,000 to 10,000 (start 10,000) and
`halfLifeSeconds` H from 300 to 600 s (start 600 s); the validator's passing points are 10k/600
(0.56), 5k/300 (0.42) and 5k/600 (0.32), so the range is the passing band and the start is its
mildest corner. The biogas flood shares MegaMeat's K and H and does not move. No other value
moves; `eurosPerAwareness` stays 10. Stop condition: if gate 1 or 3 fails anywhere in the band,
the change comes back to the product owner with the fed run's money, customers, order factor,
Leverkas time and bulk units at the corners.

## Decisions

### 1. Sales hurt growth and sales, not the customers the player has

Scandal S in euros; one factor K ÷ (K + S) applies to campaign reach and to the order rate.
Alternatives considered, in order:

- *Keep the customer loss, fix only the gate.* Leaves a mechanic whose bite depends on the
  customer income at the moment of the sale: cheap early, brutal later, and at any horizon either
  a cliff or no effect. The user chose the growth-based feel.
- *Lower the awareness rate while the scandal lasts (like the ad campaign).* Awareness only fills
  the pool; the fed player is rich in animals and refills it, so the earlier probe showed halving
  the awareness price changed the outcome by nothing.
- *Reach only.* Left the fed player's income untouched (Context): its customers kept ordering,
  and its surplus went to the biogas plant.
- *Weaken MegaMeat's early cash (flood cap or raw price).* Would keep the fed player from the
  early oven, but also weakens the tempted lure, which leads by only 4.6% at 10 minutes. Rejected
  by the user.
- *Let feeding pay and gate on customers only.* Makes MegaMeat the dominant strategy and empties
  the game's central choice. Rejected by the user.
- *Reach and orders (chosen).* Orders are the income the fed player lives on, and "customers buy
  less from a brand that feeds the industry" is what a scandal means. One K keeps the yardstick
  simple: €10,000 halves both, like the study halves campaigns.

The saturating form K ÷ (K + S) reuses the flood's shape, so a scandal can never push reach or
orders to zero, and every extra euro hurts a little less.

### 2. The biogas plant's product markets flood

Without it the scandal cannot reach the money: the fed player turns MegaMeat cash into ovens and
the ovens' Leverkas into biogas euros with no customers involved. Flooding the three product
markets with MegaMeat's K and H caps each at about €55/s (about €164/s for all three), which is
a bonus, not a business; the fair player, whose surplus is small and spread, loses 0.7%. Raw
ingredients and intermediates stay unflooded so a balanced chain's small surplus still has a
free outlet and the "Biogas is not flooded" story survives for the resources it was written for.

- *Value surplus at 0 when planning (B, and A+B).* Broke the fair run (€0.59M, no oven ever):
  the scripted player needs surplus income to justify the first oat and wheat buildings.
- *Biogas products at about 40% of the market value (D).* Fed 1.43 × fair, and it costs the fair
  run 4% and part of the tempted lead: a weaker A that hurts the honest player more.

Implementation shape: the flood becomes per buyer. `BuyerDef.flood` gains `resources` (the
markets that flood; MegaMeat: all it buys, biogas: the products), the state gets `biogasFlood`
beside `megaMeatFlood` (two maps rather than a nested one, so the save shape stays flat and the
migration is one added field), and `marketLevel`, `floodedValue`, `timeUntil` and `recover` take
the buyer. Lot pricing for the biogas plant stays lot-based; the flood scales the lot price like
it scales MegaMeat's full price. The offer components share the meter.

### 3. Starting values from the passing band

Scandal K = €10,000, H = 600 s: the mildest corner the validator found passing (fed 0.56 × fair).
A fed player at MegaMeat's €330/s cap sits at S ≈ €286,000 (factor 3%); a soybean-only dumper at
€55/s at S ≈ €48,000 (17%); a single €529 sale costs 5% and is below 1% again after about 24
minutes. Harsh, but shown before the sale, on one meter, and recoverable, unlike the 88% wipe
on main. The band 5,000–10,000 × 300–600 s is the validator's; the head of development tunes
inside it if the fed ratio drifts once `customer-demand-curve` lands.

### 4. The scandal is state, not an event

It lives beside `megaMeatFlood` as one Decimal, not as a counter-event: it has no fixed duration,
it stacks with the study, and it must not touch the event rotation. Decay is exact for any tick
length (`S × 2^(−seconds ÷ H)`), like the flood, so offline progress and tests agree.

### 5. The scripted player sees the factor and the cap

`steadyIncome` and `rescueScore` price customers at the flat rate; with the scandal in play the
fed player would overvalue kitchens and rescues. `steadyIncome` takes a demand factor (default 1)
and `player.ts` passes `scandalFactor(state)`. Its surplus income must also respect the biogas
cap (as `surplusIncome` already does for MegaMeat's flood), or the scripted player keeps buying
ovens for a market that no longer pays. Without both the gate would measure a player who
mis-plans, not the mechanic.

### 6. What the player sees

- Each MegaMeat button: "costs N awareness · −P% sales and campaigns", P the factor's loss right
  after the sale, rounded up to a whole percent (a €60 sale at a fresh scandal shows 1%, €529
  shows 6%).
- Verkauf tab and Aktionen panel: while the loss is ≥ 1%, one line "MegaMeat-Skandal: customers
  order P% less and campaigns win P% fewer, fades in M min" with the game time until the loss is
  below 5% (H × log₂(S ÷ (K ÷ 19)); from €5,000 about 32 minutes, from €10,000 about 42).
  Reserved slots, like the market meter, so nothing jumps.
- Biogas product offers: the same market meter and recovery time MegaMeat's offers show.
- Campaign buttons and the demand figure already show estimates; they simply read lower.

### 7. The fed gate becomes money plus direction

"At most half the customers" measured a share of a saturating town. The new scenario reads:
fewer customers than the fair run at 30 minutes, and at most three quarters of its total earned
at 60. Money is what the fed player is optimising, so it is the right yardstick; the customer
condition keeps the story's "with the customers the industry took", read before the town can
fill. On 95239d6 with the harsh horizon the ratio is 0.93; with this design 0.56.

## Implementation notes (worker)

- **Compact buttons.** MegaMeat's share buttons are about 90 px wide on phones, so the cost line
  shows "−N [awareness art] −P % [MegaMeat mark]" instead of the sentence; the full sentence
  ("costs N awareness · −P % sales and campaigns") is the button's accessible name and the
  percentage's tooltip. Same compact pattern as the cost line from `bulk-sell-shares`.
- **Fade time.** An early spec draft said about 19 minutes from €5,000 at H = 300 s; the formula
  H × log₂(S ÷ (K ÷ 19)) gives 16.2 minutes there. At the final H = 600 s the tests use 32.5 minutes
  from €5,000 and 42.5 from €10,000 (the spec's "about 42").
- **One scandal line component** (`ScandalLine.svelte`) serves the Verkauf tab (under the bulk
  buyers' hint) and the Aktionen panel, so both read the same figures and reserve the same space.
- **Scandal line height.** The line wraps to 2–3 lines on tablets and phones, so a one-line
  reserve would still push the page down when it appears. An invisible copy of the longest line
  (100 %, 100 min) shares the grid cell, as the news ticker does; measured 21/42/63 px shown and
  hidden alike at 1280/900/375/320 in DE and EN.
- **No import cycle.** The demand figure multiplies by `scandalFactor` itself instead of calling
  `orderRate`, because `sales.ts` already imports `salesStats.ts`.
- The scripted player's steady income, rescue valuation and the dev page's upgrade offers all
  pass `scandalFactor(state)` as the demand factor.
- **Flood per buyer.** `isFlooded(buyer, resource)` decides which markets flood (MegaMeat: all it
  takes; biogas: `flood.resources`, the products). `marketLevel`, `floodedValue` and
  `timeToRecover` take the buyer as a last argument defaulting to MegaMeat, so MegaMeat callers
  and tests stay unchanged. A biogas product's full price is its lot price per unit.
- **Steady surplus at the biogas plant.** Surplus MegaMeat does not take (products) goes to the
  best buyer without a feed cost; its value now follows the settled flood there too, so the
  steady model tops out at about €55/s per product (test: 25 surplus Leverkas/s → €48.4/s).
- **One save step.** Save format 14 → 15 adds both the scandal (0) and the biogas floods ({}),
  since nothing shipped between the two parts of this change.

### Tuning result

Final values: scandal K = €10,000, H = 600 s (the starting values; no tuning needed). Pre-change
fair run €3,837,259 at 60 min.

| K / H | Fed ÷ fair earned (60 min) | Fed / fair customers at 30 min | Fed Leverkas | Gate 1 |
|---|---|---|---|---|
| 10,000 / 600 (final) | 0.54 | 2,161 / 9,245 | 25.3 min | pass |
| 5,000 / 300 | 0.43 | 1,504 / 9,245 | 24.8 min | pass |
| 5,000 / 600 | 0.34 | 1,137 / 9,245 | 22.0 min | pass |
| 10,000 / 300 (outside the band's pass area) | 0.92 | 2,949 / 9,245 | 20.5 min | fail |

Fair run at every setting: €3,809,193 (−0.73% against the pre-change run; gate 3 holds), customers
at 60 min 17,990; tempted €12.5K / €25.5K / €0.39M against fair €3.9K / €24.1K / €3.81M. Fed run at
the final values: 21% of the fair customers at 60 min, 655,180 units to MegaMeat, 190,625 to the
biogas plant. The fed run's mean order factor was not measured (validator: 0.19).


## Risks / Trade-offs

- [A human player who feeds once is hit twice (sales and campaigns) and for a long time] → both
  effects fade with one meter and one number, the button warns before the sale, and a single
  €529 sale costs 5%; the concept's promise is that feeding wins the first minutes and loses the
  hour, and the fed run now does exactly that (0.56).
- [The biogas flood makes a balanced chain's product surplus feel penalised] → only products
  flood, at MegaMeat's generous K; €55/s per product is more than any balanced chain spills
  in Act 1; the meter shows why a price dips.
- [`customer-demand-curve` reshapes late income (fair €13.9M at knee 500 on the flat gate) and
  moves the fed ratio] → it carries the same gate and is re-based on this change; the head of
  development tunes the scandal inside the band if needed.
- [Players read the scandal as a second flood meter] → different words (percent less sold and
  fewer won, minutes to fade) and shown where the effect is felt, on both tabs.
- [Existing saves keep the customers already lost] → accepted; nothing to restore them from.

## Migration Plan

Save format +1: add `megaMeatScandal` = 0 and `biogasFlood` = {}. Roll back by reverting the
commit; a save written with the new fields loads in the old version with them ignored.
