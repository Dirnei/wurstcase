# Proposal: campaign-growth

## Why

Customers grow on their own: every second, the Lebenshof's awareness passively converts
townspeople, and campaigns (Aktionen) only speed that up. The player's main lever for demand
(customers) therefore needs no decision at all, and the awareness pool is a side resource.
Growing customers only through campaigns that cost awareness makes awareness the currency of
growth, and every new customer the result of a choice. For campaigns to carry the whole customer
growth from 10 to 20,000 townspeople, they have to scale: a flyer that always wins 20 people is
irrelevant after the first minutes.

This departs from the concept doc (section 3.5 "Passive conversion", and "idle play still
progresses"). The concept doc did not plan it in its section 8 sequence; it reworks rows 6
(`lebenshof-rescue`, passive conversion) and 7 (`aktionen-and-megameat`). The concept doc is updated
in the same change. How idle play grows customers (for example a hireable campaign manager) is
left for a later change after playtesting.

## What Changes

- **BREAKING**: passive conversion is removed. Awareness no longer converts anyone by itself; it
  only fills the awareness pool. Customers grow only when the player runs a campaign.
- **Campaigns grow with each run**: every run of a campaign makes its next run cost more awareness
  and reach more townspeople, both ×1.15 per run so far (starting values, tuned with the balancing
  page). The reach still shrinks as the town fills up. The fact check does not scale.
- **Flyers unlock with the Lebenshof** (€100 earned) instead of at €1,000, so there is no stretch
  in which awareness piles up with nothing to spend it on.
- **MegaMeat's "study"** no longer pauses passive conversion; while it runs, campaigns reach half as
  many people.
- **Local newspaper** upgrade: instead of passive conversion ×1.5, campaigns reach ×1.5 more people.
- The Aktionen panel shows each campaign's current cost and reach, which now grow run by run
  (already shown live today).
- The balancing page's scripted player runs campaigns (the one with the most customers per
  awareness point whenever it is ready and affordable), and scores rescues by the customers their
  awareness buys through campaigns.
- The save drops the passive conversion progress (new save format with a migration). The run
  counts that drive the scaling are already saved, so existing games keep their campaign progress.

## Non-goals

- Automating campaigns for idle play (a later change).
- New campaigns, new counter-events, or a different town size.
- Changing awareness production by animals, or the fact check.
- Rebalancing product prices or buildings beyond what the pacing check requires.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `awareness`: Passive conversion is removed; awareness scenarios no longer mention conversion.
- `aktionen`: campaigns scale per run; the flyers unlock at €100; the purpose sentence changes.
- `megameat-events`: the study halves campaign reach instead of pausing passive conversion.
- `upgrades`: the conversion effect multiplies campaign reach; the local newspaper's effect text.
- `dev-tools`: the scripted player runs campaigns and scores rescues through them.

## Impact

- `src/game/systems/awareness.ts`: `conversionRate` / `convert` removed; `tick.ts` stops calling it.
- `src/game/content/aktionen.ts`, `src/game/systems/aktionen.ts`: growth per run; flyer unlock.
- `src/game/content/megaMeatEvents.ts`, `systems/villain.ts`: `conversion` factor becomes `reach`.
- `src/game/systems/upgrades.ts`, `content/upgrades.ts`: conversion effect applies to reach.
- `src/game/content/town.ts`: `CONVERSION_PER_AWARENESS` removed.
- `src/game/state.ts`, `src/game/save.ts`: `conversionProgress` removed, format bump + migration.
- `src/game/balance/player.ts`, `simulate.ts`: campaigns in the scripted player.
- `src/i18n/en.json`, `de.json`: study effect, conversion effect and Aktionen texts.
- `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`: section 3.5.
- Tests: `awareness.test.ts`, `aktionen.test.ts`, `villain.test.ts`, `upgrades.test.ts`,
  `save.test.ts`, `tick.test.ts`, `simulate.test.ts`.
- The `storeroom` change is being applied and touches `save.ts`, `state.ts` and `player.ts`;
  implement this change after it is archived.
