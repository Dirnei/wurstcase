# Proposal

## Why

Growth in Wurst Case comes only from buying more copies of things, and each copy costs more
than the last. There is no "number doubles" moment, and older buildings stop mattering once a
newer chain pays better. Section 3.8 of `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`
plans about 15–20 one-time upgrades for Act 1, such as "Better seeds" (fields ×2), "Leverkas
secret recipe" and "Instagram account" (Aktionen cheaper). They give the player a third kind of
purchase next to buildings and animals, and later give the Neustart something to rebuild.

This is row 8 (`upgrades`) of the planned change sequence in section 8 of the concept doc:
"Act 1 one-time upgrades".

## What Changes

- **Upgrades panel:** it lists every upgrade that is unlocked and not yet bought, cheapest first.
  Each entry shows a name, a short joke line, its effect in plain words and a buy button. Bought
  upgrades are listed in a collapsed "owned" section.
- **One-time, paid in euros:** an upgrade is bought once and its effect lasts for the rest of the
  game (until the Neustart in row 10). Buying subtracts money and does not change the total earned.
- **Unlock conditions as data:** each upgrade has one or more conditions, and all must hold:
  - total earned
  - owning at least N of a building or shelter
  - having at least N residents (of one species or of any)
  - having run an Aktion N times

  Building-count unlocks ("own 5 soybean fields") keep older buildings worth buying.
- **Effects as data, applied on top of the base values** the other capabilities define:
  - output of chosen buildings (×factor)
  - manual clicks (units per click)
  - a product's price (+whole euros, so money stays whole)
  - orders per customer (×factor)
  - awareness of a species (×factor)
  - passive conversion (×factor)
  - space per shelter type (+whole)
  - MegaMeat's animal prices (×factor, rounded up to whole euros)
  - Aktion awareness costs (×factor, rounded up)

  Factors of several upgrades multiply, and additions add up.
- **17 Act 1 upgrades** (starting values):
  - soy chain: better seeds, hydraulic press
  - wheat chain: kneading machine, steam oven, Leverkas secret recipe
  - oat chain: new millstones, barista course
  - all fields: second farmer
  - sales: mustard on the side, loyalty card
  - manual work: strong hands
  - Lebenshof: more straw, hen photo shoot, pig influencer, tough negotiator
  - awareness: Instagram account, local newspaper
- **Ticker:** a new tutorial hint while an upgrade is on offer and none has been bought yet.
- **Balancing page:** the scripted player buys upgrades, and a table shows each upgrade's
  unlock, price and payback at the moment it unlocks.
- **Save format 7:** owned upgrades are saved. Older saves load with none.

## Capabilities

### New Capabilities

- `upgrades`: the panel, unlock conditions, buying, and every effect with how it changes the
  base values of production, sales, the Lebenshof, awareness and Aktionen, plus saving.

### Modified Capabilities

- `news-ticker`: the tutorial hint list gains the "upgrades on offer" hint.

The other capabilities keep their requirements unchanged: they state base values ("base price",
"species' rate", "one unit per click"). The `upgrades` spec defines how owned upgrades change
those values, so all upgrade rules live in one place.

## Non-goals

- Upgrades paid in awareness or Rezepte. The Rezepte tree is part of `prestige-and-act-1` (10),
  and so is what the Neustart resets.
- Upgrades that change bulk buyers, the shop assistant, MegaMeat's counter-events or cooldowns.
- Repeatable or tiered upgrades ("seeds II, III…"). Every upgrade is bought once.
- Fact cards tied to upgrades: `faktenbuch` (9).
- Pacing: prices, conditions and effects are starting values, tuned in `release-v1` (13) with
  the balancing page.

## Impact

- New:
  - `src/game/content/upgrades.ts`: upgrades, conditions, effects
  - `src/game/systems/upgrades.ts`: offers, buying, effect lookups
  - `src/ui/UpgradesPanel.svelte`
  - DE/EN texts
- Changed to read effects:
  - `src/game/systems/production.ts`, `manual.ts`, `sales.ts`, `rescue.ts`, `awareness.ts`,
    `aktionen.ts`
  - `src/game/state.ts`
  - `src/game/save.ts`: format 7, migration 6 → 7
  - `src/game/content/headlines.ts`: new hint
  - `src/game/balance/`: `steady.ts`, `player.ts`, curves
  - `src/dev/DevPage.svelte`
  - `src/App.svelte`
- The in-flight change `sales-metrics` also edits `sales.ts` and the sales panel. Whichever lands
  second merges them. Sales figures should count the upgraded prices, which is what the income
  already reflects.
