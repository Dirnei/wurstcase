# Proposal

## Why

The stock panel shows only the current amounts. To find out whether a chain is balanced, the
player has to watch the numbers and compare them in their head: is tofu piling up, is Leverkas
selling faster than the oven bakes, has the soybean supply levelled off? A small trend mark next
to each amount answers that at a glance and makes the next building decision obvious. Now that
three chains, automatic sales and bulk buyers all move stock at once, reading the trend by eye
has become hard.

This change is not a row of the planned sequence in section 8 of
`docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md`. It is a small readability
improvement to the production chain (row 4, `production-chain`) and is useful from now on.

## What Changes

- **Trend mark per stock row:** every resource shown in the stock panel (raw ingredients,
  intermediates and products) gets a mark after its amount:
  - **▲ rising** – the stock grew over the last 10 seconds of game time
  - **▼ falling** – the stock shrank over the last 10 seconds of game time
  - **▬ steady** – it stayed about the same
- **Only time counts:** the trend reflects what happens on its own while time passes
  (buildings producing and using input, the shop assistant selling). Player actions (manual
  production, selling by hand, bulk sales, buying buildings) do not change the trend, so a
  one-off click or a MegaMeat sale does not flip the arrow.
- **No flicker:** whole-unit production means stock moves in steps. A change of at most 1 unit
  over the window counts as steady, and a resource marked as short (a building is waiting for
  it) always counts as steady, because its stock hovers near zero while it is used as fast as
  it arrives.
- **Accessible and translated:** the mark has a text label ("rising", "falling", "steady") in
  DE and EN for screen readers and as a tooltip; colour is never the only signal.
- The trend is not saved: after loading a game it starts as steady and fills within seconds.

## Non-goals

- Showing the rate as a number (e.g. "+2.5/s") or a forecast ("full in 3 min"). Can follow later
  if the arrow is not enough.
- Trend marks for money, customers or open orders.
- A history chart of stock over time (the `#dev` balancing page covers curves for the author).
- Offline progress summaries ("while you were away") stay in row 11 (`offline-progress`).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `production-chain`: adds a requirement that each shown stock carries a rising / falling /
  steady trend mark based on the net change from passing time.

## Impact

- New system `src/game/systems/trend.ts` (pure logic, tested) and a new non-saved field on
  `GameState`.
- `src/game/tick.ts` records the stock change of each tick.
- `src/ui/StockPanel.svelte` shows the mark.
- `src/i18n/de.json`, `src/i18n/en.json` get three new labels.
- No save format change (the field is not written, like `waiting` and `shortage`).
