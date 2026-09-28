# Design

## Context

See proposal.md (Why). The relevant state of the code, after `milestone-upgrades`:

- `BuildingDef` has `rate` (output per second per building at full speed) and, for processing
  buildings and kitchens, `input: { resource, ratio }` (input per unit of output). All ratios are
  small whole numbers (3, 2, 2, 1, 1, 2) and every unit of output is one run today.
- `produce` in `src/game/systems/production.ts` adds `count × rate × rateFactor × seconds` to
  `progress`, makes `floor(progress)` units, each taking `ratio` input, and keeps the rest.
- `steadyOutput` in `balance/steady.ts` caps each stage by `input flow / ratio`; `player.ts` uses
  `rate × rateFactor × ratio` for what buildings consume and `need / (rate × rateFactor)` for how
  many buildings a demand needs.
- The building card shows `t('recipe', { inAmount: ratio, outAmount: 1, ... })` and
  `owned × rate × rateFactor` per second. `UpgradesPanel.svelte` renders effects by kind.
- Upgrade effects: `rate` multiplies a list of buildings; there is no effect on output per run.

## Goals / Non-Goals

**Goals:**
- Yield is one number per building (`output per run`), used by production, the steady model, the
  player and the card, so they cannot disagree.
- Content stays unchanged for a building without yield upgrades: `rate` becomes "runs per second"
  and `ratio` "input per run", with 1 output per run, which is the same numbers.

**Non-Goals:**
- No save change: `progress` already counts runs (one unit per run so far).
- No fractional yields and no yield on fields or manual actions.

## Decisions

### Runs and yield

`BuildingDef` keeps its fields; their doc comments change: `rate` = runs per second per building at
full speed, `input.ratio` = input per run. New `yieldPerRun(state, id)` in `systems/upgrades.ts`:
`1 + Σ add` of owned yield effects for that building.

`produce`: `runs = floor(progress)`, limited by `stock[input] / ratio`; input taken `runs × ratio`;
output added `runs × yieldPerRun`. The waiting and shortage logic works on runs as before.

`steadyOutput`: `runs = min(count × rate × rateFactor, inputFlow / ratio)`, output
`runs × yield`. It gets yields from the upgrades argument it already takes. `player.ts`:
consumption stays `runs × ratio`; the buildings a demand needs divide by `rate × rateFactor ×
yield`.

Why whole units per run instead of a yield factor: stocks and production are whole numbers, and
+1 per run keeps them so with no extra state. The first yield upgrade doubles output per unit of
input, the second would add 50%, so later upgrades naturally give less.

Alternative considered: lowering the input per run (3 → 2 soybeans per tofu). Kitchens with a
1:1 recipe cannot go lower, and more output per run keeps the chain's product count growing,
which is what the player wants to see. Rejected.

### Effect kind

`UpgradeEffect` gets `{ kind: 'yield'; building: BuildingId; add: number }` (whole units). The
content test checks that `building` has an input and `add` is a positive whole number.

Changed effects: `hydraulicPress`, `newMillstones`, `kneadingMachine`, `steamOven` become
`{ kind: 'yield', building: <their building>, add: 1 }`; conditions and prices stay. New:

| Id | Name DE / EN | Line DE / EN | Condition | Price |
|---|---|---|---|---|
| `sausageFiller` | Wurstfüllmaschine / Sausage filler | „Gleicher Tofu, doppelt Wurst.“ / Same tofu, twice the sausage. | 5 Tofu-Wurst kitchens | €400 |
| `oatFoamNozzle` | Haferschaum-Düse / Oat foam nozzle | Mehr Schaum, weniger Drink – wie in jedem echten Café. / More foam, less drink, like any real café. | 5 café bars | €8,000 |

### UI

- `BuildingCard.svelte`: `outAmount: amount(yieldPerRun(state, id))`; the rate becomes
  `rate × rateFactor × yieldPerRun`.
- `UpgradesPanel.svelte`: `effectText` handles `yield` with
  `upgrade.effect.yield` = "{building}: +{amount} {resource} per run" / "{building}: +{amount}
  {resource} pro Durchgang"; `target` shows the building's art, as for `rate`.

### Files

Changed content: `upgrades.ts` (effect kind, four effects, two entries, `UpgradeId`),
`buildings.ts` (doc comments).
Changed systems: `upgrades.ts` (`yieldPerRun`), `production.ts`.
Changed balance: `steady.ts`, `player.ts`.
Changed UI: `BuildingCard.svelte`, `UpgradesPanel.svelte`; `de.json`, `en.json`.
Docs: the upgrades part of section 3 of the concept doc.

### Tuning result

Default 60-minute simulation (2 clicks/s), starting prices kept. The scripted player and the
simulation's offer table needed `yield` in their list of income effects, or they would never value
it.

| Upgrade | Offered | Demand-aware gain | Payback | Bought |
|---|---|---|---|---|
| Hydraulic press | 5.1 min | €3.8/s | 80 s | 5.5 min |
| Sausage filler | 8.2 min | €3.8/s | 107 s | 8.3 min |
| Oat foam nozzle | 23.2 min | €40/s | 200 s | 23.5 min |
| New millstones | 23.8 min | €30/s | 200 s | 24.2 min |
| Kneading machine | 30.2 min | €15.6/s | 768 s | 30.3 min |
| Steam oven | 30.1 min | €25/s | 1,600 s | 31.1 min |

Before this change the steam oven added €0/s and was never bought. Pacing: first oat field
14.0 min, wheat field 21.0, Leverkas oven 26.8, chicken 3.7, pig 10.2, cow 21.4 (all in their
windows). All three chain milestones at 25 are reached (soy 20.0, oat 46.7, wheat 57.8 min). At
60 min: €4,783/s income and 16,525 customers (€961/s and 12,526 before). Customers now cap more of
the late game, which is the intended ceiling.

## Risks / Trade-offs

- [Yield on a kitchen doubles products that customers may not order] → Intended: demand is the
  ceiling; the surplus goes to the biogas plant. The simulation's upgrade offers show the
  demand-aware gain, and prices are tuned with it.
- [An owned hydraulic press changes meaning in an existing save] → Output at full supply stays
  ×2 and soybean use halves, so the player is never worse off. No migration.
- [+1 per run is a big step (×2)] → The same size as the ×2 rate upgrades it replaces; prices can
  rise in the tuning task.

## Migration Plan

No save change. Rollback means reverting the change.
