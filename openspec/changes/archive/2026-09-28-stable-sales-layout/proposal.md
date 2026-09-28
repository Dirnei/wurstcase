# Proposal: stable-sales-layout

## Why

The Verkauf tab flickers while the game runs. Its figures change every tick, and the number
format drops a trailing `.0`, so a value switches between forms like `37/min` and `37.5/min`, or
`1.2K` and `1.23K`. Every switch changes the text width. The panels use free-flowing layouts that
size to their text: a wrapping flex row for the figures, `max-content` columns for the sold list,
and auto-width bulk sell buttons with the lot note next to them. So each width change pushes the
neighbours around, and sometimes a line wraps back and forth. The tab should read like a calm
dashboard where only the digits change.

The concept doc did not plan this change in its section 8 sequence. It is a UI polish change
after `ui-motion`, and it builds on the bulk-buyer cost note from `crossover-balancing`.

## What Changes

- **Fixed-decimal live figures**: a new display form of the number format for values that change
  while the player watches. It keeps trailing zeros, so a figure always has the same number of
  decimals for its magnitude: `37.0` / `37.5`, `1.20K` / `1.23K`, `1.50e15`. The regular format
  stays as it is everywhere else.
- **Sales figures as a grid**: customers, open orders, demand and income become stat cells in a
  fixed grid. Each cell has a small label above a large, right-aligned value in tabular digits.
  The cells keep their size when the values change.
- **Sold list as a table**: product, icon and the sold-per-minute value sit in fixed columns. The
  value column is right-aligned and wide enough for the fixed-decimal form, so a changing figure
  never moves the product names.
- **Bulk offers as rows**: each offer is a full-width sell button inside its buyer card. The
  resource sits on the left, and the units and price sit right-aligned on the right. The lot note
  and MegaMeat's cost go on their own line below the button. A changing price no longer resizes
  the button or moves the note.
- Demand, income, sold per minute and the bulk sale units and price use the fixed-decimal form.
  Static prices (the assistant's price, lot sizes) keep the regular format.

## Non-goals

- The money in the top bar, the resource rail and the rail's Sell button. They show the same
  kind of changing figures, but this change covers only the Verkauf tab.
- Any change to what the sales panel shows or to the sales rules. The same figures and messages,
  in a new arrangement.
- New art, icons or motion for the sales tab.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `number-formatting`: adds the fixed-decimal display form for live figures.
- `game-screen`: the Sales tab requirement gains a stable-layout rule: a fixed grid for the
  figures, fixed columns for the sold list, and full-width bulk offer rows, none of which change
  size when values change.

## Impact

- `src/format/number.ts` and `src/format/number.test.ts`: a fixed-decimal option.
- `src/ui/amounts.ts`: helpers for the fixed form (`liveAmount`, `liveEuros`).
- `src/ui/SalesPanel.svelte`, `src/ui/BulkBuyersPanel.svelte`: new markup and styles.
- `src/i18n/en.json`, `src/i18n/de.json`: labels and values split into separate keys for the stat
  cells and the bulk buttons.
- No change to `src/game/`, the save format or the game rules.
- `BulkBuyersPanel.svelte` has uncommitted edits from `crossover-balancing`. Implement this change
  after that one is archived, or on top of its edits.
