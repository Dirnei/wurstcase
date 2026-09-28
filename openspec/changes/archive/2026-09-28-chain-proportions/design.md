# Design: chain-proportions

## Context

See proposal.md - Why. What we found in the code:

- `content/crops.ts`, `processors.ts`, `products.ts` hold each building's `rate` (fields: units per
  second; others: runs per second), `input.ratio`, `basePrice`, `priceGrowth` and `unlockAt`.
  `systems/buildings.ts` prices a copy at `basePrice × priceGrowth^owned`; `content/upgrades.ts`
  prices a chain milestone at the multiple of every building's price at the milestone count.
- A balanced set per product building follows from the rates alone: product building needs
  `rate × ratio` intermediates per second, each processor makes `rate` per second, and so on. At
  base values: soy 1.5 : 1 : 1, oat 0.5 : 0.5 : 1, wheat 1 : 1 : 1. `balance/value.ts`
  `chainBalance` already walks the chain this way and scales to whole numbers.
- `systems/bulkSales.ts` keeps `state.megaMeatFlood[resource]` in units and reads one `K`
  (`halfPriceUnits`) and `H` from `content/buyers.ts`; MegaMeat's pegged prices are 1.05 × the
  chain product's price for a raw ingredient and half that for an intermediate, so its markets
  cap at K × ln 2 ÷ H × price: €55/s for soybeans but €218/s for oats and €455/s for wheat.
- `balance/milestones.ts` holds the pacing windows as data; the dev page's pacing table and the
  concept doc's section 5 repeat them.
- Probes over 20 variants (60-minute default, tempted and fed runs) established the numbers
  quoted below; the tree's per-copy prices 400/700/1,000 and 300/400/450 are the worker's best.

**src/game/ files and content entries:** `content/buildings.ts` (chain set growth, set share
helper), `crops.ts`, `processors.ts`, `products.ts` (rates, base prices, `priceGrowth` removed),
`content/buyers.ts` (`halfPriceEuros` replaces `halfPriceUnits`), `content/upgrades.ts`
(milestone price), `systems/buildings.ts` (price rule), `systems/bulkSales.ts` (euro flood),
`save.ts` (flood reset), `balance/milestones.ts` (windows), `balance/curves.ts` (payback header
data). Dev page header component for the growth list.

## Goals / Non-Goals

**Goals:**
- The proportion rule holds for every chain by construction and is guarded by a test.
- A chain's cost scales with the sets the player owns, so the crossover of later chains
  (`crossover-balancing`) is a property of the set growth, not of how many copies a set needs.
- MegaMeat stays the tempting early shortcut and the losing hour-long strategy, whatever the
  field prices are.

**Non-Goals:**
- Tuning soy; it already follows the rule and is the pacing backbone.
- A per-resource feed cost or a change to MegaMeat's pegged prices.

## Acceptance (the simulation's gates)

1. Proportion rule and price order for every chain (content test).
2. Chain set payback chart: soy starts below oat and is above it by set 24; oat below wheat and
   above it by set 24 (unchanged test).
3. Tempted player: ahead of the fair player at 5 and 10 minutes; fair earns at least 1.5 × tempted
   at 60 minutes.
4. Fed player (fair strategy, MegaMeat as surplus buyer) ends with at most half the fair player's
   customers.
5. Pacing: first Leverkas oven within 20–55 min (widened from 20–40 in tuning, see 7), first cow within 18–35 min; the other rows are
   reported, not gated.

## Decisions

### 1. Change the early steps' rates, keep the product buildings

The café bar (0.5 Hafer-Cappuccino/s) and the Leverkas oven (0.25 Leverkas/s) keep their rates, so
customer demand and product income per product building do not move. The target 2 : 1.5 : 1 comes
from slowing the processors and fields:

- Oat: mill 1/3 run/s → 1.5 mills per café bar; they use 1 oat/s → 2 fields at 0.5/s.
- Wheat: seitan kitchen 1/3 run/s → 1.5 per oven; they use 1 wheat/s → 2 fields at 0.5/s.

- *Alternative: speed up the product buildings.* Rejected: doubles product output per building and
  with it demand pressure and income, a much bigger balance change.
