# Design: campaign-growth

## Context

See proposal.md - Why. What we found in the code:

- `tick()` calls `convert(state, seconds)` from `systems/awareness.ts` every tick. `convert` uses
  `conversionRate` = `CONVERSION_PER_AWARENESS (0.02) × conversionFactor × awarenessRate ×
  activeFactors.conversion × (1 − customers ÷ POPULATION)` and carries `state.conversionProgress`.
- `systems/aktionen.ts`: `aktionCost` = `ceil(cost × event aktionCost factor × upgrade factor)`;
  `aktionEstimate` = `floor(customers × saturation share)`, capped at the room left in the town;
  `runAktion` adds the estimate and increments `state.aktionen.runs[id]` (already saved).
- `EventFactors` has `awareness`, `conversion`, `aktionCost`; the study sets `conversion: 0`.
- The `conversion` upgrade effect (local newspaper ×1.5) feeds `conversionFactor`, used only by
  `conversionRate` and by the scripted player's `rescueScore`.
- The scripted player never runs Aktionen. `rescueScore` values a rescue by the customers the
  species converts passively in `RESCUE_HORIZON_SECONDS` (600).
- `firstAktionAt()` and the Aktionen tab's lock hint come from the flyers' `unlockAt`;
  `LEBENSHOF_UNLOCK_AT` is €100.
- The save is at format 10 (the `storeroom` change, in progress in the working tree).

**src/game/ files and content entries:**
- `content/aktionen.ts`: `AktionDef` gains `growth?: number` (per-run factor, campaigns only);
  flyer `unlockAt: 100`; `growth: 1.15` on flyer, open farm day and viral reel.
- `content/megaMeatEvents.ts`: `EventFactors.conversion` renamed to `reach`; the study gets
  `reach: 0.5`.
- `content/town.ts`: `CONVERSION_PER_AWARENESS` removed.
- `content/upgrades.ts`: no entry changes; the `conversion` effect keeps its kind name.
- `systems/awareness.ts`: `conversionRate` and `convert` removed.
- `systems/aktionen.ts`: growth in cost and estimate; reach factors.
- `systems/upgrades.ts`: `conversionFactor` renamed to `reachFactor`.
- `systems/villain.ts`: neutral factors use `reach`.
- `state.ts`, `save.ts`, `tick.ts`, `balance/player.ts`, `balance/simulate.ts`.

## Goals / Non-Goals

**Goals:**
- One formula for a campaign's cost and reach, used by the panel, the run and the scripted player.
- Existing saves keep their campaign progress: scaling is derived from the saved run counts.

**Non-Goals:**
- Automation of campaigns (proposal Non-goals).
- A separate "campaign level" in the state; the run count is the level.

## Decisions

### 1. Growth derived from the saved run count

`growthFor(state, id) = aktion.growth ** state.aktionen.runs[id]` (1 for the fact check, which has
no `growth`). Cost: `ceil(base cost × growthFor × event factor × upgrade factor)`. Reach:
`floor(base customers × growthFor × event reach × upgrade reach × share)`, capped at the town's
room. Both stay plain numbers: at 1.15 per run, even 200 runs give a factor of about 1.4e12, far
below float limits, and the town caps reach at 20,000 anyway.

- *Alternative: store a separate level per campaign.* Rejected: `runs` already exists, is saved,
  and means exactly that.
- *Alternative: separate cost and reach growth.* Kept possible (two fields), but the starting
  values use one factor so customers per awareness point stays constant per campaign, and
  campaigns scale with awareness income. The balancing step may split them.

### 2. Remove passive conversion outright

`convert` and `conversionRate` go, `tick()` no longer calls a conversion step, and
`state.conversionProgress` is removed. Keeping a zero-rate conversion step would leave dead state
in every save and a misleading upgrade text.

### 3. Reach factor replaces the conversion factor

`EventFactors.conversion` becomes `reach` (study `0.5` instead of `0`), and `conversionFactor`
becomes `reachFactor`. The upgrade effect kind stays `conversion` so its art (`effects/conversion`)
and saved upgrade ids need no change; only its text changes (`upgrade.effect.conversion`:
"Campaigns win ×{factor} customers" / "Aktionen gewinnen ×{factor} Kundschaft").
`event.study.effect` becomes "Campaigns win only half as many people." / "Aktionen überzeugen nur
halb so viele Leute."

- *Alternative: rename the effect kind too.* Rejected: it touches art registration and the effect
  art id for no player-visible gain.

### 4. Flyers unlock at €100

The flyers' `unlockAt` becomes `LEBENSHOF_UNLOCK_AT` (€100), so the Aktionen tab unlocks with the
Lebenshof and the first chicken's awareness has a use right away. The lock hint and
`firstAktionAt()` follow automatically.

### 5. Save format 11

Migration 10 → 11 deletes `conversionProgress`. `readState()` stops reading it and `writeState()`
stops writing it. Run counts are unchanged, so an old game's next flyer is immediately as
expensive and as big as its run count says.

### 6. Scripted player runs campaigns

In `playerStep`, after selling and before buying: among campaigns with `canRun === 'ok'`, run the
one with the highest `aktionEstimate ÷ aktionCost` and log it as `{ kind: 'aktion', id, price:
cost }` (the price is in awareness; the dev page shows it with the awareness art instead of €).
The fact check is not used by the scripted player. `rescueScore` replaces the passive term with
`species awareness per second × 600 s × best customers per awareness point`, where the best ratio
comes from the offered campaigns at their current run count; with no campaign offered, rescues
score as today's awareness-only value of 0 customers and are skipped.

## Risks / Trade-offs

- [Customer growth, and so the whole economy, becomes slower or lumpier] → Run the default and
  MegaMeat simulations before and after, compare final customers, total earned and the pacing
  table, then tune `growth`, base costs, base customers and cooldowns. The concept doc's Act 1 goal
  (about 80% of the town by 35–60 min) is the target. Record the final values in the aktionen spec.
- [An idle player's customers stop at 10] → Accepted for now (proposal); the automation change
  follows after playtesting.
- [Cooldowns cap throughput while costs grow] → With constant customers per awareness, the pool
  is the limit only while cooldowns are short compared to the time to refill the pool; the
  simulation shows whether bigger campaigns (open farm day, viral reel) take over as intended.
- [The `storeroom` change is being applied and edits `save.ts`, `state.ts`, `player.ts`] →
  Implement this change after `storeroom` is archived; the dev-tools delta already builds on the
  storeroom version of the Simulated playthrough requirement.
- [The awareness and aktionen spec Purpose sentences mention passive conversion] → Deltas cannot
  change a Purpose; edit them in the main specs when archiving (task 6.2).

## Migration Plan

Save format 10 → 11 drops `conversionProgress`; nothing else changes. Customers already won are
kept. Rolling back the code would reject format-11 saves as too new, so a rollback needs the backup
slot; acceptable before release.
