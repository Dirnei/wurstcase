# Design: megameat-outbids

## Context

See proposal.md - Why. What we found in the code (working tree, with the worker's first
implementation of the pegged prices):

- `content/buyers.ts`: MegaMeat has `pegged: { lotUnits: 20, raw: 1.05, intermediate: 0.5 }` and
  `feedCost`; the biogas plant keeps static `lots`.
- `systems/bulkSales.ts`: `lotFor(state, buyer, resource)` computes MegaMeat's lot from
  `productPrice` and the chain stage (`STAGES` from `CHAIN_RESOURCES`); `bestBuyer(state, …)`,
  `hasLot`, `wholeLots`, `bulkSaleUnits`, `bulkSaleValue`, `bulkSaleCost` and `bulkSell` build on it.
  `bulkSaleCost` scales customer and awareness losses by the sale's euros.
- Nothing about MegaMeat's price depends on how much was sold, which is why the tempted player's
  money has no ceiling (see proposal.md).
- `tick()` is the single simulation path; exponential decay composes exactly across ticks.
- Save format is 12 (after `campaigns-unlock-by-awareness`).
- The balancing page supports a surplus buyer switch (biogas / MegaMeat), but no strategy that
  never processes.

**src/game/ files and content entries:**
- `content/buyers.ts`: `flood: { halfPriceUnits: 500, halfLifeSeconds: 20 }` on MegaMeat; its
  `feedCost.horizonSeconds` 600 → 480.
- `systems/bulkSales.ts`: `fullPrice(state, resource)`, `marketLevel(state, resource)`,
  `floodedValue(state, resource, units)`, `recoverMarkets(state, seconds)`, `timeToRecover(state,
  resource, level)`; `bulkSaleValue` and `bulkSell` use the flooded value for MegaMeat.
- `state.ts` (`megaMeatFlood: Partial<Record<ResourceId, Decimal>>`), `save.ts`, `tick.ts`.
- `balance/player.ts`, `balance/simulate.ts`, `balance/steady.ts`, `balance/curves.ts`.

## Goals / Non-Goals

**Goals:**
- A hard, explainable ceiling on MegaMeat income per resource, independent of production.
- The first MegaMeat sales stay irresistible; dumping everything stops paying.
- One function answers "what does this MegaMeat sale pay right now", used by the game, the UI, the
  balancing code and `bulk-sell-shares`.

**Non-Goals:**
- Making the feed cost (customers, awareness) part of the cap.
- Flooding the biogas plant.

## Decisions

### 1. Price curve K ÷ (K + F), paid along the curve

The price per unit at flood F is `full × K / (K + F)`. A sale of n units integrates this:
`full × K × ln((K + F + n) / (K + F))`, floored to whole euros; then `F += n`. This is exact for any
sale size (a 20-unit lot and a million-unit dump use the same formula), needs no loop over lots,
and makes selling in small portions over time pay better than dumping, which is the lesson.

With the flood halving every H seconds (mean life τ = H ÷ ln 2), selling s units per second holds
the flood near s × τ, and income tends to `full × K ÷ τ = full × K × ln 2 ÷ H` as s grows. At the
tuned values (K = 500, H = 20 s) that is about €55/s for soybeans, €218/s for oats and €455/s for
wheat.

- *Alternative: price by the flood at the start of each lot.* Rejected: a huge sale needs a loop or
  a harmonic-sum approximation, and the result depends on lot size.
- *Alternative: linear drop to a floor price.* Rejected: a floor gives no ceiling on income, since
  unlimited units at the floor price still add up.
- *Alternative: tie the cap to customers or awareness.* Rejected: the tempted player keeps
  customers at the floor anyway, so any cap based on them changes nothing (the simulation showed it).

### 2. Per-resource flood

Each MegaMeat resource has its own flood. The offer can then say "the soybean market is flooded",
selling wheat does not lower the soybean price, and each resource's cap scales with its own full
price, so later chains stay proportionally tempting.

- *Alternative: one shared flood in euros.* Rejected: harder to read per offer, and a wheat sale
  would crash the soybean price, which feels arbitrary.

### 3. Recovery by exact exponential decay in `tick()`

