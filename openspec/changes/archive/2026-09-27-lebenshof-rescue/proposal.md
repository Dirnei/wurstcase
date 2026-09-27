# Proposal

## Why

Right now the game stops at 10 customers. Every euro past the first buildings either piles up
unsold or goes to the bulk buyers. That leaves out the other half of the core loop in section 3 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`: money rescues animals, animals
create awareness, and awareness turns townspeople into customers. This change adds that loop, so
demand can grow and the money the player earns has a purpose.

This is row 6 (`lebenshof-rescue`) of the planned change sequence in section 8 of the concept doc:
"Animals, space, names, awareness production, passive conversion".

## What Changes

- **Lebenshof panel:** it appears once total earnings reach its unlock threshold. It shows the
  space used and the space available, buttons to build shelters and rescue animals, and the list
  of residents.
- **Three species, bought from MegaMeat Corp:** chicken (cheap), pig (mid), cow (expensive). Each
  unlocks at its own total-earnings threshold. Each rescue raises the next price of that species
  ("MegaMeat notices demand"). Species, prices, growth, space needs and awareness output are
  content data.
- **Space:** every animal needs space (chicken 1, pig 4, cow 10). Space comes from shelters bought
  with money: a small stable, and later a pasture. Shelter prices rise by the building factor
  (×1.10). A rescue is not possible without enough free space.
- **Names:** each rescued animal gets a random name from a localized pool for its species, for
  example "Rosi", "Frau Huhn" or "Günther". A name is not repeated until the species' pool runs
  out. After that, repeated names get a number, as in "Rosi 2". Residents are listed with their
  emoji and name.
- **Awareness production:** each animal produces awareness per second (chicken 1, pig 5, cow 20).
  The total awareness per second is shown.
- **Passive conversion:** awareness steadily turns townspeople into customers. The rate is
  proportional to the awareness per second and to the share of the town that is not yet a
  customer, so conversion slows as the town fills up. Act 1's town has 20,000 people. Customers
  stay whole numbers and never exceed the population. The sales panel shows customers out of the
  population.
- **Animals are never lost:** no action and no amount of time removes a resident.
- **Save format 5:** residents (species and name), shelters, and progress towards the next
  customer are saved. Older saves load with an empty Lebenshof.

## Capabilities

### New Capabilities

- `lebenshof`: the Lebenshof panel and its unlock, species and their unlocks, rescuing animals
  from MegaMeat with rising prices, shelters and space, random localized names, the resident list,
  permanence of animals, and saving the Lebenshof.
- `awareness`: awareness production by residents, passive conversion of townspeople into
  customers with saturation, the town population, and how both are displayed. Change 7 adds
  Aktionen that spend awareness to this capability.

### Modified Capabilities

None. `sales` still starts with 10 customers and takes orders from however many customers there
are. Conversion only changes the customer count, and that belongs to the new `awareness`
capability.

## Non-goals

- **A spendable awareness pool and Aktionen (campaigns):** in this change awareness is a rate that
  drives conversion. Spending it comes with `aktionen-and-megameat` (7), which adds the pool.
- MegaMeat counter-events, news ticker and tutorial hints: `aktionen-and-megameat` (7).
- Upgrades that change animal output, prices or space: `upgrades` (8).
- Fact cards on milestones such as the first pig: `faktenbuch` (9).
- Prestige, act goal (80% of the town), and keeping animals across Neustart: `prestige-and-act-1`
  (10). This change only guarantees that nothing in the current game removes an animal.
- Offline conversion and the "while you were away" summary: `offline-progress` (11).
- Renaming animals, an illustrated Lebenshof view, and any animal needs such as food or care.
- Pacing: prices, unlock thresholds, space needs and the conversion factor are starting values,
  tuned in `release-v1` (13).

## Impact

- New: `src/game/content/animals.ts` (species), `src/game/content/shelters.ts` (shelters),
  `src/game/systems/rescue.ts` (unlocks, prices, space, rescuing, names),
  `src/game/systems/awareness.ts` (awareness per second, conversion),
  `src/ui/LebenshofPanel.svelte`, and DE/EN text including the name pools.
- Changed: `src/game/content/town.ts` (population, conversion factor), `src/game/state.ts`
  (residents, shelters, conversion progress), `src/game/tick.ts` (conversion runs every tick),
  `src/game/save.ts` (format 5, migration 4 → 5), `src/ui/SalesPanel.svelte` (customers out of
  the population), `src/App.svelte` (panel placement).
- Production, bulk sales and order taking stay the same. More customers mean more orders through
  the existing sales logic.
