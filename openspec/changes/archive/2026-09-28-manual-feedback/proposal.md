# Proposal: manual-feedback

## Why

A new player's first action is clicking the by-hand button on the soybean field card, and nothing
on the card reacts: the button says only "von Hand", and the only thing that changes is a number in
the rail at the other side of the screen. Players do not see that the click produced anything.
Processing cards are worse: "press tofu" is silently disabled when soybeans are missing. And since
`storeroom`, a building can stop because its good is full, which the card does not show either.

The card should answer "what did my click do, how much do I have, and why can't I click?" right
where the player clicks, without any of those numbers making the card twitch while the game runs.

The concept doc did not plan this change in its section 8 sequence. It is onboarding polish on the
Produktion tab, building on `storeroom` (room per good), `ui-motion` (floating amounts) and
`stable-sales-layout` (fixed-width figures).

## What Changes

- **Click feedback**: every by-hand click floats "+1" with the output's illustration up from the
  button, like the sale amount floats from the Sell button. With reduced motion, the card's stock
  figure highlights instead.
- **Stock on the card**: each unlocked card shows a stock line for the good it makes: amount, the
  storeroom's room and a thin fill meter ("Vorrat 37 / 500"). A full good shows the "voll" mark
  there, so the card explains why the building stopped.
- **Buttons say what they do**: the by-hand button shows a short verb for its step ("Ernten",
  "Pressen", "Backen", …) instead of "von Hand"; the full action text stays as tooltip and
  screen-reader label.
- **Missing input is visible**: when a processing step lacks input, the input in the card's recipe
  line is marked as short (mark, colour and text, like the rail's short mark), so a disabled
  by-hand button has a visible reason. No new line is added for it.
- **No layout flicker**: stock figures (on the cards and in the rail) use a new whole-count form of
  the number format that keeps its width within a magnitude (`37`, `1.20K`, `1.23K`), in digits of
  equal width, inside slots whose width comes from the card's layout. The float and the highlight
  are overlays and never move anything.

## Non-goals

- Feedback for automatic production (no floats per building run).
- Sound.
- Changing the rail beyond using the new form for its stock amounts.
- A tutorial overlay or arrows; the ticker hints stay as they are.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `game-screen`: the Production tab requirement adds the stock line, the verb labels, the missing
  input mark and a stable-layout rule; the Resource rail's stock amounts use the whole-count form.
- `game-motion`: a new manual-production feedback requirement; Reduced motion covers it.
- `number-formatting`: a whole-count form for live stock figures.

## Impact

- `src/format/number.ts`, `number.test.ts`: the whole-count option.
- `src/ui/amounts.ts`: `liveCount()`.
- `src/ui/BuildingCard.svelte`: stock line, meter, float, verb label, short mark.
- `src/ui/ResourceRail.svelte`: stock amounts via `liveCount()`.
- `src/ui/motion/`: a per-card manual counter for the reduced-motion highlight (like `saleFlash`).
- `src/i18n/en.json`, `de.json`: verb labels, stock line and short-input texts.
- No change to `src/game/` rules, saves or balance.
