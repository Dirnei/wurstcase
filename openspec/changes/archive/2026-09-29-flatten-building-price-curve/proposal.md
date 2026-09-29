# Proposal

## Why

Playtesting shows building prices climb too fast in the mid game: at about 1,300 customers the
player can hardly buy any more production, because each balanced set multiplies the next one's
price by 1.13 (soy), 1.07 (oat) or 1.06 (wheat). There is also a long gap between the chain
milestone upgrades (25 → 50 → 100 copies), so after the 50 milestone nothing boosts production for
a long stretch.

This retunes the cost scaling from concept doc section 8, row 4 `production-chain`, and the chain
milestone upgrades from row 8 `upgrades`. It does not add a planned row of its own.

## What Changes

- Lower every chain's set growth: soy 1.13 → 1.09, oat 1.07 → 1.05, wheat 1.06 → 1.045. Later
  chains still grow more slowly than earlier ones, so each later chain still starts as the worse deal
  and overtakes the one before. Base prices stay the same, so the first copies cost exactly what
  they cost now.
- Add three more chain milestones per chain, at 75, 150 and 200 copies of every building in the
  chain. The milestones become 25, 50, 75, 100, 150 and 200. Each one doubles the whole chain, like
  the existing milestones. That adds 9 new upgrades, each with its own name and joke line in DE and
  EN.
- Milestone prices keep following the building price rule, so the existing milestones get cheaper
  along with the buildings. For example, soy 25 goes from about €13,000 to €5,500.
- Existing saves keep every building and upgrade they own. The new prices apply to the next
  purchase, and new milestones the save already qualifies for come on offer at once.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `production-chain`: set growth values and cost-scaling scenarios in "Buying buildings", and
  milestone scenarios in "Buildings" (a 75 milestone now sits below 100).
- `upgrades`: chain milestones at 25/50/75/100/150/200 in "Chain milestone upgrades", new price
  scenario, and the upgrade count in "Act 1 upgrades".

## Non-goals

- No change to base prices, rates, recipes, unlock thresholds or product prices.
- No change to the demand curve, customers or bulk buyers. Slow customer growth is intentional.
- No new named per-building upgrades. The extra production comes from chain milestones, so chains
  stay in balance.
- Milestones beyond 200 copies and prestige-era production boosts are deferred to the Neustart /
  Act 2 changes.
- No new hard simulation gates. The user checks the feel by playing.

## Impact

- Content: `src/game/content/buildings.ts` (`SET_GROWTH`), `src/game/content/upgrades.ts`
  (`OWNED_MILESTONES`, which widens the `ChainMilestoneId` type).
- i18n: `src/i18n/de.json`, `src/i18n/en.json` get 9 new upgrade names and lines.
- Tests with fixed prices or milestone counts: `systems/upgrades.test.ts`,
  `systems/production.test.ts`, `systems/buildings.test.ts`, `content/content.test.ts`,
  `balance/curves.test.ts`, and possibly the balance pacing numbers in `balance/milestones.ts`.
- Save format unchanged: new upgrade ids simply aren't owned yet. No migration needed.
- Routing: logic/balance change (implementation-worker).