- *Alternative: change recipes.* Rejected: recipes are also the manual actions' ratios and the
  flavour ("3 soybeans → 1 tofu").

### 2. Prices grow per balanced set

Each chain gets one `setGrowth`; a building's share of a set is its fractional count per product
building, derived from the rates (soy 1.5 / 1 / 1, oat and wheat 2 / 1.5 / 1). Price of the next
copy = `basePrice × setGrowth^(owned / share)`, rounded up; a milestone at count `at` costs the
multiple of `Σ basePrice × setGrowth^((at − 1) / share)`. Owning one whole set of a chain then
multiplies every price in that chain by `setGrowth` exactly once, so the k-th set's price is the
first set's × `setGrowth^(k − 1)` regardless of how many copies the set needs.

Why this and not the alternatives:

- *Per-copy growth (today).* The 24th oat set costs 1.11^95 field prices; no price set crosses.
  The tree's best set gives set-24 paybacks of 32K / 1.3M / 174K s for soy / oat / wheat.
- *Per-copy growth normalised to the field* (fields keep 1.13, kitchens 1.13^1.5). Steepens the
  soy kitchen to ×1.20 per copy; the fair player's hour collapses from €3.0M to €0.65M, Leverkas
  lands at 52 min. Soy growth is the sim's most sensitive knob (1.16 per set: €0.9M), so soy keeps
  1.13 per set and its fields get a little cheaper (×1.085 per copy) as the price of a uniform rule.
- *Set growth with oat and wheat at 1.11 / 1.09.* Crossover still fails (set 24: 7.9K / 30.9K /
  7.4K s). The set-24 bound from the set prices and incomes is oat ≤ 1.078 and wheat below oat's
  set-24 payback; 1.07 / 1.06 give 7.9K / 5.6K / 2.0K s with margin. That bound ignores set 1:
  a later chain must also *start* behind, so its first set's price ÷ income must exceed the earlier
  chain's. Set growth does not touch set 1, only base prices do: at oat €400 / €700 / €1,000
  (5,700 ÷ €12/s = 475 s) the wheat set (4 fields, 3 kitchens, 2 ovens for €12.50/s) must cost
  more than about €6.2K, which the €300 / €400 / €450 starting prices (€3,300, 264 s) miss.

Set shares are derived, not stored, so a future rate change cannot leave a stale share; the
content test that checks the proportions covers the derivation. The dev page header lists the
resulting per-copy growth so the author can read the old numbers off it.

### 3. MegaMeat's flood is measured in euros

The half-price flood becomes K = €1,575 of full-price sales for every market (500 soybeans, and
therefore 125 oats, 60 wheat, 1,000 tofu, 250 oat drink, 120 seitan at base prices), with the
flood level kept in euros of full price and H unchanged. Every market then pays at most
K × ln 2 ÷ H ≈ €55 per second, MegaMeat about €330 per second in all, instead of about €1,090.

Why the flood and not the prices: with per-set growth, oat and wheat fields grow ×1.034 and
×1.030 per copy, and there is no price set that both crosses the chains and keeps fields dear.
The fed player's advantage (€12.8M against €5.0M in an hour) is bought at MegaMeat's oat and wheat
markets, whose euro ceilings are 4× and 8× the soybean market's only because the flood counts
units. A euro flood removes that asymmetry, leaves every soybean scenario numerically the same,
and keeps the tempted player's early lead, which lives on the soybean market. The tempted player
is not the problem (its ratio stayed ×3.6 with cheap fields): the caps already hold it.

- *Alternative: lower K for all markets (250 units).* Halves the soybean ceiling too; the tempted
  player loses its 10-minute lead (€14.6K against €24.4K).
- *Alternative: shorten the feed horizon (8 min → 2 min).* Reaches the feed check (51%) even
  without the euro flood, but leaves MegaMeat paying €1,090/s and makes every sale cost four times
  the customers, which changes the megameat-outbids story more than the market cap does. Kept as
  the fallback if the euro flood alone does not reach 50%; then the Price of feeding MegaMeat
  requirement joins the bulk-sales delta with recomputed scenarios.
