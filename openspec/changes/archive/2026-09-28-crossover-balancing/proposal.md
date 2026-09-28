# Proposal

## Why

Every price curve on the balancing page is a straight, parallel line on its log axis. All buildings
and shelters grow by the same 10% per copy, and all animals by the same 20%, so the ranking of
what is worth buying never changes. A 60-minute simulation (2 clicks per second) shows the result:

- All three chains are bought in lockstep for the whole run. No chain ever takes over and none
  goes stale. At the end the player still buys soybean fields (51 owned).
- The oat chain is a worse deal than the chain before it. One balanced set pays for itself in
  53 s (soy), 248 s (wheat) and 2,708 s (oat), and Hafer-Cappuccino (€12) sells for less than
  Leverkas (€25) even though its chain costs about 20 times as much.
- Pacing misses both late windows: the first Leverkas oven arrives at 10 min (target 20–35) and
  the first oat field at 43.6 min (target 20–35).
- Surplus is almost worthless. Customers grow slowly on purpose ("vegan words spread slowly"),
  and the bulk buyers that should take the rest pay only 10% (MegaMeat) and 5% (biogas) of an
  ingredient's value. The simulated player never sells in bulk. Income grows in a straight line
  from minute 20 while prices grow exponentially.

The Kongregate "Math of Idle Games" series shows the fix that AdVenture Capitalist uses: each tier
has its own cost growth (15% for early businesses down to 7% for late ones). Later tiers start
out worse but get more expensive more slowly, so their payback curves cross the older ones and
pull the player forward. Output multipliers at 25 and 50 owned add a sawtooth that makes
"the best buy" switch between generators.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It is part of the balancing that
row 13 (`release-v1`) plans as its "pacing tuning pass", following the earlier
`gentler-building-prices` change.

## What Changes

- **Each building, shelter and species gets its own price growth**, stored in its content entry,
  replacing the shared `PRICE_GROWTH` (1.10) and `PRICE_GROWTH_ANIMALS` (1.2). Later tiers grow
  more slowly: soy chain 13%, oat chain 11%, wheat chain 9%; stable 13%, pasture 9%; chicken 25%,
  pig 18%, cow 12%.
- **The oat chain becomes the second tier and the wheat chain with Leverkas the third**, so each
  new chain sells for more per order than the one before (Tofu-Wurst €3 → Hafer-Cappuccino €12
  → Leverkas €25). Leverkas stays the flagship product and becomes the last unlock of Act 1.
  Base prices and unlock thresholds change to match (starting values, tuned with the simulation).
  Upgrades tied to the oat and wheat chains get new prices to match their new place.
- **Milestone multipliers:** owning 25, 50 and 100 of a building doubles its output each time
  (×2, ×4, ×8), as in AdVenture Capitalist. This stacks with rate upgrades. The building card shows the next milestone.
- **Bulk buyers pay more, and more the further along the chain a good is.** MegaMeat pays about
  40% of the vegan value for raw ingredients and 67% for intermediates. The biogas plant pays
  about 30% for raw ingredients and 50% for intermediates and finished products. Processing
  always pays more than selling raw, and MegaMeat still pays more than the biogas plant.
- **Selling to MegaMeat has a moral price.** Every €100 MegaMeat pays costs the player 1 customer
  (never below the 10 starting neighbours) and 10 awareness, rounded up per sale; the sell button
  shows the cost. The biogas plant pays less and costs nothing. Overproduction is the normal state
  of Act 1, as in the real food system, and the player chooses between feeding the industry and
  making energy.
- **The simulated player plays for customers.** Customer sales run on their own, bulk sales are a
  manual click, so it sells surplus only to the biogas plant, counts that in its income model, and
  scores a rescue (with the shelter it needs) by the customers the animal converts in the next
  10 minutes, alongside buildings and upgrades.
- **Balancing page:** a new chart shows the payback of the next balanced set per chain (the
  per-building chart credits each building with the whole chain's value); the header lists the
  growth per tier; the demand chart's title says its lines are parallel by construction; the
  pacing milestones follow the new chain order.
- The concept doc's pacing table and cost-scaling line follow the new tier order and growth rates.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `production-chain`: "Buildings" adds milestone multipliers; "Buying buildings" uses the
  building's own growth; "Unlocks" follows the new chain order.
- `lebenshof`: "Rising animal prices" and "Shelters and space" use per-species and per-shelter
  growth; "Species" moves the pig and cow unlocks to match the new chain order.
- `bulk-sales`: "Bulk buyers" fixes the shares by chain step; "Selling in bulk" gets the new lot
  numbers in its scenarios; a new "Price of feeding MegaMeat" requirement costs customers and
  awareness.
- `upgrades`: "Upgrade effects" says how rate upgrades stack with milestone multipliers; "Act 1
  upgrades" gets new prices for the oat and wheat upgrades.
- `dev-tools`: "Cost vs income chart", "Payback chart", "Demand ceiling chart", "Bulk buyer
  table", "Simulated playthrough" and "Pacing table" change; a "Chain set payback chart" is added.

## Non-goals

- Faster customer growth. Slow conversion is intended; bulk buyers are the outlet for surplus.
- Automatic bulk selling for the player (a manager or upgrade); belongs to a later upgrade pass.
- Further MegaMeat reactions to feed sales (stronger counter-events, ticker headlines). A
  candidate for `release-v1` (13) or Act 2.
- Buying several copies at once ("buy 10", "buy max").
- New buildings, products or chains; Rezepte and prestige effects on prices, which belong to
  `prestige-and-act-1` (10).
- Final numbers. Base prices, unlock thresholds and upgrade prices here are starting values; the
  release tuning pass sets the final ones.

## Impact

- Content: `src/game/content/crops.ts`, `processors.ts`, `products.ts`, `buildings.ts`,
  `animals.ts`, `shelters.ts`, `buyers.ts`, `upgrades.ts`.
- Systems: `src/game/systems/buildings.ts`, `rescue.ts`, `upgrades.ts` (rate factor).
- Balance: `src/game/balance/steady.ts`, `player.ts`, `simulate.ts`, `curves.ts`, `milestones.ts`.
- UI: `src/ui/BuildingCard.svelte` (next milestone), `src/dev/DevPage.svelte`; new i18n keys in
  `src/i18n/de.json` and `en.json`.
- Tests next to each of these files.
- Saves: no format change. Saves keep their counts; prices, unlocks and rates follow the new
  content on load. A save that already owns wheat-chain buildings keeps them even if the wheat
  chain would now still be locked.
- Docs: sections 3.2 and 5 of the concept doc.

Sources: [The Math of Idle Games, Part I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i),
[The Math of Idle Games, Part II](https://www.gamedeveloper.com/game-platforms/the-math-of-idle-games-part-ii),
[AdVenture Capitalist Wiki: Coefficient](https://adventure-capitalist.fandom.com/wiki/Coefficient).