`recoverMarkets(state, seconds)` multiplies each flood by `2^(−seconds ÷ H)`. Splitting time into
ticks gives the same result up to float error, which the split-ticks scenario checks. Floods below
0.01 units snap to 0, so fresh markets read exactly 100%.

### 4. Decimal flood, saved

Floods are Decimals because a late-game dump can exceed 2^53 units; `ln` uses `Decimal.ln` for the
ratio. Save format 12 → 13 adds `megaMeatFlood` (strings per resource), with migration to 0 for all.
`readState` rejects negative or non-numeric values.

### 5. UI: level, meter, recovery time

Each MegaMeat offer's lot line becomes: "Markt 67 %", a 4 px meter, and "95 % in 1:05" while below
95%. All three sit in reserved fixed-width slots with tabular digits; at 100% the time slot is
empty but kept. The sell button's value is the flooded value of the sale, so the button shows what
the player actually gets. `timeToRecover` solves `K/(K + F × 2^(−t/H)) ≥ 0.95` for t.

### 6. Tempted strategy in the simulation

`SimulationSettings.strategy: 'default' | 'tempted'`. The tempted player clicks only harvest
actions, buys only fields (the cheapest unlocked field when it can pay) and storeroom expansions
(same rule as the default player), never buys processors, kitchens, upgrades, animals or the
assistant, and every 10 s sells to MegaMeat every raw ingredient beyond 30 s of use (by its own
buildings, which are none). The acceptance checks in `simulate.test.ts` compare total earned at
5, 10 and 60 minutes.

### 7. Intermediate prices below biogas stay

The worker's fix is kept: "biogas pays less than MegaMeat" only holds for raw ingredients.
MegaMeat's full price for tofu (€1.575) and oat drink (€6.30) is below the biogas plant's (€1.60,
€6.50); seitan (€13.125) is still above biogas (€20 ÷ 3 ≈ €6.67).

### 8. Steady model: the settled flood

The balancing code's steady model (`steady.ts`) values MegaMeat surplus at the flood it settles at
rather than at the current flooded price: a steady surplus of s units per second holds the flood at
s × τ, so it earns s × full × K ÷ (K + s × τ). This needs no state, and it saturates at the same
cap as the game.

### 9. Tuning result

The acceptance checks from the balancing task, with K = 500 and H = 20 s (total earned, tempted
vs fair): 5 min €11.2K vs €2.8K, 10 min €23.1K vs €18.5K, 60 min €1.40M vs €3.38M (fair 2.42×).
At H = 60 s the tempted player fell behind at 10 minutes (€11.8K vs €18.5K); at H = 10 s the
60-minute gap shrank to 1.30×. The fair run never sells to MegaMeat, so its pacing is unchanged.

The flood made the default player with MegaMeat as its surplus buyer sell less to MegaMeat and so
lose fewer customers: at the 10-minute feed horizon it kept 52% of the fair run's customers
(9,512 of 18,157), breaking "Feeding the industry" (at most half). No K or H fixed that (best 52%).
The feed horizon drops to 8 minutes (480 s): that run now ends with 8,243 customers (45%), and the
tempted numbers do not change, since the feed cost never touches money.

## Risks / Trade-offs

- [The acceptance criteria may not be reachable with K and H alone] → Tuning order: first H (a
  shorter half-life lets the tempted player earn more early and raises the cap), then K. If the
  tempted run still wins at 60 minutes with a cap that also kills the 5-minute lead, stop and report
  back before touching other systems.
- [A fresh 20-unit lot pays €61, not €63] → Intended: every unit already floods a little. The
  scenarios use the flooded numbers throughout.
- [`bulk-sell-shares` is written against the unflooded lot values] → Its task 0.1 recomputes its
  numbers from this change's archived spec; smaller shares now pay a better average price, which
  makes the shares more useful.
- [The default player sometimes sells surplus to MegaMeat] → Its surplus price in `steady.ts` uses
  the current flooded price, so it stops preferring MegaMeat once the market is flooded.

## Migration Plan

Save format 12 → 13 adds all floods at 0. Rollback would reject format-13 saves as too new;
acceptable before release.
