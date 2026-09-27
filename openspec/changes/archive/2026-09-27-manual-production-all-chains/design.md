# Design

## Context

`src/game/content/manual.ts` lists three soy actions, each with its own `input` and `output`
amounts. `src/game/systems/manual.ts` checks only the input stock. `ManualActions.svelte` shows
every action in one row. Buildings already carry the chain, input ratio, output and `unlockAt`,
and `isUnlocked(state, buildingId)` in `src/game/systems/buildings.ts` compares lifetime earnings
with `unlockAt`. `ChainPanel.svelte` hides locked buildings the same way.

## Goals / Non-Goals

**Goals:**
- A manual action cannot drift from its building: same chain, ratio, output and unlock.
- No new state, so no save migration.

**Non-Goals:**
- A generic "click multiplier" hook for future upgrades.

## Decisions

### Link each action to its building and derive the rest

Content entries become `{ id, building }`. `MANUAL_ACTIONS` is built from them once, at module
load, into the current `ManualActionDef` shape plus `chain` and `building`:

- `input`: the building's input resource, amount = the building's `ratio` (none for fields).
- `output`: the building's output resource, amount 1.
- `chain`: the building's chain.

The soy actions keep their ids and amounts (3 soybeans → 1 tofu, 1 tofu → 1 Tofu-Wurst already
match the tofu press and the kitchen).

Alternative: keep explicit amounts in each entry and add a content test that they match the
building. Rejected because it writes every number twice for no gain; deriving makes a mismatch
impossible.

Files:

```
src/game/content/manual.ts   ManualActionId gets 6 new ids; entries are { id, building };
                             MANUAL_ACTIONS derived with input, output, chain, building
src/game/systems/manual.ts   + isManualUnlocked(state, id) = isUnlocked(state, action.building);
                             canPerform requires it; performManual unchanged otherwise
src/ui/ManualActions.svelte  one group per chain in CHAINS order, unlocked actions only;
                             a group with no unlocked action is not shown
src/i18n/{de,en}.json        manual.harvestWheat, makeSeitan, bakeLeverkas,
                             harvestOats, makeOatDrink, makeHaferCappuccino
```

New action ids and buildings:

| id | building |
|---|---|
| `harvestWheat` | `wheatField` |
| `makeSeitan` | `seitanKitchen` |
| `bakeLeverkas` | `leverkasOven` |
| `harvestOats` | `oatField` |
| `makeOatDrink` | `oatMill` |
| `makeHaferCappuccino` | `cafeBar` |

### Group heading reuses the chain name

Each group is headed with the existing `chain.<id>` translation, so no new keys beyond the six
labels are needed. Groups sit inside the one "By hand" panel.

## Risks / Trade-offs

- [Clicking the oat chain by hand might be a better deal than buying it] → Accepted: one unit per
  click is slow. With the ratios equal to the buildings, clicking only saves the building price,
  which is the point.
- [The Leverkas oven unlocks at €1,500, later than the wheat field at €200, so "bake Leverkas"
  appears later than wheat and seitan] → Intended; it follows the building unlocks and keeps
  Leverkas as the later premium step.
- [The in-flight `sales-and-customers` change also edits the UI layout] → The two changes touch
  different panels; whichever lands second rebases its `App.svelte` edits if any.
