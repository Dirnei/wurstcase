# Design

## Context

See proposal.md (Why) and the `upgrades` and `news-ticker` delta specs. The current code reads
every value that upgrades touch straight from content:

- **Production:** `produce()` uses `building.rate`, and manual actions use the fixed
  `MANUAL_ACTIONS` amounts.
- **Sales:** `sales.ts` uses `PRODUCT_PRICES`, `PRODUCTS_BY_PRICE` and `ORDERS_PER_CUSTOMER`.
- **Lebenshof:** `rescue.ts` uses `getSpecies().basePrice`, `.space` and `getShelter().space`.
- **Awareness:** `awareness.ts` uses `getSpecies().awareness` and `CONVERSION_PER_AWARENESS`,
  times `activeFactors()` from the villain.
- **Aktionen:** `aktionen.ts` does `ceil(cost × activeFactors().aktionCost)`.
- **Balancing:** `balance/steady.ts` and `player.ts` model income from content only.
- **Save:** at format 6.
- **Hints:** declarative `HintClause`s in `content/headlines.ts`.
- **In flight:** `sales-metrics` edits `sales.ts` and `SalesPanel.svelte`.

## Goals / Non-Goals

**Goals:**
- One lookup module: every system asks `src/game/systems/upgrades.ts` for its factor or addition.
  No system knows about individual upgrades.
- Upgrades, conditions and effects are pure content. The Rezepte tree (10) can reuse the same
  effect types.
- Money, stock, space and awareness costs stay whole numbers.

**Non-Goals:**
- Caching the effect lookups. There are 17 upgrades, and a scan per lookup is cheap next to a
  Svelte re-render.
- Showing base vs upgraded values side by side in the panels. The panels show only the upgraded
  value.

## Decisions

### Files

```
src/game/content/upgrades.ts     UPGRADES: id, price, when: UnlockClause[], effect: UpgradeEffect
src/game/systems/upgrades.ts     isOffered, offeredUpgrades, canBuyUpgrade, buyUpgrade,
                                 rateFactor(state, building), manualFactor, priceBonus(product),
                                 productPrice(state, product), productsByPrice(state),
                                 ordersFactor, awarenessFactor(species), conversionFactor,
                                 spaceBonus(shelter), animalPriceFactor, aktionCostFactor
src/game/state.ts                + upgrades: UpgradeId[]   (owned, in purchase order)
src/game/systems/production.ts   rate × rateFactor
src/game/systems/manual.ts       up to manualFactor units, at least 1
src/game/systems/sales.ts        productPrice / productsByPrice; orderRate × ordersFactor
src/game/systems/rescue.ts       animalPrice × animalPriceFactor (ceil); totalSpace + spaceBonus
src/game/systems/awareness.ts    per-species × awarenessFactor; conversion × conversionFactor
src/game/systems/aktionen.ts     ceil(cost × event factor × aktionCostFactor)
src/game/content/headlines.ts    + hint 'upgrades' with clause { upgradeOffered: true, noneOwned }
src/game/save.ts                 format 7, migration 6 → 7
src/ui/UpgradesPanel.svelte      offers (cheapest first), owned (collapsed <details>)
src/App.svelte                   panel after the chain panels, before the Lebenshof
src/game/balance/*, src/dev/DevPage.svelte   upgrades in model, player and a table
```

### Content types

```ts
type UnlockClause =
  | { earned: number }
  | { owned: BuildingId; atLeast: number }
  | { shelters: ShelterId; atLeast: number }
  | { residents: SpeciesId | 'any'; atLeast: number }
  | { aktionRuns: AktionId; atLeast: number }

type UpgradeEffect =
  | { kind: 'rate'; buildings: readonly BuildingId[]; factor: number }
  | { kind: 'manual'; factor: number }            // whole number
  | { kind: 'price'; product: ProductId; add: number }  // whole euros
  | { kind: 'orders'; factor: number }
  | { kind: 'awareness'; species: SpeciesId; factor: number }
  | { kind: 'conversion'; factor: number }
  | { kind: 'space'; shelter: ShelterId; add: number }  // whole
  | { kind: 'animalPrice'; factor: number }
  | { kind: 'aktionCost'; factor: number }
```

Each upgrade has one effect, which keeps the effect text generation trivial. "Second farmer" uses
`rate` with the three field ids.

Alternative: percentage bonuses on product prices. Rejected because €25 × 1.5 = €37.50 breaks
whole money. Adding whole euros keeps prices whole, and the spec's table picks readable
amounts (Leverkas 25 → 35).

Alternative: effects written as functions in content. Rejected because content stays data, the
same as the hint clauses. The effect kinds are a closed union that the systems switch on.

### Every condition only goes up

The conditions (earnings, owned counts, residents, Aktion runs) never decrease within a game, so
`isOffered = !owned && every clause holds` needs no saved "offered" flag. The Neustart (10) resets
all of them together, with the upgrades.

### Where rounding happens

- **Animal price:** `ceil(base × 1.2^n × animalPriceFactor)`. The negotiator at n = 0 gives €40.
- **Aktion cost:** `ceil(cost × eventFactor × aktionCostFactor)`. Flyers under billboards with
  Instagram cost 100 × 2 × 0.75 = 150.
- **Rates, orders and conversion:** these stay fractional. The systems already carry fractions in
  progress fields.
