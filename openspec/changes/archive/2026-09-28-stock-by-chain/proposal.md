# Proposal: stock-by-chain

## Why

The stock in the rail lists resources by kind: all raw ingredients, then all intermediates, then
all products. To balance a production line, the player compares one chain's steps with each
other: soybeans against tofu against Tofu-Wurst. With the kind order, those three sit in three
different places in the list, mixed in with the oat and wheat steps. Grouping the stock by chain
puts each line's numbers and trend marks directly under each other, in the same order as the
Produktion tab's rows.

The concept doc did not plan this change in its section 8 sequence. It is a UI polish change that
supports the balancing work of `crossover-balancing` and the rail from `ui-shell-tabs`.

## What Changes

- The rail's stock shows one group per chain (Soy, Oats, Wheat), in the same chain order as the
  Produktion tab. Each group has the chain's name as a small heading.
- Inside a group, the resources are in production order: raw ingredient, intermediate, product
  (soybeans, tofu, Tofu-Wurst).
- A group is only shown while at least one of its resources is shown. Which resources are shown
  does not change.
- On tablet width, where the rail hides resource names, groups are separated by a thin line
  instead of a heading; the heading stays for screen readers.
- The phone stock drawer uses the same groups.

## Non-goals

- Showing production or use rates per second in the stock. The amounts and trend marks stay as
  they are; rates can come in a later change.
- Collapsing groups, or grouping anywhere other than the rail (bulk buyers, sales figures).
- Resources that belong to more than one chain. None exist in Act 1; when one does, the content
  change that adds it decides its group.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `game-screen`: the Resource rail requirement groups the stock by chain.

## Impact

- `src/game/content/buildings.ts`: a derived list of each chain's resources in production order.
- `src/game/content/content.test.ts`: tests for that list.
- `src/ui/ResourceRail.svelte`: grouped markup and styles.
- No i18n changes: the chain names `chain.soy`, `chain.oat`, `chain.wheat` exist already.
- No change to game rules, saves or the balance tools.
