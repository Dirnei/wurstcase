# Proposal

## Why

A chain earns as much as its weakest stage, and every upgrade so far only makes a building run
faster: it eats its input faster too, so the stage before it becomes the bottleneck and the gain
disappears. The demand-aware simulation shows it: when the steam oven (Leverkas ovens ×2) comes on
offer it adds €0/s, and the kneading machine takes 32 minutes to pay back.

Efficiency upgrades do something different: a building makes more output from the same input.
That shifts the balance point of the chain. A stage that was short of input produces more at once,
and a stage that was already at full speed turns the stage after it into the bottleneck, so the
player grows the line further down. The recipe on the building card changes ("3 Sojabohnen →
2 Tofu"), so the upgrade explains itself. It also fits the theme: plant food gets more efficient
with every step, while MegaMeat needs several kilos of feed for one kilo of meat.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It is part of the balancing that
row 13 (`release-v1`) plans as its "pacing tuning pass", after `milestone-upgrades`.

## What Changes

- **Buildings work in runs.** A processing building or kitchen takes its input per run and makes
  its output per run, all copies working towards the next run together. Without upgrades a run
  makes 1 unit, so nothing changes until an efficiency upgrade is owned.
- **New upgrade effect: yield.** It adds whole units of output per run of one building type, with
  the same input and the same runs per second. Several add up (1 → 2 → 3 per run).
- **The single-building ×2 upgrades on processing buildings and kitchens become yield upgrades**
  (+1 per run): hydraulic press (3 soybeans → 2 tofu), new millstones (2 oats → 2 oat drink),
  kneading machine (2 wheat → 2 seitan), steam oven (2 seitan → 2 Leverkas). Better seeds and
  second farmer stay rate upgrades, because fields have no input.
- **Two new yield upgrades** for the kitchens without one: a sausage filler for the Tofu-Wurst
  kitchen (1 tofu → 2 Tofu-Wurst) and an oat foam nozzle for the café bar (1 oat drink → 2
  Hafer-Cappuccino), each with a name and joke line in German and English.
- **The building card's recipe and output per second include yield.** The upgrade's effect reads
  "Tofu press: +1 tofu per run".
- **Balancing:** the steady model and the scripted player count yield, so the simulation values the
  new upgrades by what they add under demand. Prices are tuned with it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `production-chain`: "Buildings" works in runs and shows the recipe with yield.
- `upgrades`: "Upgrade effects" adds the yield effect; "Act 1 upgrades" changes four effects, adds
  two upgrades and counts 28 in the complete list.

## Non-goals

- Yield on manual actions; pressing tofu by hand keeps 3 soybeans → 1 tofu.
- Fractional yields (3 soybeans → 1.5 tofu); every run makes whole units.
- More than one yield upgrade per building; later changes can add them as data.
- Bulk buyer prices and market values, which use the base recipes (`megameat-temptation`).
- Final numbers. Upgrade prices and conditions are starting values.

## Impact

- Content: `src/game/content/upgrades.ts` (yield effect kind, four effects changed, two upgrades
  added, `UpgradeId`).
- Systems: `src/game/systems/upgrades.ts` (`yieldPerRun`), `production.ts` (runs × yield).
- Balance: `src/game/balance/steady.ts`, `player.ts`, and their tests.
- UI: `src/ui/BuildingCard.svelte` (recipe and rate), `src/ui/UpgradesPanel.svelte` (effect text);
  i18n in `src/i18n/de.json` and `en.json` (`upgrade.effect.yield`, two names and lines).
- Saves: no format change. Owned upgrade ids stay; an owned hydraulic press now doubles tofu per
  soybean instead of the press's speed.
- Docs: section 3 of the concept doc (upgrades).
- Order: apply after `milestone-upgrades`; the deltas build on its versions of "Buildings",
  "Upgrade effects" and "Act 1 upgrades".
