# Proposal: aligned-upgrade-buttons

## Why

On the Upgrades tab, each offer card puts its buy button directly under the text. Cards in the
same row are stretched to the same height by the grid, but their text differs in length (German
joke lines wrap to two or three lines), so the buy buttons end up at different heights within a
row, with empty space below the shorter ones. The buttons are also taller than the Buy buttons on
the Produktion tab. The Produktion tab already keeps its buttons level (fields get an empty recipe
line for that), so the Upgrades tab looks untidy next to it.

The concept doc did not plan this change in its section 8 sequence. It is UI polish on the
`upgrades` panel, in line with `stable-sales-layout` and `stable-top-bar`.

## What Changes

- Every offer card's buy button sits at the bottom of its card. Cards in the same row have the
  same height, so their buttons line up in one line across the row.
- The buy buttons have one fixed height, the same as the Buy buttons on the Produktion tab
  (44 px on phones), with the text on one line.
- The card's text (name, effect, joke line) stays at the top; any spare height goes between the
  text and the button.

## Non-goals

- The Aktionen and Lebenshof panels, whose cards use the same pattern. They can follow in a
  separate change if the result here looks right.
- Changing what an upgrade card shows, the order of offers, or the owned list.
- A shared card component for all panels.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `upgrades`: the Upgrades panel requirement gains a layout rule for the buy buttons.

## Impact

- `src/ui/UpgradesPanel.svelte`: card grid rows and button styles only.
- No change to `src/game/`, i18n, saves or game rules.
