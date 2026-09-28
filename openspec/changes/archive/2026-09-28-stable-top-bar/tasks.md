# Tasks

## 1. Text

- [x] 1.1 In `src/i18n/en.json` and `de.json`, change `topbar.income` to "Income / min" /
  "Einnahmen / min" and `topbar.incomeValue` to `+{amount}` in both. Verify the i18n key-parity
  test passes.

## 2. Top bar

- [x] 2.1 In `TopBar.svelte`, remove the play-time stat and its `formatDuration` import, and show
  money and income with `liveEuros` and awareness with `liveAmount`. Verify in the browser that a
  new game shows `€0.0` and no play time.
- [x] 2.2 Make `.stats` a three-track grid (`repeat(3, minmax(0, 11rem))`) with money, income and
  awareness pinned to columns 1-3, labels ellipsised with a `title`, and values never clipped.
  Remove the phone-only `flex-wrap` rules for the stats and use the smaller phone value fonts
  (0.95rem, money 1.1rem). Verify in the browser that money ticking from `€37.0` to `€37.5` and
  from `€999.9` to `€1.00K` moves nothing else in the top bar.
- [x] 2.3 Verify in the browser that awareness appearing (total earned reaches €100) does not move
  money or income, and that the money flash and the floating sale amount still start at the money
  value.

## 3. Play time in settings

- [x] 3.1 In `SavePanel.svelte`, add a line under the header row with the hourglass art
  (`ArtSlot kind="stat" id="playTime"`), the `playTime.label` text and the
  `formatDuration(playTime)` value in tabular digits. Verify in the browser that it counts up
  while Einstellungen is open and continues from the save after a reload.

## 4. Verification

- [x] 4.1 Run the tests and the production build and check both pass.
- [x] 4.2 Play-check in the browser at 1280 × 720, 375 × 667 and 320 px width, in DE and EN: set
  money, income and awareness to values in the millions and to `1.23e15` with the dev tools, and
  check that no stat wraps, no value is clipped, the top bar needs no horizontal scrolling and
  nothing moves while the values tick.
