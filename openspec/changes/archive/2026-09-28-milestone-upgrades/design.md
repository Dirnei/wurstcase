# Design

## Context

See proposal.md (Why). The relevant state of the code after `crossover-balancing`:

- `OWNED_MILESTONES = [25, 50, 100]` and `MILESTONE_FACTOR = 2` live in
  `src/game/content/buildings.ts`.
- `src/game/systems/ownedMilestones.ts` exports `milestoneFactor(owned)`, `nextMilestone(owned)`
  and `outputFactor(state, id)` (`milestoneFactor × rateFactor`). Callers: `production.ts`,
  `BuildingCard.svelte`, `balance/player.ts` (`outputFactor`), `balance/steady.ts` and
  `balance/curves.ts` (`milestoneFactor`).
- Upgrades are content entries in `src/game/content/upgrades.ts` with a literal `UpgradeId`
  union. An upgrade's `when` is a list of clauses that must all hold, and `{ owned: BuildingId;
  atLeast: number }` is one of them. The `rate` effect multiplies a list of buildings. The upgrades
  panel renders `upgrade.<id>.name` and `upgrade.<id>.line`, and a content test checks both keys
  in both languages for every upgrade.
- Saves store owned upgrades as a list of ids, filtered by `isUpgradeId` on load.
  `CURRENT_FORMAT` is 7.

A first implementation of this change generated one upgrade per building (27 in all). The
demand-aware simulation showed why that is the wrong unit (see proposal.md), so the change moved
to chain milestones. The per-building code already written is reworked, not kept alongside.

## Goals / Non-Goals

**Goals:**
- Chain milestone upgrades are ordinary upgrades: several `owned` clauses and one `rate` effect,
  no special case in the upgrade system, the panel or the save beyond one migration.
- Their list and prices are generated from building content, so tuning stays content-only.
- Pricing and pacing are judged with the demand-aware simulation, not the supply-only charts.

**Non-Goals:**
- No new effect kind or unlock clause.
- No change to the upgrades panel layout.

## Decisions

### Generated upgrades in the upgrades content

`src/game/content/upgrades.ts` gets the milestone data and generates the entries:

- `OWNED_MILESTONES = [25, 50, 100] as const`, `MILESTONE_FACTOR = 2`,
  `MILESTONE_PRICE_MULTIPLE = 10` (moved from `buildings.ts`; only upgrades use them now).
- `type ChainMilestoneId = \`${ChainId}Chain${(typeof OWNED_MILESTONES)[number]}\``, for example
  `soyChain25`. `UpgradeId` becomes the existing union plus `ChainMilestoneId`.
- `CHAIN_MILESTONES: readonly { chain: ChainId; at: number; upgrade: UpgradeDef }[]`, built from
  `CHAINS × OWNED_MILESTONES`. For a chain with buildings b₁…b₃:
  `when: [{ owned: b₁, atLeast: at }, { owned: b₂, atLeast: at }, { owned: b₃, atLeast: at }]` and
  `effect: { kind: 'rate', buildings: [b₁, b₂, b₃], factor: MILESTONE_FACTOR }`.
- `UPGRADES` becomes the 17 hand-written entries followed by the generated ones.

Price: `roundTwoDigits(MILESTONE_PRICE_MULTIPLE × Σ basePrice × priceGrowth^(at − 1))` over the
chain's buildings: the prices of the copies that complete the milestone, the same rule as
`buildingPrice` without importing a system into content. Starting prices:

| Chain | 25 | 50 | 100 |
|---|---|---|---|
| Soy | €14,000 | €300,000 | €130M |
| Oat | €290,000 | €4M | €740M |
| Wheat | €240,000 | €2M | €150M |

Why the whole chain at the same count, not a balanced-set count: the player sees building counts,
not sets, and "every building of the chain at 25" is readable in one line. A chain whose ratio is
not 1:1:1 (soy 3:2:2, oat 1:1:2) reaches it later than a balanced set would, which is fine: the
milestone is a goal to grow towards.

Alternatives considered:
- One upgrade per building (the first implementation): doubling one stage mostly piles up its
  output or sends it to the biogas plant; the Leverkas oven's would take 3 hours to pay back.
  Rejected.
- Doubling only the kitchen of a completed chain: the stages before it would become the
  bottleneck at once. Rejected.

### Names and joke lines

