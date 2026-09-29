# Tasks

## 1. Page scroll

- [x] 1.1 Load a late-game save with all three chains (for example, encode `simulate({ minutes: 90
  })`'s final state into both save slots). At 1280 × 720 on the Verkauf tab, confirm the bug:
  `document.documentElement.scrollHeight` is larger than the viewport. Find the element whose
  track grows with the bulk rows.
- [x] 1.2 Fix the layout so the scrolling content area is constrained (design decision 6, no
  `overflow: hidden` on body). Verify at 1280 × 720 and 1280 × 800 that the page scrollHeight
  equals the viewport on every tab, and that only `main.tab-content` scrolls on the Verkauf tab.

## 2. One-line rows at ≥ 1024 px

- [x] 2.1 Rework `BulkOfferCell.svelte` into fixed tracks (price · flood slot · button · cost for
  MegaMeat): single-line button, flood slot of fixed width that is empty at 100 %, cost beside the
  button. Verify at 1280 × 800 that every row is at most 48 px tall and that the soybean button
  doesn't move when MegaMeat's soybean market goes from 100 % to 33 % (sell once and compare its
  `getBoundingClientRect`).
- [x] 2.2 Adjust `BulkBuyersPanel.svelte`: the column tracks for the one-line layout; resource name
  truncated with a tooltip; buyer line clamped to one line with the full text as a tooltip; no gap
  between the intro and the share choice. Verify the "Buyers line up" and "Groups line up"
  scenarios in the browser.
- [x] 2.3 Make the sticky share bar opaque and keep rows and chain separators from showing above it
  (design decision 5). Verify by scrolling halfway down at 1280 × 800: no label above the bar, and
  the first row under it is fully visible.

## 3. Narrow screens

- [x] 3.1 Below 1024 px: resource line, then the buyer cells side by side. Each cell is its price
  and flood slot above its button, with MegaMeat's cost as the button's second line. Verify that
  rows are at most 64 px at 900 px and at most 100 px at 375 px and 320 px, that buttons are at
  least 44 px below 768 px, and that there is no horizontal scroll.

## 4. Verification

- [x] 4.1 Run `npm run check`, `npm test`, `npm run build` and `openspec validate
  fix-bulk-panel-height --strict`, and verify all pass.
- [x] 4.2 Browser check at 1280, 900, 375 and 320 px in DE and EN, light and dark, with the
  late-game save. Fill in the table in design.md ("Measurable checks") with the measured page
  scrollHeight and max row height per width, and attach before/after screenshots at 1280 × 800
  and 375 px to the report.
- [x] 4.3 Rebuild the container (`docker compose up -d --build web`) so the user can playtest.
