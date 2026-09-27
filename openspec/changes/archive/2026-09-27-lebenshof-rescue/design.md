# Design

## Context

See proposal.md (Why) and the `lebenshof` and `awareness` specs. The current state of the code:

- Money and stock are whole Decimals. Buildings are plain counts, and their prices rise by
  `PRICE_GROWTH` (1.10) in `src/game/systems/buildings.ts`.
- Unlocks follow `totalEarned`.
- Customers are a whole Decimal (`state.customers`). `takeOrders()` turns them into orders, and
  `orderProgress` carries the fractions between ticks.
- The save is at format 4. `readState` ignores unknown content ids.
- Translations are flat string dictionaries (`de.json` and `en.json` must have the same keys).
  They have no arrays.
- Player actions reach the state through `act()` in `src/ui/game.svelte.ts`.

## Goals / Non-Goals

**Goals:**
- Species and shelters are pure content: a later act adds an animal or a shelter as data only.
- Conversion runs inside `tick()` and nowhere else, so `offline-progress` (11) reuses it as-is.
- Randomness only ever happens in the player's rescue action, and it can be injected. `tick()`
  stays deterministic.
- The resident list is saved in a form that later acts can extend (a new species needs only
  content).

**Non-Goals:**
- A spendable awareness pool (see proposal Non-goals). Awareness is computed from residents and is
  not stored.
- Performance tuning for thousands of residents. Act 1 pacing reaches tens of animals. The list is
  a plain array, and the UI renders it grouped.

## Decisions

### Files

```
src/game/content/animals.ts      SPECIES: chicken, pig, cow (price, growth, unlock, space, awareness, name pool size)
src/game/content/shelters.ts     SHELTERS: stable, pasture (price, unlock, space); LEBENSHOF_UNLOCK_AT
src/game/content/town.ts         + POPULATION = 20_000, CONVERSION_PER_AWARENESS = 0.02
src/game/systems/rescue.ts       isLebenshofUnlocked, isSpeciesOffered, animalPrice, shelterPrice,
                                 totalSpace, usedSpace, canRescue (+ reason), rescue, canBuildShelter,
                                 buildShelter, pickName, displayNames
src/game/systems/awareness.ts    awarenessRate, conversionRate, convert
src/game/state.ts                + residents: Resident[], shelters: Record<ShelterId, number>,
                                   conversionProgress: number
src/game/tick.ts                 produce → convert → takeOrders
src/game/save.ts                 format 5, migration 4 → 5
src/ui/LebenshofPanel.svelte     space, awareness/s, shelter buttons, rescue buttons, resident groups
src/ui/SalesPanel.svelte         customers "of 20,000 townspeople"
src/App.svelte                   Lebenshof panel after the sales and chain panels
```

### Content

```ts
type SpeciesId = 'chicken' | 'pig' | 'cow'
interface SpeciesDef {
  id: SpeciesId; emoji: string
  basePrice: number; unlockAt: number
  space: number; awareness: number   // per second
}
const PRICE_GROWTH_ANIMALS = 1.2
const NAME_POOL_SIZE = 12           // per species, same in every language

type ShelterId = 'stable' | 'pasture'
interface ShelterDef { id: ShelterId; basePrice: number; unlockAt: number; space: number }
const LEBENSHOF_UNLOCK_AT = 100
```

The values are the table values in the `lebenshof` spec. Shelter prices reuse `PRICE_GROWTH` from
`buildings.ts` (1.10 since `gentler-building-prices`), because the concept doc sets that factor for every building. Animals get
their own factor of 1.2, which makes MegaMeat's price jump noticeably ("MegaMeat notices demand").

Rough pacing check with the starting values: at 10 customers, income is about €1.50/s. The
Lebenshof unlocks at €100 earned, so the first stable (€30) and chicken (€50) come at around 2–5
minutes. One chicken converts about one customer per 50 s. Pigs (5/s) arrive with the wheat chain
and cows (20/s) with the oat chain, as in section 5 of the concept doc. Real tuning happens in
`release-v1` (13).

### Name pools as numbered translation keys

The dictionaries are flat, so the pools are numbered keys: `animal.chicken.name.0` …
`animal.chicken.name.11`, and the same for pig and cow, in both languages. A resident stores only
the index (`{ species: 'chicken', name: 3 }`), so a save is language-independent, and switching
the language shows the name at the same place in the other pool. A content test checks that
`de.json` and `en.json` both have keys `0..NAME_POOL_SIZE-1` for every species. The existing
dictionary test already makes them match each other.

The pools are not translations of each other, just good names in each language. Starting pools:

| Species | DE | EN |
|---|---|---|
| Chicken | Rosi, Frau Huhn, Gackerlinde, Henriette, Berta, Hedwig, Paula, Klara, Gertrud, Frieda, Lotte, Käthe | Rosie, Mrs Hen, Cluckinda, Henrietta, Bertha, Hattie, Penny, Clara, Gertie, Freda, Lottie, Kate |
| Pig | Günther, Wilma, Otto, Erna, Knut, Susi, Bruno, Trude, Hugo, Elfriede, Schnuffel, Kurt | Gunther, Wilma, Otis, Ernie, Hamlet, Susie, Bruno, Trudy, Hugo, Peggy, Snuffles, Kurt |
| Cow | Rosalinde, Muhriel, Elsa, Hilde, Liesel, Bärbel, Mathilde, Resi, Anton, Zenzi, Walburga, Frieda | Rosalind, Moo-riel, Elsa, Hilda, Daisy, Bella, Matilda, Buttercup, Anton, Clover, Dottie, Mabel |