Each of the 9 upgrades gets its own `upgrade.<id>.name` and `upgrade.<id>.line` in `de.json` and
`en.json`, three escalating steps per chain in the game's tone. Starting names, reusing the best
of the first implementation:

| Chain | 25 | 50 | 100 |
|---|---|---|---|
| Soy | Bio-Siegel / Organic label | Wurstkartell / Sausage cartel | Bohnen-Betriebsrat / Bean union |
| Oat | Hafer-Hype / Oat hype | Hipster-Magnet / Hipster magnet | Haferlantis / Oatlantis |
| Wheat | Ährensache / Earnest ears | Festzelt / Beer tent | Leverkas-Weltherrschaft / Leverkas world domination |

The 54 per-building strings from the first implementation are removed.

### Output factor

`ownedMilestones.ts` and its test are removed. `production.ts`, `BuildingCard.svelte` and
`balance/player.ts` call `rateFactor(state, id)` directly; the building card drops
`nextMilestone`, the `.milestone` span and its style. The i18n key `building.nextMilestone` is
removed from both languages.

### Save migration 7 → 8

`CURRENT_FORMAT` becomes 8. The migration adds, for each entry of `CHAIN_MILESTONES` whose chain's
buildings all have a saved count of at least `at`, its id to the saved `upgrades` list (no
duplicates). A save that grew one building past a milestone alone gets nothing for it; its output
drops to what the new rules give. Accepted: the game is not released, and the deployed container
only holds test saves.

### Balancing code

- `steady.ts`: `steadyOutput` drops `milestoneFactor(count)`; chain milestone upgrades arrive
  through the `upgrades` argument like any rate upgrade.
- `player.ts`: uses `rateFactor`. The scripted player scores offered upgrades by the income they
  add in the steady model (which counts demand and biogas sales), so it buys chain milestones on
  its own when they pay.
- `curves.ts`: `costCurve` and `paybackCurves` drop milestones (a single building never reaches a
  chain milestone by itself). `chainSetPayback` adds, for each chain milestone a set completes,
  the upgrade's price to the set's price and passes the owned milestone ids to `steadyOutput`.

### Files

Changed content: `upgrades.ts` (milestone constants, generated entries, `UpgradeId`),
`buildings.ts` (milestone constants removed).
Removed system: `ownedMilestones.ts` and `ownedMilestones.test.ts`. Changed: `production.ts`.
Changed save: `save.ts` (format 8, migration) and `save.test.ts`.
Changed balance: `steady.ts`, `curves.ts`, `player.ts` and tests.
Changed UI: `BuildingCard.svelte`; `de.json`, `en.json`.
Docs: section 3.2 of the concept doc.

### Tuning result

Default 60-minute simulation (2 clicks/s), price multiple ×10 kept:

| Pacing milestone | Time | Window |
|---|---|---|
| First oat field | 17.0 min | 10–20 |
| First wheat field | 26.3 min | 20–35 |
| First Leverkas oven | 34.5 min | 20–35 |
| Chicken / pig / cow | 3.7 / 11.9 / 27.0 min | in window |

The soy chain's 25 milestone comes on offer at 40.8 min (when the kitchens reach 25), adds
€80/s under demand (payback 174 s) and is bought at 41.4 min; the oat and wheat chains do not
complete a milestone within 60 minutes. At 60 min: €961/s income and 12,526 customers (with free
per-building milestones: €2,651/s and 14,133). The chain milestone is the best-paying upgrade on
offer when it arrives, so the multiple did not need to move; the release tuning pass can revisit
it together with `efficiency-upgrades`.

## Risks / Trade-offs

- [Chain milestones come much later than building milestones did, so the mid game loses its
  jumps] → The tuning task runs the 60-minute simulation, records when each chain milestone comes
  on offer and is bought, and lowers the price multiple if the pacing table leaves its windows.
  First measurement with free building milestones replaced by per-building upgrades: every pacing
  milestone stayed in its window at ×3, ×5 and ×10.
- [Customers cap the gain: a doubled chain earns only what customers order, the rest goes to the
  biogas plant] → Intended; demand is the ceiling of the game. The simulation's upgrade offers
  table shows the demand-aware gain of each chain milestone.
- [The 100 milestone prices (€130M–€740M) are out of reach in Act 1] → Intended: they belong to
  late Act 1 and prestige runs; the numbers are data.

## Migration Plan

Format 7 → 8 as above; rollback means reverting the change, and a format-8 save would then load
as "too new" and be kept, as the save system already handles.
