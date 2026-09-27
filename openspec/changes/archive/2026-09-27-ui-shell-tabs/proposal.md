# Proposal: ui-shell-tabs

## Why

The game view is a single 960 px column of 13 stacked panels, about 3,400 px tall in mid-game.
Money sits at the top, while stock, bulk buyers and saving are 2,500 px further down, so playing
means scrolling back and forth all the time. Other idle games keep everything within one screen
and switch between areas with tabs. This change gives Wurst Case that structure and the visual
foundation (storybook paper look, tokens, bundled fonts) for the art and motion changes that
follow.

This is a UI restructuring that the planned change sequence in section 8 of the concept doc did
not foresee. It sits between #8 `upgrades` (done) and #9 `faktenbuch`. It covers the layout part
of #12 `settings-and-debug` early: the Einstellungen tab this change adds is where #12's settings
will go. The UI overhaul is planned as three changes: `ui-shell-tabs` (this one), `ui-art` and
`ui-motion`.

## What Changes

- New **game screen shell**:
  - An always-visible **top bar** with brand, money, income per minute, awareness (once the
    Lebenshof is unlocked), play time, the DE/EN toggle and a settings button, with the news
    ticker below it.
  - A **tab strip**: Produktion, Verkauf, Upgrades, Lebenshof, Aktionen and ⚙ Einstellungen.
  - A **main area** that shows one tab at a time.
  - A **resource rail** that always shows stock with trend marks, customers, open orders, the
    Sell button (or the assistant note) and the overproduction warning.
  - A slim **footer** with the legal and Ko-fi links.
- **Tabs live in the URL hash** (`#produktion`, `#verkauf`, `#upgrades`, `#lebenshof`,
  `#aktionen`, `#einstellungen`). Back and forward move between tabs, and a reload keeps the tab.
  An unknown or locked tab falls back to Produktion. `#dev`, `#impressum` and `#datenschutz`
  work as before.
- **Locked tabs** stay visible but dimmed, with their unlock hint (for example "ab €100
  verdient"). They replace the "panel is hidden until …" behaviour of Upgrades, Lebenshof and
  Aktionen.
- **Tab badges**: a dot on a tab when something there became available since the player last
  opened it. The badges are not saved.
- **Produktion tab**: the 9 buildings as a grid with one row per chain. Each **building card**
  combines the building (count, rate, recipe, progress bar, Buy) with its **by-hand action**, and
  the separate "By hand" panel is removed. The **next building to unlock** is shown as a locked
  card with its threshold, so the player sees their next goal.
- **Verkauf tab**: sales figures, sold per product, shop assistant, overproduction hints and the
  bulk buyers.
- **Upgrades, Lebenshof and Aktionen tabs**: the existing panels, restyled as card grids.
- **MegaMeat counter-event banner** moves out of the Aktionen panel and shows above the tabs,
  visible on every tab.
- **Einstellungen tab**: language, save export and import, the legal links and Ko-fi.
- **Responsive**:
  - 1024 px and wider: rail on the right, and the page itself does not scroll.
  - 768–1023 px: a compact rail with icons and numbers only.
  - Below 768 px: a bottom tab bar, a slim rail strip with a pull-up stock drawer, and no
    horizontal scrolling down to 320 px.
- **Storybook visual system**:
  - Paper and ink colour tokens for light and dark (dark parchment).
  - Ink outlines and card styles.
  - Fraunces for headings and Nunito for UI text, **bundled with the game**, so there are no
    third-party requests.
- **Art slots**: every building, resource, animal, shelter, Aktion, buyer and tab gets a slot
  for its illustration. This change fills the slots with simple lettered placeholders; `ui-art`
  replaces them.

## Capabilities

### New Capabilities
- `game-screen`: the tabbed game screen covers the top bar, tabs and their hash routes, locked
  tabs and badges, the resource rail, the building cards on the Produktion tab, the Einstellungen
  tab, the responsive layouts and the bundled fonts.

### Modified Capabilities
- `production-chain`: the next locked building is shown as a locked card with its unlock
  threshold. Until now, locked buildings were never shown.
- `upgrades`: "Upgrades panel hidden until the first offer" becomes "Upgrades tab locked until
  the first offer".
- `lebenshof`: "Lebenshof panel hidden until €100 earned" becomes "Lebenshof tab locked until
  €100 earned".
- `aktionen`: "Aktionen panel hidden until the first Aktion" becomes "Aktionen tab locked until
  the first Aktion".
- `megameat-events`: the counter-event banner shows above the tabs on every tab, no longer only
  in the Aktionen panel.

## Non-goals

- **Real illustrations, the landscape background, the dusk variant and the Lebenshof farm
  scene** are deferred to `ui-art`. This change ships placeholders in the art slots and a plain
  paper background.
- **Animations** (drifting clouds, blinking and hopping animals, buy pop, floating income) are
  deferred to `ui-motion`.
- **No game rules change.** Nothing in `src/game/` changes except small read-only helpers for
  the tab unlock thresholds. Saves are unaffected.
- **No new settings** such as sound or number format. Those stay with #12
  `settings-and-debug`.
- **Keyboard shortcuts** for tabs are not included.

## Impact

- **UI code**:
  - `src/App.svelte` is rebuilt as the shell.
  - New in `src/ui/`: `TopBar`, `TabNav`, `ResourceRail`, `ProductionTab`, `BuildingCard`,
    `SettingsTab`, `CounterEventBanner`, `ArtSlot`, and a pure `tabs.ts` for routes, locks and
    badges.
  - `Header`, `Footer`, `ManualActions`, `BuildingRow`, `ChainPanel`, `StockPanel`,
    `SalesPanel` and `AktionenPanel` are replaced or reshaped.
  - `route.svelte.ts` and `src/legal/route.ts` learn the tab routes.
  - `app.css` gets the new tokens.
- **Game code**: `src/game/systems/` gets read-only helpers that report when the Upgrades and
  Aktionen tabs unlock and which building unlocks next.
- **i18n**: new keys in `de.json` and `en.json` for tab names, lock hints, rail labels and the
  settings tab.
- **Dependencies**: `@fontsource-variable/fraunces` and `@fontsource-variable/nunito`, bundled
  by Vite.
- **Specs**: a new `game-screen` spec, plus deltas for `production-chain`, `upgrades`,
  `lebenshof`, `aktionen` and `megameat-events`.
- **Unchanged**: saves, the game loop, the dev page and the legal pages.
