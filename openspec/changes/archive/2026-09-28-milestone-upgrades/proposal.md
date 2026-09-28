# Proposal

## Why

`crossover-balancing` added milestone multipliers: owning 25, 50 and 100 of a building doubles its
output each time, for free, and the building card shows the next one as "×2 ab 25" next to the
output per second. Two things are wrong with that:

- The hint crams too much into a small card, and "×4 ab 50" reads as a fourfold jump (the factor
  is the total, not the step).
- A single building never earns more on its own. A chain earns as much as its weakest stage, and
  in the end as much as customers buy. The demand-aware 60-minute simulation shows it: doubling
  25 soybean fields adds €15/s, the Leverkas oven milestone adds €5.6/s and would take 3 hours to
  pay back. Growing a whole product line is what matters, and the milestones should reward that.

Chain milestones do: they come on offer when every building of a chain reaches 25, 50 or 100, and
double the whole chain, so its stages stay in balance and its product output really doubles.
Making them upgrades turns the offer itself into the hint and gives the player a purchase decision.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. Like `crossover-balancing`, it is
part of the balancing that row 13 (`release-v1`) plans as its "pacing tuning pass".

## What Changes

- **Owning 25, 50 or 100 of a building no longer doubles its output by itself.** The automatic
  milestone multipliers and the building card's "×{factor} ab {count}" line are removed.
- **Chain milestone upgrades:** for each of the three chains, three upgrades come on offer once
  every building of the chain (field, processing, kitchen) is owned at least 25, 50 and 100
  times. Each doubles the output of all three buildings of its chain. That is 9 new upgrades, each
  with its own name and joke line in German and English.
- **Price:** a fixed multiple of the prices of the copies that complete the milestone (the 25th,
  50th or 100th copy of each of the chain's buildings), rounded to two significant digits. Starting
  multiple ×10, tuned with the demand-aware simulation. Prices are generated from building content.
- **Saves:** a save made with automatic milestones gets every chain milestone upgrade whose chain
  it had already completed. A save that had grown one building past a milestone alone loses that
  building's bonus, as the new rules intend.
- **Balancing:** the steady model and the scripted player treat chain milestones as upgrades. The
  per-building dev charts no longer include milestones; the chain set payback chart assumes a chain
  milestone upgrade is bought when it comes on offer and adds its price to the set that completes it.
- The concept doc's line on milestones follows.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `production-chain`: "Buildings" drops the milestone multipliers and the next-milestone display.
- `upgrades`: "Upgrade effects" no longer stacks on milestones; a new "Chain milestone upgrades"
  requirement defines the 9 generated upgrades and their prices; "Act 1 upgrades" counts 26
  upgrades in the complete list; "Upgrades are saved" grants completed chain milestones to older
  saves.
- `dev-tools`: "Cost vs income chart" and "Payback chart" drop milestone multipliers; "Chain set
  payback chart" counts chain milestone upgrades and their prices, and checks the crossover on
  the sets before the milestone set.

## Non-goals

- Efficiency upgrades (more output per run) and the rework of the single-building ×2 upgrades
  (better seeds, hydraulic press, kneading machine, steam oven, new millstones); planned as
  `efficiency-upgrades`.
- Bulk buyer prices and the customer cost of feeding MegaMeat; planned as `megameat-temptation`.
- A progress bar towards the next chain milestone; the upgrade offer is the hint.
- Milestones beyond 100; a later tuning or prestige change can add them as data.
- Final numbers. The price multiple is a starting value; the release tuning pass sets the final one.

## Impact

- Content: `src/game/content/upgrades.ts` (chain milestone constants, generated upgrades,
  `UpgradeId`), `src/game/content/buildings.ts` (milestone constants move out).
- Systems: `src/game/systems/ownedMilestones.ts` and its test removed; `production.ts` uses
  `rateFactor` directly.
- Save: `src/game/save.ts` format 7 → 8 with a migration.
- Balance: `src/game/balance/steady.ts`, `curves.ts`, `player.ts`, and their tests.
- UI: `src/ui/BuildingCard.svelte`; i18n in `src/i18n/de.json` and `en.json` (9 names and lines,
  `building.nextMilestone` removed).
- Docs: section 3.2 of the concept doc.
