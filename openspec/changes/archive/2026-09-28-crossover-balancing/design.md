# Design

## Context

See proposal.md (Why) for the motivation. The relevant state of the code:

- Prices come from two shared constants: `PRICE_GROWTH = 1.1` in `src/game/systems/buildings.ts`
  (buildings, and shelters through `rescue.ts`) and `PRICE_GROWTH_ANIMALS = 1.2` in
  `src/game/content/animals.ts`.
- Building output is `count × rate × rateFactor(state, id)` in `src/game/systems/production.ts`.
  `rateFactor` only looks at owned upgrades. The same product appears in
  `src/game/balance/steady.ts`, `src/game/balance/curves.ts` and `src/ui/BuildingCard.svelte`.
- `CHAINS = ['soy', 'wheat', 'oat']` sets the order of chains in the production tab, the dev page
  and the scripted player. `BUILDINGS` is `[...FIELDS, ...PROCESSORS, ...KITCHENS]`, and
  `steadyOutput` depends on every building coming after the one that makes its input.
- `steadyIncome` counts only customer sales. The scripted player in `src/game/balance/player.ts`
  never sells in bulk, so surplus is worth nothing to it.
- The 60-minute baseline run (2 clicks/s) before this change: 506 €/s and 466 customers at the
  end; first Leverkas oven at 10.0 min, first oat field at 43.6 min.

## Goals / Non-Goals

**Goals:**
- Growth, milestones and bulk shares are content data, so tuning means editing numbers only.
- One place computes a building's output factor, so the game, the steady model, the curves and
  the building card cannot disagree.
- The dev page shows the crossovers directly (chain set payback chart).

**Non-Goals:**
- No save migration. Nothing in the save format changes.
- No new UI for bulk selling; the scripted player's bulk selling exists only in `src/game/balance/`.

## Decisions

### Price growth lives on each content entry

`BuildingDef`, `ShelterDef` and `SpeciesDef` get a required `priceGrowth: number`. The shared
constants `PRICE_GROWTH` and `PRICE_GROWTH_ANIMALS` are removed; `buildingPrice`, `shelterPrice`
and `animalPrice` read the entry's own value.

Values (starting point; see the table in the production-chain delta spec for base prices and
unlocks):

| Tier | Buildings | Shelters | Species |
|---|---|---|---|
| 1 | soy chain 1.13 | stable 1.13 | chicken 1.25 |
| 2 | oat chain 1.11 | — | pig 1.18 |
| 3 | wheat chain 1.09 | pasture 1.09 | cow 1.12 |

Why per entry rather than per chain: it matches "content is data", lets a later pass give a
field and a kitchen different growth, and shelters and species do not belong to a chain anyway.
Alternative considered: a `CHAIN_GROWTH` map keyed by chain; rejected because shelters and
species would need their own maps.

Why these numbers: a model of the balanced set payback (set price ÷ set income, each building at
its own growth) gives, with the new base prices:

| Set # | Soy | Oat | Wheat |
|---|---|---|---|
| 1 | 58 s | 293 s | 864 s |
| 5 | 173 s | 583 s | 1,220 s |
| 8 | 405 s | 1,000 s | 1,580 s |
| 12 | 1,321 s | 2,115 s | 2,230 s |
| 16 | 4,585 s | 4,584 s | 3,147 s |

Soy crosses oat at about the 7th soy set; oat crosses wheat at about the 7th oat set. After a
crossing the lines drift apart, so the older chain goes stale instead of running in lockstep.
The model ignores milestone multipliers; the dev page chart includes them, and the tuning task
checks that the crossovers survive. The soy chain's 1.13 is above the 1.10 that
`gentler-building-prices` chose; the price wall that change removed is now intended, because a
cheaper next tier is waiting behind it.

### Oat chain second, wheat chain third

`CHAINS` becomes `['soy', 'oat', 'wheat']`, and the entries in `crops.ts`, `processors.ts` and
`products.ts` are reordered to match. That keeps the "input before consumer" order of `BUILDINGS`
and shows the chains in unlock order in the production tab. Product prices stay (€3, €12, €25),
so each tier sells for more per order. Leverkas stays the flagship and becomes the last unlock.

Alternative considered: keep wheat second and raise the Hafer-Cappuccino price above Leverkas.
Rejected: it would take the flagship role away from Leverkas.

### Milestone multipliers

New content in `src/game/content/buildings.ts`: `OWNED_MILESTONES = [25, 50, 100]` and
`MILESTONE_FACTOR = 2`. A new system file `src/game/systems/ownedMilestones.ts` exports:

- `milestoneFactor(owned: number): number`: 2 to the number of milestones reached.
- `nextMilestone(owned: number): { at: number; factor: number } | null`: for the building card.
- `outputFactor(state, id): number`: `rateFactor(state, id) × milestoneFactor(state.buildings[id])`.

