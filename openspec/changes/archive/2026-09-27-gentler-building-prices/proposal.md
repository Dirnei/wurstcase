# Proposal

## Why

Every building costs 15% more per copy owned. In play-testing, prices climb faster than income:
the 25th soybean field costs €287 against a €10 base, and the 50th costs €9,424. Players hit a
price wall after a handful of copies of each building. Customer demand and the Lebenshof are not
there yet to lift income. Lowering the growth to 10% per copy keeps the exponential curve that
idle games rely on but pushes the wall much further out.

Other idle games use rates in the same range. Cookie Clicker uses 15% for all buildings.
AdVenture Capitalist uses a different rate per business, from 7% to 15%. The Kongregate
"Math of Idle Games" series treats 7% to 15% as the usual range. 10% sits in the middle of that
range and is a better fit while our income sources are still limited.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It adjusts the cost scaling that
row 4 (`production-chain`) introduced. It is an early piece of the balancing that row 13
(`release-v1`) plans as its "pacing tuning pass". Section 3.2 of the concept doc already says the
factor is "tuned in play".

## What Changes

- **Price growth drops from 15% to 10% per copy owned.** The price of the next building becomes
  base price × 1.10^(number owned), still rounded up to whole euros. Base prices and unlock
  thresholds stay the same.
- Examples for the soybean field (€10 base):

  | Copy | Now (15%) | New (10%) |
  |---|---|---|
  | 2nd | €12 | €11 |
  | 10th | €36 | €24 |
  | 25th | €287 | €99 |
  | 50th | €9,424 | €1,068 |
  | First 25, in total | €2,141 | €995 |

- **Existing saves keep their buildings.** Saves store how many buildings the player owns, not
  their prices, so prices follow the new rate as soon as a save is loaded. The save format does
  not change, and no money is refunded for buildings bought at the old rate.
- The concept doc's cost-scaling line changes from "about 15%" to "about 10%".

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `production-chain`: the "Buying buildings" requirement changes its price formula from 1.15 to
  1.10 per copy owned, and its cost-scaling scenario gets the new numbers.

## Non-goals

- Separate growth rates per building or per tier (for example, cheap fields growing faster than
  expensive kitchens, as in AdVenture Capitalist). The single constant stays. Per-building rates
  are a candidate for `release-v1` (13) if the play-test shows a need.
- Changes to base prices, unlock thresholds, production rates or product prices.
- Buying several copies at once ("buy 10", "buy max").
- Upgrades or Rezepte that lower building prices; these belong to `upgrades` (8) and
  `prestige-and-act-1` (10).
- Refunds for buildings bought at the old rate.

## Impact

- `src/game/systems/buildings.ts`: `PRICE_GROWTH` changes from 1.15 to 1.10.
- `src/game/systems/buildings.test.ts`: the cost-scaling test changes to the new expected prices.
- `openspec/specs/production-chain/spec.md` (on archive): the "Buying buildings" requirement.
- `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`: the cost-scaling line in
  section 3.2.
- No UI, i18n, save-format or dependency changes.

Sources: [Cookie Clicker Wiki: Buildings](https://cookieclicker.wiki.gg/wiki/Buildings),
[AdVenture Capitalist Wiki: Coefficient](https://adventure-capitalist.fandom.com/wiki/Coefficient),
[The Math of Idle Games, Part I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i),
[The Math of Idle Games, Part II](https://www.gamedeveloper.com/game-platforms/the-math-of-idle-games-part-ii).
