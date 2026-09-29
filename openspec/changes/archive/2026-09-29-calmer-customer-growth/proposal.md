# Proposal: calmer-customer-growth

## Why

After the first quarter of an hour, customers stop being a concern. In playtesting, a Lebenshof
of 6 chickens and 3 pigs was enough to keep more orders open than the production could ever
fill. The first minutes feel right; the trouble starts once the open farm day and the viral
video come in. The balancing simulation shows the same thing on main (93b2584): in the fair run,
demand is 3.1× production at 15 minutes, 1.9× at 20, 2.2× at 25 and 2.3× at 30. Production only
catches up at about 38 minutes. For that whole stretch, the only thing that matters is building
more, and campaigns do nothing for the player.

Two levers cause it. Each run of the two big campaigns wins far too many townspeople (300 and
1,500 at base). And each customer beyond the demand knee of 750 still adds a lot of orders. This
change turns both down so that demand stays close to what the player makes through the middle
game. The opening stays as it is.

This is balancing work under row 13 (`release-v1`, pacing tuning pass) of the change sequence in
section 8 of the concept doc. It retunes values that rows 5 (`sales-and-customers`) and 7
(`aktionen-and-megameat`) introduced.

## What Changes

- **Campaign reach halved for the two big campaigns:** Tag der offenen Hoftür wins 150 base
  customers instead of 300, and Virales Video wins 750 instead of 1,500. The flyers keep 20, so
  the opening does not change. Costs, cooldowns, unlocks and the per-run growth (cost ×1.25,
  reach ×1.1) stay the same.
- **Demand knee lowered from 750 to 200 customers:** each customer still places 0.05 orders per
  second up to the knee. Beyond it, each doubling of the customers adds 10 orders per second
  instead of 37.5. The starting neighbours (10 customers, 0.5 orders per second) and all early
  scenarios are unchanged. The whole town now orders about 76 per second instead of about 215.
- **The Aktionen balancing sentence is dropped.** The old promise, that the default run passes
  80% of the town between 35 and 60 minutes, is replaced by "tuned by playtesting". The spec no
  longer promises simulation numbers.
- Scenario numbers that depend on the knee (sales, dev-tools demand chart) or on the open farm
  day's reach (aktionen) are recomputed.

A quick probe of the default 60-minute simulation, only to check the direction. Your playtest
decides the final values:

| Fair run | 10 min | 15 min | 20 min | 25 min | 30 min | 40 min | 60 min |
|---|---|---|---|---|---|---|---|
| Demand ÷ production, main | 1.07 | 3.13 | 1.95 | 2.16 | 2.35 | 1.27 | 0.69 |
| Demand ÷ production, this change | 1.20 | 1.29 | 1.10 | 1.16 | 0.84 | 0.37 | 0.39 |
| Customers, main | 428 | 1,792 | 4,043 | 6,651 | 9,387 | 13,286 | 18,958 |
| Customers, this change | 574 | 1,325 | 2,847 | 4,789 | 6,510 | 9,977 | 16,219 |

The customers at 10 minutes are higher because the scripted player earns and rescues a little
differently. The flyers are unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `aktionen`: the Act 1 Aktionen table (base customers of the open farm day and the viral video)
  and its balancing sentence; the "Nearly full town" scenario of Running an Aktion.
- `sales`: Open orders (knee 200, 10 orders per second per doubling) and the demand figures in
  Sales figures.
- `dev-tools`: the "Beyond the knee" scenario of the demand ceiling chart.

## Impact

- `src/game/content/aktionen.ts`: base customers of `openFarmDay` and `viralReel`.
- `src/game/content/town.ts`: `DEMAND_KNEE` and its doc comment.
- Tests with knee- or reach-dependent numbers: `content/town.test.ts`, `systems/sales.test.ts`,
  `systems/salesStats.test.ts`, `systems/aktionen.test.ts`, `balance/curves.test.ts`,
  `balance/steady.test.ts`, and any `balance/simulate.test.ts` thresholds that move.
- No state, save, UI or i18n change. Existing saves keep their customers, and their demand drops
  on the next tick. The existing cap rule trims open orders above the new cap.
- This change builds on the archived `customer-demand-curve` (93b2584) and `megameat-scandal`
  (e17f6fb). No unarchived dependency.
- Logic/balance change, so it goes to the implementation-worker.

## Non-goals

- The flyers' reach, every campaign cost, the cooldowns, the per-run growth and the awareness
  rates stay as they are. The user's "reduce the customers we get from campaigns" is met by the
  two big campaigns, so the opening keeps its feel. If a playtest still finds the flyers too
  strong, that goes to a later tuning change.
- The flat rate of 0.05 orders per customer, the order cap seconds and the population of 20,000
  stay the same.
- MegaMeat's scandal (K, H) and the bulk buyers are not retuned here. The follow-up that softens
  the scandal after a playtest stays open.
- No new mechanic, such as customers who stop ordering or per-product demand. That would be a
  later change if the curve alone is not enough.