Alternative: store the name text itself. Rejected because a save would then mix languages, and
the pools could not be changed later without leaving stale text in saves.

Alternative: a JSON array per language outside the dictionaries. Rejected because it would bypass
the i18n module and its same-keys check.

### Picking a name

`pickName(state, species, random = Math.random)`: count how often each index is used by residents
of that species, and take the lowest count. That count is 0 while unused names remain, so no name
repeats until the pool is used up. Then pick uniformly among the indices that have that count,
using `random()`. `rescue(state, species, random = Math.random)` passes `random` through, so tests
use a fixed sequence.

After the pool is used up, the names cycle round by round, so "Rosi 3" appears only after every
name has a "2". Display numbering (`displayNames`) is computed, not stored. Within a species, the
k-th resident (in rescue order) with a given index gets the suffix `k + 1` when k > 0.

### Residents and space

`residents` is an array in rescue order, and species counts are derived from it. `usedSpace` sums
the space of each resident's species, and `totalSpace` sums `shelters[id] × space`. `canRescue`
returns `'ok' | 'money' | 'space'`, and the button uses it to show what is lacking. When both are
short, money is shown first. Rescues and shelters subtract money only and never touch
`totalEarned`, the same as buildings.

Nothing ever removes from `residents`: no system writes to it except `rescue`, which only pushes.
The "never lost" test runs 12 hours of ticks and compares the array.

### Conversion

```
awarenessRate = Σ species.awareness over residents
rate          = CONVERSION_PER_AWARENESS × awarenessRate × (1 − customers / POPULATION)
gained        = rate × seconds + conversionProgress
whole         = min(floor(gained), POPULATION − customers)
customers    += whole; conversionProgress = gained − floor(gained)   (0 once the town is full)
```

The rate uses the customers at the start of the tick. At 10 ticks/s the error from that is far
below one customer, which is why the spec allows the split-ticks scenario to differ by at most
one. `conversionProgress` is a plain number, like `orderProgress`. `customers` stays a Decimal,
while `POPULATION` is a plain number, compared via Decimal.

Alternative: awareness accumulates in a pool and conversion consumes it. Rejected for now: nothing
else spends awareness until change 7, and a pool that only grows adds a save field and a display
without adding a choice. Change 7 can add the pool alongside the rate without changing conversion.

### Tick order

`produce → convert → takeOrders`. Customers converted in a tick place orders in that same tick.
Bulk sales, rescues and shelters remain player actions outside `tick()`.

### UI

`LebenshofPanel.svelte` is shown when `isLebenshofUnlocked`. It has:

- a header line with space "3 / 8 Platz" and awareness "📣 12/s"
- a shelter row with a button per unlocked shelter (price and +space)
- a rescue row with a button per offered species (emoji, name, price, space, 📣/s). A disabled
  button shows "Zu wenig Platz" or "Zu wenig Geld".
- a flavour line from MegaMeat ("MegaMeat Corp verkauft gern – Ware ist Ware." / "MegaMeat Corp
  is happy to sell – stock is stock.")
- the resident groups: a species emoji and count, then the names as a wrapped list

`SalesPanel` changes `sales.customers` to "{count} von {population} Einwohnern" / "{count} of
{population} townspeople".

New keys: `lebenshof.title`, `lebenshof.space`, `lebenshof.awareness`, `lebenshof.megaMeatLine`,
`lebenshof.lackMoney`, `lebenshof.lackSpace`, `lebenshof.rescue`, `lebenshof.build`,
`shelter.{stable,pasture}`, `animal.{chicken,pig,cow}` (species names), and
`animal.{species}.name.{0..11}`.

### Save format 5

Bump `CURRENT_FORMAT` to 5. Migration 4 → 5 adds `residents: []`,
`shelters: { stable: 0, pasture: 0 }` and `conversionProgress: 0`.

`readState` validates each resident as `{ species, name }`, with `name` an integer in
`[0, NAME_POOL_SIZE)`. Residents of an unknown species are skipped (content removed), the same as
unknown resource keys. A known species with a bad name index makes the save invalid. Shelter
counts are safe non-negative integers, and unknown shelter keys are ignored. `conversionProgress`
must be a finite number ≥ 0.

## Risks / Trade-offs

- [Switching the language renames every animal] → Intended: the name is shown in the player's
  language. The names are not translations, so "Günther" becomes "Gunther" and "Knut" becomes
  "Hamlet". This is a small oddity in exchange for language-independent saves.
- [Conversion is linear in awareness and gets huge with many cows] → Saturation and the
  population cap bound it. Act 1 only needs to reach about 80% of the town. Upgrades and tuning
  come later.
- [More customers expose the production bottleneck: open orders cap at 30 s of demand and the
  rest is lost] → That is the intended central tension (concept doc section 3.3). It pushes the
  player back into production.
- [Removing a species from content later would silently drop its residents from saves, which
  contradicts "never lost"] → Nobody plans to remove one. Skipping unknown ids is the existing
  rule, and it keeps an old save loadable in a build that lacks newer content.

## Migration Plan

Format 4 saves load through migration 4 → 5 with an empty Lebenshof. Older formats first pass
through all earlier migrations. Customers already in the save are kept.
