# Proposal: chain-proportions

## Why

A production line should need more of its early steps than of its late ones (more fields than
presses, more presses than kitchens), and the early steps should be cheaper, so the player can
afford to keep the stock of every step balanced. Base prices were tuned only for income and
pacing, and two chains break that rule:

| Chain | Balanced set (field : processing : product) | Base prices |
|---|---|---|
| Soy | 1.5 : 1 : 1 | €10 < €25 < €40 (fine) |
| Oat | 0.5 : 0.5 : **1** (twice as many café bars as mills) | €400 < €1,000 = €1,000 |
| Wheat | 1 : 1 : 1 | €600 < **€1,600 > €800** |

The Leverkas oven costs half as much as the seitan kitchen that feeds it, and the oat chain's last
step is the one the player needs most.

Fixing the proportions exposed a second problem in the cost model. The price of a building grows
per copy, so a chain that needs 2 fields per product building pays its growth twice per set. With
the rule in place, an oat or wheat set is 4 fields : 3 processors : 2 product buildings, 24 sets
are 96 fields, and at ×1.09–1.11 per copy the 24th oat set pays back in 1.3 million seconds
against soy's 32 thousand. No price set makes a later chain end ahead of the one before
(`crossover-balancing`); 12 were tried. Lower per-copy growth for fields fixes the crossover but
makes fields cheap, and cheap fields make feeding MegaMeat the best strategy: a fair player who
sells its surplus to MegaMeat earns €12.8M in an hour against €5.0M for one who does not, because
MegaMeat's six markets pay up to €55, €218 and €455 per second for raw soybeans, oats and wheat
and half that for the intermediates, about €1,090 per second in all.

The concept doc did not plan this change in its section 8 sequence. It revisits the building rates
and prices from `production-chain` and `crossover-balancing`, and MegaMeat's flooded market from
`megameat-outbids`.

## What Changes

- **Rule**: every chain needs at least as many buildings of each step as of the next, and more
  fields than product buildings, at base values; and within a chain each step's base price is
  higher than the step before. A content test enforces both for every chain.
- **Oat chain rates** (starting values): oat field 0.5 oats/s (was 2), oat mill 1/3 run/s (was 1);
  café bar unchanged. Balanced set 2 : 1.5 : 1.
- **Wheat chain rates** (starting values): wheat field 0.5 wheat/s (was 1), seitan kitchen 1/3
  run/s (was 0.5); Leverkas oven unchanged. Balanced set 2 : 1.5 : 1.
- **Prices grow per balanced set, not per copy.** Each chain has one set growth (starting values:
  soy 1.13, oat 1.07, wheat 1.06). A building's price is its base price × set growth^(copies owned
  ÷ its share of a balanced set), so buying one whole set of any chain multiplies every price in
  it by the set growth once. Soy keeps its 1.13 per set, so presses and kitchens grow exactly as
  today and fields a little slower (×1.085 per copy). Chain milestone prices follow the same rule.
- **Prices** (tuned): oat €250 / €500 / €700 (were €400 / €1,000 / €1,000); wheat €400 / €600 /
  €900 (were €600 / €1,600 / €800). Soy is unchanged. Wheat's first set must cost more per euro of
  income than oat's for wheat to start behind oat (crossover at set 1).
- **MegaMeat's markets flood in euros.** The half-price flood is €1,575 of full-price sales in any
  market (500 soybeans, 125 oats, 60 wheat, 1,000 tofu, 250 oat drink, 120 seitan) instead of 500
  units in every market, so every market pays at most about €55 per second, and MegaMeat about
  €330 per second in all. Soybean sales and their scenarios are unchanged.
- **Pacing windows**: first Leverkas oven 20–55 min (was 20–35; the simulation lands at 51.9),
  first cow 18–35 min (was 20–35); the concept doc's section 5 and the dev page's pacing table
  follow. The user playtests the Leverkas timing.
- **Feed horizon** 8 minutes → 1 minute (the named fallback): with the euro flood alone the fed
  player kept 84–91% of the fair player's customers; only 60 s reaches the feed check (38%).
- The 60-minute simulation tunes set growth, prices and, only if needed, the feed horizon until
  the acceptance checks in design.md hold; the final values replace the starting values in the
  spec.
- Recipes (input per run) and manual actions are unchanged; product outputs per final building are
  unchanged, so a café bar and a Leverkas oven earn what they earn today.

## Non-goals

- Changing the soy chain's rates, base prices or set growth.
- Changing recipes, product prices, upgrades, MegaMeat's pegged prices (raw = product price + 5%,
  intermediate half of that) or the biogas plant.
- The feed horizon was only to change as a named fallback; the simulation needed it (see What
  Changes), so its requirement joins the bulk-sales delta.
- The wheat field, pig and first soybean field milestones already land early in the tree; this
  change does not gate on them.
- Save changes: owned buildings stay; only their output and next price change. MegaMeat floods
  are reset on load, since a flood fades within minutes anyway.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `production-chain`: Buying buildings gains the price-order rule, the per-set price rule and new
  starting prices; a new Chain proportions requirement holds the rates, the proportion rule and
  each building's share of a set.
- `dev-tools`: the Chain balance table shows the new oat and wheat sets; the cost chart, chain set
  payback chart and payback header follow the per-set rule; the Pacing table widens the Leverkas
  window.
- `bulk-sales`: the Flooded market is measured in euros of full price, with the same half-price
  flood for every market.

## Impact

- `src/game/content/crops.ts`, `processors.ts`, `products.ts`: rates and base prices;
  `content/buildings.ts`: chain set growth and each building's share of a set replace per-building
  `priceGrowth`.
- `src/game/systems/buildings.ts` (price rule), `src/game/content/upgrades.ts` (milestone price
  rule), `src/game/systems/bulkSales.ts` and `content/buyers.ts` (euro flood), `src/game/save.ts`
  (flood reset), `src/game/balance/milestones.ts` (windows), the dev page's payback header.
- `src/game/content/content.test.ts`: the proportion and price-order checks.
- Tests that assume the old oat or wheat rates or prices or per-copy growth (`buildings.test.ts`,
  `production.test.ts`, `steady.test.ts`, `curves.test.ts`, `simulate.test.ts`, `bulkSales.test.ts`,
  upgrade tests).
- `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`: sections 3.3 and 5.
- Existing saves: players who own many oat or wheat fields see those fields produce less and their
  next prices change; MegaMeat markets load fresh.
