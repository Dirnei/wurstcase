# Design: manual-feedback

## Context

See proposal.md - Why. What we found in the code:

- `BuildingCard.svelte` is a `48px 1fr` grid: art (spanning 3 rows), head (name, ×count), rate
  line (`amount(owned × rate)/s`), recipe line (fields get an empty `&nbsp;` line so buttons stay
  level), a 6 px progress bar, and an actions row with the by-hand button (label
  `building.byHand`, full text in `aria-label`/`title`) and the Buy button (`flex: 1`).
- The by-hand click is `act((state) => performManual(state, manual.id))` with no feedback.
- `ResourceRail.svelte` shows the stock with `amount()` (regular format: `1.2K` / `1.23K`), so
  rail rows already change width as stock ticks.
- Motion helpers: `motion/floats.ts` (`push`, `expire`, `FLOAT_MS` 900, `MAX_FLOATS` 5),
  `FloatingAmount.svelte` (absolute overlay, `aria-hidden`), `motion/pop.ts` (`pop` and `flash`
  actions, class-based and layout-free), `motion/saleFlash.svelte.ts` (a counter that drives the
  top bar's reduced-motion flash), `prefersReducedMotion()`.
- `formatNumber(value, lang, { fixed })` from `stable-sales-layout`; `liveAmount` / `liveEuros`
  in `amounts.ts`.
- Storeroom: `storeroomRoom(state)`, `isFull(state, resource)`, the `full` hold on the state, and
  the `stock.fullBadge` / `stock.full` keys; the rail already renders a full badge in reserved space.
- Manual actions: `manualUnits(state, id)` (what a click would make), `ManualActionDef.input` and
  `output`; keys `manual.<id>` hold the full action text.

**src/game/ files and content entries:** none are added or changed. The card reads existing
queries (`manualUnits`, `canPerform`, `storeroomRoom`, `isFull`, `state.stock`).

## Goals / Non-Goals

**Goals:**
- Every changing figure on the card lives in a slot whose width is fixed by the layout.
- The click answers "what did I make" within 100 ms, at the button.

**Non-Goals:**
- A shared stat-slot component across card, rail and sales panel; the patterns are copied locally
  as in earlier stable-layout changes.

## Decisions

### 1. `whole` option on `formatNumber`

`formatNumber(value, lang, { fixed: true, whole: true })`: below 1,000, `truncate` uses 0 decimals
instead of 1; above, it is the fixed form. `amounts.ts` gets `liveCount(value)`. Stock is always
whole, so `37.0` would read wrong; `37` / `999` / `1.00K` changes width only at magnitude steps,
and the slot absorbs those.

- *Alternative: reuse the fixed form (`37.0`).* Rejected: stock counts are whole things.
- *Alternative: separate formatter.* Rejected for the same reason as in `stable-sales-layout`.

### 2. Stock line: a grid row with fixed tracks

A new card row under the recipe line: `grid-template-columns: auto 9ch auto 9ch 1fr auto`
holding the label ("Vorrat"), the stock (right-aligned), "/", the room (right-aligned), the meter
(`1fr`, 4 px) and the full-mark slot (fixed width, empty when not full). All figures use
`liveCount` and `tabular-nums`. The `9ch` tracks are sized for the longest German forms
(`123 Mio.`, `1,23e15`); a check in DE at the narrowest card width (about 280 px) confirms they fit.
The meter replaces nothing: the 6 px progress bar stays and shows the current run.

To keep 9 cards inside 1280 × 720, the card's vertical padding shrinks by 2 px and the recipe line
and stock line share the 0.78rem size; the tasks measure the tab's height before and after.

- *Alternative: merge stock into the rate line.* Rejected: "1,5 Tofu-Wurst/s · Vorrat 1,23 Tsd. /
  2,00 Tsd." does not fit a 280 px card in German.
- *Alternative: turn the progress bar into the fill meter.* Rejected: the progress bar is what
  shows a building is working; losing it hides the other half of the feedback.

### 3. Verb labels

New keys `manual.<id>.verb` (EN / DE): harvest soybeans "Harvest" / "Ernten", press tofu "Press" /
"Pressen", Tofu-Wurst "Stuff" / "Füllen", harvest wheat "Harvest" / "Ernten", seitan "Knead" /
"Kneten", Leverkas "Bake" / "Backen", harvest oats "Harvest" / "Ernten", oat drink "Mill" /
"Mahlen", Hafer-Cappuccino "Froth" / "Schäumen". `aria-label` and `title` keep `manual.<id>`.
`building.byHand` is removed. The button gets `min-width: 9ch` so every verb gives the same button
width and the Buy button next to it starts at the same place on every card.

### 4. Short mark on the recipe input

The recipe line is split into spans: input amount + name, arrow, output. While
`!canPerform && input stock < input.amount`, the input span gets class `short` (the rail's danger
colour), a "!" mark in a slot that is always reserved (`visibility: hidden` when not short), and a
visually hidden "(not enough)" / "(zu wenig)" plus `title`. The marker slot is always present, so
the line never reflows.

### 5. Click float and reduced-motion highlight

The actions row gets a `position: relative` wrapper around the by-hand button holding a
`FloatingAmount`-like overlay. On click: read `manualUnits` before acting; if the action succeeded
and made units, `push` "+N" and render it with the output's `ArtSlot` (size `sm`) inside the float.
`FloatingAmount` gains an optional art prop (`{ kind, id }`) rather than a copy. With reduced
motion, a per-card `manualCount` state increments instead and drives `use:flash` on the stock
figure. The float is `aria-hidden`; screen readers get the change from the stock line, which is
not a live region (to avoid chatter on every click).

- *Alternative: announce each click via `aria-live`.* Rejected: ten clicks would queue ten
  announcements.

### 6. Rail stock uses the whole-count form

`ResourceRail.svelte` swaps `amount(state.stock[r])` for `liveCount(...)`. Its amount column is
already `auto` right-aligned; it gets `min-width: 9ch` so the column width no longer follows the
widest current value.

## Risks / Trade-offs

- [9 cards no longer fit 1280 × 720 with the extra line] → Measure; fallbacks in order: shrink
  padding and gaps, drop the "Vorrat" label in favour of the output's small illustration, or show
  the room only in the tooltip.
- [German verbs of different length] → `min-width: 9ch` fits "Schäumen"; checked in DE and EN.
- [Float art inside a 900 ms animation on many rapid clicks] → capped at 5 per button, as sales.
- ["Stuff" is an odd English verb for sausage filling] → acceptable placeholder; can be tuned in
  the dictionary without code changes.

## Migration Plan

No data migration. Roll back by reverting the commit.
