# Proposal

## Why

Only the soy chain can be worked by hand. A new chain earns nothing until the player owns at least
one field, one processing building and one kitchen, because only the end product sells. For the
wheat chain that is €1,550 of buildings before the first Leverkas, and for oats €20,500 before the
first Hafer-Cappuccino. Manual buttons let the player start a new chain step by step, the same way
the game starts with soy.

This is a follow-up to row 4 (`production-chain`, "Manual actions") of the change sequence in
section 8 of the concept doc. It extends that row's manual start from the soy chain to all three
chains.

## What Changes

- **Manual actions for wheat:** harvest wheat (+1 wheat), make seitan (2 wheat → 1 seitan), bake
  Leverkas (2 seitan → 1 Leverkas).
- **Manual actions for oats:** harvest oats (+1 oat), make oat drink (2 oats → 1 oat drink), make
  Hafer-Cappuccino (1 oat drink → 1 Hafer-Cappuccino).
- **Manual ratios match the buildings:** each manual action uses the same input ratio as the
  building that does that step, so doing a step by hand is never cheaper than the building.
- **Unlocking:** each manual action is available and shown only once the building for the same
  step is unlocked. The soy actions stay available from the start. Locked actions are hidden, like
  locked buildings.
- **Grouping:** the "By hand" panel groups its buttons by chain.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `production-chain`: the "Manual production" requirement covers all three chains and adds the
  unlock rule for manual actions.

## Non-goals

- Upgrades that make manual clicks yield more (planned for change 8, `upgrades`).
- Manual selling or any change to sales; `sales-and-customers` (change 5) owns that.
- A manual step that does more than one unit per click, or holding a button to repeat.
- Teasers for locked manual actions or a "next unlock" hint.

## Impact

- Changed: `src/game/content/manual.ts` (six new actions, each linked to its building),
  `src/game/systems/manual.ts` (unlock check), `src/ui/ManualActions.svelte` (hide locked actions,
  group by chain), `src/i18n/de.json` and `src/i18n/en.json` (six new labels).
- Tests: `src/game/systems/manual.test.ts` and `src/game/content/content.test.ts`.
- No change to `GameState` or the save format: manual actions only move stock.
