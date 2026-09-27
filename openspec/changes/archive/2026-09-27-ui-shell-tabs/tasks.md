# Tasks

## 1. Game helpers (test first)

- [x] 1.1 Write Vitest tests in `src/game/systems/buildings.test.ts` for `nextLockedBuildings(state)`, then implement it in `src/game/systems/buildings.ts`. Verify `npm test` passes. The tests cover:
  - a new game gives the wheat field and seitan kitchen
  - €200 earned gives the Leverkas oven
  - €1,500 earned gives the oat field, oat mill and café bar, in production order
  - everything unlocked gives an empty list
- [x] 1.2 Write tests for `firstUpgradeAt()` (30) and implement it in `src/game/systems/upgrades.ts`. Verify `npm test` passes.
- [x] 1.3 Write tests for `firstAktionAt()` (1,000; ignores the fact check and the viral video) and implement it in `src/game/systems/aktionen.ts`. Verify `npm test` passes.

## 2. Tab and badge rules (test first)

- [x] 2.1 Write `src/ui/tabs.test.ts`, then implement `src/ui/tabs.ts` with `TabId`, `TABS`, `tabFromHash` and `resolveTab`. Verify `npm test` passes. The tests cover:
  - each fragment maps to its tab, case-insensitively
  - empty, unknown, `#dev` and `#impressum` give null
  - a locked or null tab resolves to Produktion
  - Einstellungen and Produktion are never locked
- [x] 2.2 Write `src/ui/badges.test.ts`, then implement `src/ui/badges.ts` with `availability(state)` and `hasNew(seen, now)`. Verify `npm test` passes. The tests cover:
  - a newly offered upgrade shows up under Upgrades
  - a newly unlocked species or shelter shows up under Lebenshof
  - a newly unlocked building shows up under Produktion
  - a started counter-event shows up under Aktionen
  - equal sets give no badge
- [x] 2.3 Add `currentTab` to `src/ui/route.svelte.ts` (hashchange; `replaceState` to `#produktion` when resolving away from a locked or unknown tab) and add `src/ui/badges.svelte.ts` (seen per tab, seeded at start-up, following the open tab). Verify `npm run check` passes and `src/legal/route.test.ts` is unchanged and green.

## 3. Tokens, fonts and the art slot

- [x] 3.1 Install `@fontsource-variable/fraunces` and `@fontsource-variable/nunito`, import them in `src/main.ts`, and set `--font-heading` and `--font-ui`. Verify `npm run build` emits the woff2 files under `dist/assets` and the built HTML and CSS reference no external font host.
- [x] 3.2 Rewrite `src/app.css` with the paper and ink tokens for light and dark, plus the shared card, button, outline and focus-ring styles, keeping the old token names mapped so the existing panels still render. Verify it with a small script in the scratchpad that computes the contrast ratios: text pairs are at least 4.5:1 and outline pairs at least 3:1 in both schemes.
- [x] 3.3 Add `src/ui/ArtSlot.svelte` (kind, id and size 48, 32 or 20; monogram tile tinted by chain or kind; `aria-hidden`). Verify `npm run check` passes.

## 4. Shell

- [x] 4.1 Add the i18n keys from the design (tab names, lock hint, rail, by hand, locked-until, top bar labels, settings, banner link) to `de.json` and `en.json`. Verify the dictionary parity test passes.
- [x] 4.2 Build `TopBar.svelte`, replacing `Header`, `Money` and `PlayTime`. It shows brand, money, income per minute, awareness once the Lebenshof is unlocked, play time, the DE/EN toggle and the ⚙ link to `#einstellungen`. Verify in the browser that the values update every tick.
- [x] 4.3 Build `TabNav.svelte`:
  - links with `aria-current`
  - locked tabs as `aria-disabled` with the visible "ab €X verdient" hint
  - a badge dot with its screen-reader text

  Verify in the browser, with a fresh save, that Lebenshof, Upgrades and Aktionen show locked with €100, €30 and €1K.
- [x] 4.4 Build `ResourceRail.svelte`, absorbing `StockPanel`:
  - stock with trend and short marks
  - customers and orders
  - the Sell button or assistant note
  - the overstock line

  Verify selling from the rail on a non-Produktion tab changes money, and delete `StockPanel.svelte`.
- [x] 4.5 Build `Alerts.svelte` with `Notices` and a new `CounterEventBanner.svelte` (moved out of `AktionenPanel`, with a link to `#aktionen` while the fact check can run). Verify the banner shows on the Produktion tab during an event, using a save that has an active event.
- [x] 4.6 Rebuild `App.svelte` as the shell grid (top bar, ticker, alerts, tabs plus content plus rail, footer) rendering only the current tab, and slim `Footer.svelte` to one line. Verify that `#impressum`, `#datenschutz` and `#dev` still open, and that back from a legal page returns to the tab it was opened from.

## 5. Tabs

- [x] 5.1 Build `ProductionTab.svelte`, `BuildingCard.svelte` and the locked-card state:
  - one row per chain
  - each card with art slot, name, count, rate, recipe, progress bar, Buy and by-hand buttons
  - by-hand buttons labelled with `manual.<id>`

  Delete `ChainPanel`, `BuildingRow` and `ManualActions`. Verify in the browser that a new game shows the soy row plus locked wheat field and seitan kitchen cards at €200, and that 3 by-hand clicks on the soybean field give 3 soybeans.
- [x] 5.2 Build `SalesTab.svelte` (SalesPanel without the Sell button, plus BulkBuyersPanel as buyer cards). Verify the assistant hire button and both buyers work from the tab.
- [x] 5.3 Restyle `UpgradesPanel`, `LebenshofPanel` and `AktionenPanel` as card grids with art slots, and drop their hidden-until wrappers from `App`. Verify that buying an upgrade, rescuing an animal and running an Aktion work.
- [x] 5.4 Build `SettingsTab.svelte` (language toggle, `SavePanel`, legal links, Ko-fi). Verify that exporting and re-importing a save works from the tab.

## 6. Responsive layouts

- [x] 6.1 Add the 768–1023 px compact rail (names visually hidden) and the page-fits rule for 1024 px and wider (only `.tab-content` scrolls). Verify at 1280 × 720 with a save that has all tabs unlocked: the document does not scroll and all 9 building cards are visible.
- [x] 6.2 Add the phone layout below 768 px:
  - a bottom tab bar with icon and label and targets of at least 44 px
  - a sticky rail strip with money, Sell and the stock toggle
  - a stock sheet with `aria-expanded` that closes on Escape
  - content padding for the fixed bars

  Verify at 375 × 667 and 320 × 640 that nothing scrolls horizontally, and that the drawer opens and closes.

## 7. Verification

- [x] 7.1 Run `npm test`, `npm run check` and `npm run build`. All pass.
- [x] 7.2 Play-check in the headless browser on the dev server and save screenshots to the scratchpad. The checks:
  - a new game (locked tabs, soy row, locked cards)
  - a mid-game save at 1280 × 720, light and dark (every tab)
  - 900 px wide
  - 375 px wide (bottom bar, stock drawer)
  - the back button across tabs, a reload keeping the tab, and `#aktionen` while locked falling back to Produktion
  - a badge appearing on Upgrades when an offer arrives, and clearing when the tab is opened
  - every font request going to the same origin
- [x] 7.3 Rebuild and restart the Docker container with `docker compose up --build -d` and leave it running. Verify the game at http://localhost:8234 shows the new shell.