- **Manual:** `units = min(manualFactor, floor(stock / ratio))`, at least 1 to be available.
  Input taken is `units × ratio`.

### Product order

Price bonuses could in theory reorder products. `productsByPrice(state)` sorts by upgraded price
each call, and replaces the static `PRODUCTS_BY_PRICE` in `sales.ts`. The Act 1 bonuses keep the
same order (Leverkas 35, Cappuccino 16, Tofu-Wurst 4).

### Effect text

The effect label comes from a template per kind, for example:

- `upgrade.effect.rate`: "{buildings} produce ×{factor}" / "{buildings} ×{factor}"
- `upgrade.effect.price`: "{product} +{euros}"
- `upgrade.effect.space`: "{shelter}: +{space} space each"

Building, product, species and shelter names come from existing keys. Each upgrade adds
`upgrade.<id>.name` and `upgrade.<id>.line` (joke line).

Draft names and lines (the author revises them):

| id | DE | EN |
|---|---|---|
| strongHands | Kräftige Hände – „Zwei auf einmal, wie Oma." | Strong hands – "Two at once, like Grandma." |
| mustard | Senf dazu – Ohne Senf ist es nur ein Würstchen. | Mustard on the side – without mustard it's just a sausage. |
| betterSeeds | Besseres Saatgut – Die Bohnen sind jetzt motiviert. | Better seeds – the beans are motivated now. |
| hydraulicPress | Hydraulische Presse – Tofu unter Druck. | Hydraulic press – tofu under pressure. |
| moreStraw | Mehr Stroh – Kuschelig ist das neue Geräumig. | More straw – cosy is the new spacious. |
| henPhotoShoot | Hühner-Fotoshooting – Frau Huhn hat jetzt eine Agentur. | Hen photo shoot – Mrs Hen now has an agent. |
| loyaltyCard | Stempelkarte – Zehnte Tofu-Wurst gratis, neunte schon mit Vorfreude. | Loyalty card – tenth Tofu-Wurst free, the ninth with anticipation. |
| instagram | Instagram-Account – Filter: „Bauernhof, aber aesthetic". | Instagram account – filter: "farm, but aesthetic". |
| secondFarmer | Zweiter Bauer – Heinz hat einen Cousin. | Second farmer – Heinz has a cousin. |
| kneadingMachine | Knetmaschine – Seitan knetet sich nicht von allein. Jetzt schon. | Kneading machine – seitan doesn't knead itself. Now it does. |
| leverkasRecipe | Leverkas-Geheimrezept – Steht auf einem Bierdeckel im Tresor. | Leverkas secret recipe – written on a beer mat in the safe. |
| negotiator | Verhandlungsprofi – MegaMeat hasst diesen einen Trick. | Tough negotiator – MegaMeat hates this one trick. |
| pigInfluencer | Schweine-Influencer – Günther hat mehr Follower als der Bürgermeister. | Pig influencer – Gunther has more followers than the mayor. |
| localNewspaper | Lokalzeitung – Titelseite: „Hof rettet Huhn". | Local newspaper – front page: "Farm saves hen". |
| steamOven | Dampfbackofen – Die Kruste! | Steam oven – the crust! |
| baristaCourse | Barista-Kurs – Jetzt mit Hafer-Herz im Schaum. | Barista course – now with an oat heart in the foam. |
| newMillstones | Neue Mühlsteine – Die alten waren aus der Römerzeit. | New millstones – the old ones were Roman. |

### Panel

`UpgradesPanel.svelte` sits after the chain panels, because most upgrades reward the production
side and it should be near the buildings they name. It shows:

- the offers, sorted by price, each with a button labelled "{name}: {price}", the line and the
  effect below it
- a `<details>` element "Gekauft ({n})" / "Owned ({n})" listing the owned names and effects

### Balancing page

- `steadyIncome` takes an optional owned-upgrade list and applies the rate, price and orders
  effects.
- The scripted player adds each offered upgrade as a candidate, scored by price ÷ steady-income
  gain like buildings.
- Upgrades with no income effect (Lebenshof, awareness, Aktion cost, manual) are bought when they
  cost no more than 5 minutes of current income and no building target is pending.
- A new table lists each upgrade with its conditions, price, and payback in seconds at the
  cheapest state that meets its conditions (`—` for non-income effects).
- Purchases of kind `upgrade` appear in the simulation log.

### Save format 7

Bump to 7. Migration 6 → 7 adds `upgrades: []`. `readState` keeps known ids in saved order,
drops unknown ids and duplicates, and rejects a non-array.

## Risks / Trade-offs

- [×2 building upgrades at 5 copies may make the early game too fast] → These are starting
  values. The balancing page's simulation shows the effect on the pacing table before playing,
  and tuning happens in 13.
- [Price bonuses make bulk selling relatively worse] → The bulk buyers' prices are tied to the
  base vegan value, so the content test's "below vegan value" invariant still holds. Upgrades only
  widen the gap, which fits the story.
- [Clashing edits with `sales-metrics` in `sales.ts`] → Upgrades change only the price and
  order-rate lookups. The metrics change adds recording around `fillOrders`. The second change to
  land merges them.
- [The "all conditions only increase" assumption breaks if a later change adds a decreasing
  condition] → The content test checks that only the listed clause kinds exist. A new kind must
  update the decision here.

## Migration Plan

Format 6 saves load through migration 6 → 7 with no upgrades owned. Every upgrade whose
conditions already hold appears on offer right away.