`production.ts` and `BuildingCard.svelte` switch to `outputFactor`. `steadyOutput` takes counts
that are not the state's, so it calls `milestoneFactor(count) × rateFactor(...)` itself.
`curves.ts` uses `milestoneFactor` for income of n copies.

The factor applies to the whole building type, not to the copies past the threshold, as in
AdVenture Capitalist; that is what makes the 25th copy a big jump. The first plan was 10/25/50;
the simulation ran away with it (€16k/s at 60 min, against €506/s before this change), so the
tuning pass moved to AdVenture Capitalist's own spacing. Name chosen so it does not
clash with `src/game/balance/milestones.ts` (pacing milestones).

### Bulk shares by chain step

Lots in `src/game/content/buyers.ts` (vegan value per unit in brackets):

| Resource | MegaMeat lot | Share | Biogas lot | Share |
|---|---|---|---|---|
| Soybeans (€1) | 5 for €2 | 40% | 10 for €3 | 30% |
| Oats (€6) | 5 for €12 | 40% | 5 for €9 | 30% |
| Wheat (€6.25) | 2 for €5 | 40% | 8 for €15 | 30% |
| Tofu (€3) | 1 for €2 | 67% | 2 for €3 | 50% |
| Oat drink (€12) | 1 for €8 | 67% | 1 for €6 | 50% |
| Seitan (€12.50) | 3 for €25 | 67% | 4 for €25 | 50% |
| Tofu-Wurst (€3) | — | — | 2 for €3 | 50% |
| Hafer-Cappuccino (€12) | — | — | 1 for €6 | 50% |
| Leverkas (€25) | — | — | 2 for €25 | 50% |

Stated as ranges in the spec (35–45%, 60–70%, 25–35%, 45–55%) so whole-euro lots fit. A content
test checks every rule of the "Bulk buyers" requirement against the lots, using `veganValue`, so
a later retune cannot quietly break them. Vegan values use base product prices, not upgraded
ones, as the bulk buyer table already does.

### Price of feeding MegaMeat

`BuyerDef` gets an optional `feedCost: { eurosPerCustomer: 100, eurosPerAwareness: 10 }`, set only
on MegaMeat. `bulkSell` applies it after the sale: customers lose `ceil(euros / eurosPerCustomer)`
but stay at or above `STARTING_CUSTOMERS`; the awareness pool loses `ceil(euros / eurosPerAwareness)`
but stays at or above 0. A `bulkSaleCost(state, buyer, resource)` preview returns both numbers for
the sell button (`bulk.cost` in `en.json` and `de.json`). No new state: rounding up per sale means
many small sales cost at least as much as one big one, so there is nothing to carry over.

Why customers and the awareness pool: they are the two things the player builds by being vegan
in public, and feeding the industry works against both. Alternatives considered: a falling price
(market saturation) or a quota; the user chose a moral trade-off instead, which keeps
overproduction as the normal state.

### Bulk sales in the steady model and the scripted player

The scripted player models a customer-focused player: customer sales run on their own, bulk
sales are a manual click, and MegaMeat's sales cost customers. So it uses only buyers without a
`feedCost`, which is the biogas plant.

`steadyIncome` gains a bulk term. For each resource: the part of its flow that the next stage does
not consume (or, for a product, that customers do not order) is sold at the best per-unit price of
a buyer without a feed cost. The player's scoring already compares `steadyIncome` before and after
a purchase, so it values fields whose output customers cannot take without further changes.

`playerStep` gets `sellSurplus`: every 10 s of game time, for each resource, keep the stock that
its consumers use in 30 s (products: 30 s of orders) and sell the rest to that buyer through the
game's own `bulkSell`, whole lots only. Selling through `bulkSell` keeps the run on the one
simulation path.

### Rescues scored by future customers

Before, the player rescued only when no building added income. With bulk sales every building
adds income, so it never rescued and customers stayed at 10. `chooseTarget` now also scores the
best species as a bundle with the production its new customers need. Orders = customers it
converts in 600 s (`CONVERSION_PER_AWARENESS` × its awareness × awareness and conversion upgrades
× share of the town left × 600) × orders per customer. These orders first take the products now
sold to the biogas plant (gain from the steady model with the extra customers). Orders beyond that
surplus need new production of the dearest fully unlocked product: its price goes into the gain,
and the buildings for it go into the price, walking back from the kitchen and stopping at the
first stage whose input is already made in surplus (usually only kitchens are missing). Price also includes the animal and, when space is short, the best shelter. Its payback competes with buildings and upgrades; the kitchens themselves are bought later
as their own purchases, once the customers are there.

