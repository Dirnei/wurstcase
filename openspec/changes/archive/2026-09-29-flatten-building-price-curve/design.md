# Design

## Context

Prices follow `grownPrice` in `src/game/systems/buildings.ts`: base price × `SET_GROWTH[chain]` ^
(owned ÷ set share). Chain milestone upgrades are generated in `src/game/content/upgrades.ts` from
`OWNED_MILESTONES` × `CHAINS`. Their price is `MILESTONE_PRICE_MULTIPLE` × the sum of the completing
copies' prices, so it already follows `SET_GROWTH`. Both are pure content data, so this change is
mostly number edits plus 9 new i18n pairs.

A quick scratchpad probe (approximate, for direction only) of the price of the 50th balanced set:

| Chain | Now | New | Payback of set 24 (s), now → new (`chainSetPayback`) |
|---|---|---|---|
| Soy | ~€147M | ~€25M | 7,883 → 1,472 (−81 %) |
| Oat | ~€9.3M | ~€3.7M | 3,813 → 1,582 (−59 %) |
| Wheat | ~€4.8M | ~€2.4M | 3,151 → 1,621 (−49 %) |

At set 1 the payback barely moves (57.7 / 339.6 / 432.0 → 56.7 / 335.4 / 428.1 s), so each later chain still starts behind the
one before. At set 24 the order flips to soy < oat < wheat: the later chains no longer end ahead.
The validator found that no knob corner keeps the set-24 crossover (only soy ≥ 1.09 with oat ≥
wheat + 0.01 and wheat ≤ 1.045 passes). See "Suspended gates".

## Suspended gates

By the user's decision (2026-09-29), two hard gates are suspended for this change so the new curve
can be playtested. The user refines the growth values after playtesting and sends them to the
product-owner as a follow-up change, which restores or redefines the gates.

- **Crossover at set 24** (later chain ends ahead of the one before). Set 1 (starts behind) stays
  a gate.
- **Tempted at 10 minutes** (the MegaMeat player earns more than the fair player at 10 min). At the
  start values the tempted player has €27,320 against the fair player's €38,239. At 5 minutes it
  stays a gate, as do the fed check and the 60-minute "at most two thirds" check.

Both tests are re-baselined to the measured values, not skipped or deleted. Each gets a comment
naming this change and the suspension, so the follow-up change can find them.

## Goals / Non-Goals

**Goals:** make mid-game production buys affordable again, and close the 50 → 100 milestone gap
and the stretch beyond 100, without breaking chain balance or the crossover.

**Non-Goals:** exact pacing targets. The user playtests the feel, and the sim's pacing windows are
guidelines.

## Decisions

1. **Lower the set growth rather than the base prices.** Early purchases stay as they are, and the
   gap widens only with the number of sets owned, which is exactly where the complaint comes from.
   The alternative was a per-chain price cap or a softer exponent (for example, polynomial growth).
   That means a new price rule and spec rewrite, and it's more than the complaint needs.
2. **Keep the soy > oat > wheat growth order** (1.09 / 1.05 / 1.045). Later chains still start
   worse (set 1), but at these values they no longer overtake by set 24. That promise is suspended
   for playtest (see "Suspended gates"), not given up.
3. **More production upgrades as extra chain milestones (75, 150, 200)** instead of new
   per-building upgrades. A chain milestone doubles every stage at once, so the chain stays
   balanced. Per-building rate upgrades would only make surplus of one resource. It is one array
   edit, and the ids (`soyChain75` …) come out of the existing type. Price, offer logic, UI and
   save handling are all generic already.
4. **Milestone factor stays ×2.** With six milestones, a fully built chain gets ×64 instead of ×8.
   It only reaches that at 200 copies of everything, which costs billions for soy.

### Tuning knobs (worker may tune within these ranges without asking)

| Knob | Start | Range |
|---|---|---|
| `SET_GROWTH.soy` | 1.09 | 1.07 – 1.10 |
| `SET_GROWTH.oat` | 1.05 | 1.05 – 1.06 |
| `SET_GROWTH.wheat` | 1.045 | 1.035 – 1.045 |
| `OWNED_MILESTONES` | 25, 50, 75, 100, 150, 200 | may use 35 in place of 75 |

The ranges don't overlap, so every choice keeps soy's growth above oat's and oat's at or above
wheat's (oat 1.05 with wheat 1.045 is the closest pair). If a knob moves, the worker recomputes the
spec scenario prices, re-measures the two suspended-gate tests, re-baselines them and logs the
change here.

### Acceptance criteria

- `chainSetPayback`: each later chain starts behind the one before at set 1 (still a gate). The set
  24 comparison is re-baselined to the measured order (soy < oat < wheat, 1,472 / 1,582 / 1,621 s).
- Tempted check: tempted earns more than fair at 5 minutes (still a gate). The 10-minute comparison
  is re-baselined to the measured values (tempted €27,320 below fair €38,239). The 60-minute
  two-thirds check and the fed check still pass.
- Every set 24 payback is at least 25 % lower than today.
- All 18 milestone upgrades are on offer at their counts, with DE and EN names and lines.
- Old saves load unchanged, and qualifying new milestones are on offer.

### Stop conditions

- If the set 1 crossover, the tempted check at 5 minutes, the 60-minute two-thirds check or the
  fed check fails, stop and report to head-of-development.
- If the Leverkas oven in the 60-minute sim lands clearly before 15 minutes, raise the soy growth
  within its range first. If it still lands before 15 minutes at the top of the range, report back
  and don't touch the base prices.

## Implementation notes

- Knobs stay at their start values (1.09 / 1.05 / 1.045, milestones 25/50/75/100/150/200).
- Re-baselined thresholds (the suspended gates):
  - `balance/curves.test.ts`, set 24: was `early > late` (later chain ends ahead), now
    `early < late`. Measured 1,472.3 / 1,581.5 / 1,620.7 s.
  - `balance/simulate.test.ts`, 10 minutes: was tempted > fair, now tempted < fair. Measured
    €27,320 against €38,239. The 5-minute check (€13,601 against €5,381), the 60-minute two-thirds
    check (€410,384 against €14,417,347) and the fed check are unchanged and pass.
- Other fixed numbers that moved with the growth: first soy set €173 → €170 (57.7 → 56.7 s), the
  soy 25 milestone step in the set curve > €13,000 → > €5,000 (measured €5,709), and the
  "stays finite" test now uses 20,000 fields, because 10,000 under 1.09 is only about 1e250.
- The soybean field's per-copy payback test now asks for "never faster" instead of "strictly
  slower": under 1.09 the 2nd and 3rd copies both round up to €12.
- 60-minute sim: the first Leverkas oven lands at 22.7 minutes, so the soy stop condition doesn't
  apply.

## Risks / Trade-offs

- [Early game speeds up a little, because soy sets get cheaper] → at set 10, soy is only about 28 %
  cheaper. The Leverkas window is a guideline, and the stop condition above covers extremes.
- [Production outruns customer demand even more] → surplus goes to the bulk buyers, as designed.
  Slow customer growth is intentional.
- [Milestone prices get very large at 150/200 for soy (billions)] → Decimal handles them. They are
  meant as late goals.

## Migration Plan

No save migration. `SET_GROWTH` applies to the next purchase only. New milestone ids aren't in any
save's `upgrades`, so they show as on offer as soon as their conditions hold. The 7 → 8
migration in `src/game/save.ts` reads `CHAIN_MILESTONES` generically. A pre-milestone save with 75+
of a chain would therefore also get the 75 milestone owned. That matches the "Upgrades are saved"
requirement (own every milestone the chain had completed), so leave it unchanged.
