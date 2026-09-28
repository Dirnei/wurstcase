# Design: stable-top-bar

## Context

See proposal.md - Why. What we found in the code:

- `TopBar.svelte` shows money and income with `euros()` and awareness with `amount()`. These use
  the regular format, which strips trailing zeros. `dd` already has `tabular-nums` and `nowrap`.
- `.stats` is a `flex: 1; flex-wrap: wrap` row, so each stat is as wide as its text. Below
  768 px the stats get `order: 3; flex-basis: 100%`, so they sit on their own row under the brand
  and tools.
- `liveAmount` and `liveEuros` already exist in `src/ui/amounts.ts` from `stable-sales-layout`.
- `formatDuration` and the `playTime` stat art (hourglass) exist. `SavePanel.svelte` is the
  Spielstand section of `SettingsTab.svelte` and has a header row with the export, import and new
  game buttons.
- The money `dd` has the `flash` action for reduced motion, and the floating sale amount anchors
  to the top bar money. Both must keep working.

**src/game/ files and content entries:** none are added or changed. This change touches only
`src/ui/` and `src/i18n/`.

## Goals / Non-Goals

**Goals:**
- The position and size of every top-bar element depends only on the viewport width, never on
  the values shown.

**Non-Goals:**
- A shared stat-slot component for the top bar and the sales panel. The two layouts differ
  (row vs. grid of cards); keep each local.

## Decisions

### 1. Three fixed slots, sized by the grid

`.stats` becomes `display: grid; grid-template-columns: repeat(3, minmax(0, 11rem))`. The tracks
have the same width, up to 11rem, and shrink together when the top bar gets narrow. Their width
comes from the space between the brand and the tools, which is itself fixed. Money, income and
awareness are placed in columns 1, 2 and 3. Before the Lebenshof unlocks, the awareness `div` is
not rendered, and column 3 stays empty but keeps its width.

Values stay left-aligned under their labels. Because the slot does not resize, a longer value
grows to the right inside its own slot and pushes nothing.

- *Alternative: `min-width` in `ch` on each value.* Rejected, as in `stable-sales-layout`: it
  only hides the problem until a value outgrows the guess.
- *Alternative: `1fr` tracks without a cap.* Rejected: on a wide screen the three stats would
  spread across the whole bar and read as unrelated.
- *Alternative: only render two tracks until awareness unlocks.* Rejected: money and income would
  jump once when the third track appears.

### 2. Fixed-decimal values

Money and income use `liveEuros`, and awareness uses `liveAmount`. The value width then only
changes at a magnitude boundary (`€999.9` → `€1.00K`), and the slot absorbs that.

### 3. The unit goes into the income label

The longest value is German income in the millions: `+12,3 Mio. €/min`. At 320 px the three
slots are about 85 px each, too narrow for that. Moving `/min` into the label shortens the value
to `+12,3 Mio. €`. Keys:

| Key | EN | DE |
|---|---|---|
| `topbar.income` | Income / min | Einnahmen / min |
| `topbar.incomeValue` | +{amount} | +{amount} |

Labels get `overflow: hidden; text-overflow: ellipsis`, with the full label as `title`. Values are
never clipped.

On phones (below 768 px) the value font drops from 1.05rem to 0.95rem and money from 1.25rem to
1.1rem, so the longest German value fits an 85 px slot.

- *Alternative: let the stats wrap to two rows on phones.* Rejected: wrapping is exactly the
  reflow this change removes.

### 4. Play time in the Spielstand section

`SavePanel.svelte` gets a line under its header row: the hourglass art, the label `playTime.label`
and the value from `formatDuration(state.playTime)` in tabular digits. It reads the state through
`readGame` like the top bar did, so it updates every tick while the tab is open. The existing
`playTime.label` key is reused; no new keys.

- *Alternative: remove the play time completely.* Rejected: it costs little on the settings tab,
  the save system and the dev tools still use it, and some players like to see it.

## Risks / Trade-offs

- [German income in the trillions or scientific form may still exceed an 85 px slot at 320 px]
  → Check in the browser with the dev tools at 320 px, with values set to `1.23e15` in DE. If it
  overflows, shrink the phone value font further for that width only.
- [The empty awareness slot looks like a gap in the early game] → It is at the end of the row,
  next to the tools, so it reads as spacing. Accepted.
- [The floating sale amount is positioned from the money element] → Money stays in the same
  element, only its container changes. Check that the float still starts at the money value.

## Migration Plan

No save or data migration. A pure UI change: roll back by reverting the commit.