Two simpler estimates failed in the simulation: the steady model's marginal customer is worth
nothing while the kitchens are busy, so the player never rescued; valuing customers at the
product price without the production to serve them made it buy 20 cows in a row; charging new
production for every order, even those the surplus could serve, made it rescue almost nothing. The 10-minute horizon is a constant in `player.ts`, tuned in task 7.

### Dev page

- `chainSetPayback(chain, sets = 25)` in `curves.ts`: uses `chainBalance(chain).buildings` for the
  set, buys each set's buildings cheapest first from a state that owns k − 1 sets, and measures
  the added income with `steadyOutput` over that chain's buildings × the product price (demand
  unlimited). Plotted on a new chart next to the payback chart.
- Header: a small table of `priceGrowth` per building, shelter and species replaces the
  "×1.1 per copy" line.
- Demand ceiling chart title adds "(lines differ only by price)".
- `MILESTONES` in `balance/milestones.ts`: oat field 10–20 min, wheat field 20–35, Leverkas oven
  20–35; the soy and animal rows stay.

### Files

Changed content: `crops.ts`, `processors.ts`, `products.ts` (order, base prices, unlocks,
`priceGrowth`), `buildings.ts` (`priceGrowth` in `BuildingDef`, `CHAINS` order, milestone
constants), `animals.ts` and `shelters.ts` (`priceGrowth`), `buyers.ts` (lots, doc comment),
`upgrades.ts` (prices of kneading machine, secret recipe, steam oven, barista course, new
millstones).

Changed systems: `buildings.ts`, `rescue.ts`, `production.ts`; new `ownedMilestones.ts`.

Changed balance: `steady.ts`, `player.ts`, `curves.ts`, `milestones.ts`.

Changed UI: `BuildingCard.svelte` (next milestone line), `DevPage.svelte`; i18n key
`building.nextMilestone` in `en.json` ("×{factor} at {count}") and `de.json` ("×{factor} ab
{count}").

### Tuning result (task 7)

Tuned with the default 60-minute simulation (2 clicks/s), content only:

| Setting | Planned | Tuned |
|---|---|---|
| Owned milestones | 10 / 25 / 50 | 25 / 50 / 100 |
| Oat chain unlock | €1,000 | €30,000 |
| Wheat field, seitan kitchen unlock | €8,000 | €140,000 |
| Leverkas oven | €3,200, €15,000 | €800, €200,000 |
| Pig / cow unlock | €1,500 / €5,000 | €12,000 / €150,000 |
| Rescue horizon (player) | 600 s | 600 s |

Result: first oat field 14.2 min, wheat field 22.3, Leverkas oven 28.0, chicken 3.7, pig 10.7,
cow 22.8 (all in their windows); the first soybean field and tofu press stay early (0.2 and
1.0 min), as they were before this change, because at 2 clicks per second the first €10 comes in
seconds. At 60 min: €2,651/s income, 14,133 customers (71% of the town), 71 residents. The
purchase log shows phases: soy leads to about 15 min, oat from 15 to 25, wheat and Leverkas take
over at 40–50. Chain set payback: soy starts at 58 s and ends above oat, oat starts at 293 s and
ends above wheat.

Side changes the tuning needed:
- Satirical headlines tied to a chain moved with it (barista €30K, seitan €140K, cows €150K,
  pensioner's Leverkas €200K), and the content test's cap on headline thresholds rose to €200K.
- `baseAwarenessRate` sums per species instead of per resident: with 70+ residents the old sum
  made the 60-minute simulation miss its 2-second budget. Same result.

## Risks / Trade-offs

- [Existing saves that own oat or wheat buildings below their new unlocks (€30K, €140K)] → Owned buildings keep producing
  (production does not check unlocks); the card shows as locked with its threshold until it is
  reached. Acceptable before release; no migration.
- [Milestone ×8 at 50 copies makes late soy copies strong again and may undo the crossover] →
  The chain set payback chart shows it; the tuning task may move milestones to 25/50/100 or
  lower the factor, both content-only.
- [Selling raw ingredients may still beat building a whole new chain early on] → The marginal
  processing payback is visible in the simulation's purchase log; lot prices are content-only.
- [The simulation never sells to MegaMeat, so it cannot show how fast feed sales pay off] →
  Accepted: the sim is the customer-focused baseline. The feed cost numbers are content and can
  be checked by hand.
- [Starting values miss the pacing windows] → A tuning task runs the simulation and adjusts base
  prices and unlocks until the pacing table is in the windows; the final numbers go into the
  specs before archiving.
- [Biogas pays the same for a product as for its intermediate] → Intended: finishing surplus for
  the biogas plant earns nothing extra, so the only reason to finish is customers.