- *Alternative: per-resource K in units (500 / 125 / 60 …) with the flood still in units.* Same
  economics, but the state would have to be migrated per resource and the caps would drift with
  product price upgrades; euros of full price are the quantity the cap is about.

Floods in old saves are reset to 0 on load (the migration drops the map): a flood halves every
20 s, so nothing of value is lost.

### 4. Pacing windows

`milestones.ts`: first Leverkas oven [20, 55] (tuned; see 7), first cow [18, 35]; the dev-tools pacing table and
the concept doc's section 5 row change with them. The user treats the windows as guidelines and
will playtest; the head of development set the cow's edge at 18. With the model above the
Leverkas lands at 37–38 min and the cow at 18.0 min, the soy fields' slightly lower growth being
the cause. Raising the soybean field's base price to €15 moves the cow to 19.5 but the Leverkas
to 44.6, so the cow is not tuned through soy.

### 5. The rule as a content test

`content.test.ts` computes each chain's balanced counts from `CHAIN_RESOURCES` and the building
defs (walking back from the product building) and asserts `field ≥ processing ≥ product`,
`field > product`, and `basePrice` strictly ascending along the chain. Any future chain inherits
the check. (Already in the tree.)

### 6. Rates of 1/3

A rate of 1/3 run per second is fine for whole-unit production (progress accumulates as a float;
runs complete every 3 s). The card shows "0.33 oat drink/s"; the fixed-decimal form keeps it
stable.

### 7. Tuning result

Final values: set growth 1.13 / 1.07 / 1.06 and K = €1,575 as designed; oat €250 / €500 / €700,
wheat €400 / €600 / €900; feed horizon 1 minute; first Leverkas oven window 20–55 min.

- Starting prices (oat €400 / €700 / €1,000, wheat €300 / €400 / €450): crossover at set 1 failed
  (oat 496 s, wheat 274 s); fed player 87% of the fair customers.
- Wheat only raised (€500 / €800 / €1,200, the fallback): crossover holds, fair €2.39M, Leverkas
  50.5 min, fed 84% at 8 minutes.
- A bounded experiment with cheaper oats (6 variants, wheat around €400 / €600 / €900) found no
  set with the Leverkas under 45 min (47.4–53.8). The chosen set is the only one that keeps the
  fair player at or above the €3.38M baseline: set-1 paybacks 58 / 340 / 432 s, set 24 7,883 /
  3,813 / 3,151 s; tempted €12.5K / €25.5K / €0.39M against fair €4.0K / €24.4K / €3.83M at 5 /
  10 / 60 min (×9.8); Leverkas 51.9 min, cow 20.0 min. (Oat €350 / €600 / €900 with wheat
  €450 / €650 / €950 gave the earliest Leverkas, 47.5 min, but fair only €3.09M.)
- Feed horizon, from long to short on the chosen prices: 120 s 57%, 90 s 54%, 75 s 56%, 70 s 54%,
  65 s 52%, 60 s 38%. Only the 60 s floor reaches the feed check, and the step from 65 s is a cliff:
  a small change elsewhere can tip it back over 50%, so the simulation test guards it. Money,
  pacing and the tempted checks do not depend on the horizon.

## Risks / Trade-offs

- [Feed check still above 50% with the euro flood] → shorten the feed horizon (probe: 120 s gave
  51% with the units flood), add the feed requirement to the bulk-sales delta; report to the head
  of development before touching it.
- [Soy fields ×1.085 per copy speed up the first 20 minutes: pig 8.3 min, cow 18.0, tempted lead at
  10 min thin (€25.5K against €24.4K)] → the tempted check is a gate; if it fails, raise the soy
  set growth only as far as the Leverkas window allows, else raise the soybean field's base price
  by €1–2 and re-check both.
- [The scripted player is hypersensitive to soy growth] → tune oat and wheat set growth within the
  crossover bound (oat ≤ 1.078) before anything in soy.
- [Existing saves with many oat/wheat fields produce less per field and see new prices] → accepted
  before release; the buildings are kept.
- [The dev page's growth header and every test that hard-codes ×1.13 per soybean field] → listed
  in tasks; the spec scenarios carry the new numbers.

## Migration Plan

No data migration for buildings. The save migration drops `megaMeatFlood` (fresh markets). Roll
back by reverting the commit.

