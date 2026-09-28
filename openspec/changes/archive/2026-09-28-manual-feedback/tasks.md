# Tasks

## 1. Number format

- [x] 1.1 Add tests to `number.test.ts` for the whole-count scenarios (`7`, `37`, `1.00K`, `1.23K`,
  `2,50 Mio.`, `1.50e15`) and that the fixed and regular forms are unchanged. Verify they fail.
- [x] 1.2 Add the `whole` option to `formatNumber` and `liveCount()` to `amounts.ts`. Verify the
  tests from 1.1 pass.

## 2. Card layout

- [x] 2.1 Before changing the card, measure the Produktion tab's height at 1280 × 720 with all 9
  buildings unlocked (dev tools) and note the space left.
- [x] 2.2 Add the stock line to `BuildingCard.svelte`: label, stock and room in fixed right-aligned
  tracks with `liveCount`, the fill meter, and a reserved full-mark slot using `stock.fullBadge` /
  `stock.full`. Verify in the browser that soybeans ticking from 999 to 1.00K and from 1.20K to
  1.23K move nothing on any card, and that a full good shows the full mark.
- [x] 2.3 Add the `manual.<id>.verb` keys to `en.json` and `de.json`, show the verb on the by-hand
  button with `min-width: 9ch`, keep `manual.<id>` as `aria-label` and `title`, and remove
  `building.byHand`. Verify the i18n key-parity test passes and every card's Buy button starts at
  the same x position within its card.
- [x] 2.4 Split the recipe line into spans and add the short mark to the input with a reserved
  marker slot, the danger colour, and hidden text plus tooltip (new `recipe.short` key). Verify in
  the browser with 2 soybeans that the tofu press shows the mark and the line does not reflow when
  soybeans arrive.
- [x] 2.5 Re-measure at 1280 × 720 with all 9 buildings; apply the fallbacks from the design until
  the tab fits without scrolling.

## 3. Click feedback

- [x] 3.1 Give `FloatingAmount.svelte` an optional art prop, wrap the by-hand button in a relative
  container with a float overlay, and float "+N" with the output art on every successful click (max
  5, `motion/floats.ts`). Verify in the browser that one click floats "+1" with the soybean art and
  that rapid clicking never moves the card.
- [x] 3.2 With reduced motion, increment a per-card counter instead and flash the stock figure with
  `use:flash`. Verify with the dev tools' reduced-motion emulation that no float appears and the
  stock figure highlights.

## 4. Rail

- [x] 4.1 Switch the rail's stock amounts to `liveCount` and give the amount column `min-width:
  9ch`. Verify in the browser that rows do not move while stock ticks past 1,000 and 1.2K → 1.23K.

## 5. Verification

- [x] 5.1 Run the tests, the type check and the production build and check they pass.
- [x] 5.2 Play-check in the browser as a new player in DE and EN: the first "Ernten" click floats
  "+1" and the card's stock shows 1 / 500; "Pressen" is disabled with the soybeans marked until 3
  are in stock; fill soybeans to 500 and see the full mark on the card; check 1280 × 720 (9 cards
  fit), 900 px and 375 × 667 (buttons 44 px, nothing scrolls sideways).
