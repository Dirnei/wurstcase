# Design: ui-shell-tabs

## Context

See proposal.md for the motivation. The current state:

- `App.svelte` stacks 13 panels in a 960 px column. `Header` holds the logo and the DE/EN toggle.
  `Footer` holds the legal and Ko-fi links.
- The view comes from `route.svelte.ts` through `routeFromHash` in `src/legal/route.ts`, which
  knows `impressum`, `datenschutz` and `dev`. Every other hash maps to `'game'`. `backToGame`
  relies on this: it only uses `history.back()` when the previous hash was a game hash.
- Components read state through `readGame(select)`, which re-runs after every tick, and act
  through `act(action)`. There are no component tests. Tests cover `src/game`, `src/format`,
  `src/i18n`, `src/save`, `src/loop` and `src/legal`.
- The panels already use shared `.panel` and `.game-button` classes and the tokens in
  `app.css`: `--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--accent`,
  `--on-accent` and `--danger`.
- The approved look (from the brainstorming mockups):
  - **Layout C**: top tabs plus a right rail.
  - **Storybook art style**: brown ink lines on warm paper.
  - **Dark mode**: a dusk variant with dark parchment.
  - **Motion**: subtle.

  Only the layout and tokens are in scope here. Art and motion follow in `ui-art` and
  `ui-motion`.

## Goals / Non-Goals

**Goals:**
- **A single seam for art.** Every illustration renders through one `ArtSlot` component, so
  `ui-art` only swaps its internals.
- **Pure, unit-tested rules** for tab routing, lock state, unlock hints and badges.
- **No change to game behaviour or saves.** `src/game/` only gains read-only helpers.

**Non-Goals:**
- Component or visual regression test infrastructure. Visual checks stay manual, with
  screenshots from the headless browser.
- Refactoring the logic inside the panels. They are moved and restyled, not rewritten.

## Decisions

### 1. Tabs live next to the legal routes, not inside them
`src/legal/route.ts` stays unchanged. Tab hashes keep mapping to `'game'`, so `backToGame` and the
legal-page history keep working as they are.

A new pure module, `src/ui/tabs.ts`, owns:
- `TabId` (`'produktion' | 'verkauf' | 'upgrades' | 'lebenshof' | 'aktionen' | 'einstellungen'`)
- `TABS` (the order)
- `tabFromHash(hash): TabId | null`
- `resolveTab(requested, isUnlocked): TabId`

`route.svelte.ts` keeps a second piece of `$state`, `currentTab`, updated on `hashchange`. When
the requested tab is unknown or locked, it shows Produktion and rewrites the hash with
`history.replaceState`, so the address and the view agree.

The tab strip uses plain links (`<a href="#verkauf" aria-current="page">`) inside a `<nav>`.
Links give back and forward navigation, reload persistence, middle-click and keyboard support
for free.

- *Alternative: ARIA `tablist` with `role="tab"` and arrow keys.* Rejected because the tabs are
  addressable pages with history, which is the navigation pattern, not the in-page tab-widget
  pattern.
- *Alternative: a combined `Route` union.* Rejected because it would ripple into `LegalPage`,
  `App` and every `routeFromHash` test for no behavioural gain.

### 2. Locked tabs and unlock hints come from `src/game/systems`
Whether a tab is unlocked already comes from the game systems: `isUpgradesUnlocked`,
`isLebenshofUnlocked` and `isAktionenUnlocked`. The hint's threshold is derived from content with
new read-only helpers, so the thresholds are not duplicated in the UI:

- `src/game/systems/upgrades.ts`: `firstUpgradeAt(): number`, the lowest `earned` amount among
  upgrades whose conditions are all `earned` clauses (€30 today).
- `src/game/systems/aktionen.ts`: `firstAktionAt(): number`, the lowest `unlockAt` among Aktionen
  without `requiresSpecies` or `endsEvent` (€1,000 today).
- The Lebenshof uses the existing `LEBENSHOF_UNLOCK_AT`.
- `src/game/systems/buildings.ts`: `nextLockedBuildings(state): BuildingId[]`, the locked
  buildings that share the lowest `unlockAt`, in production order. The Produktion tab uses it for
  the locked cards.

Each helper gets unit tests next to its system. No content entries change. A locked tab is
rendered as `<a aria-disabled="true">` without an `href`. It stays in the reading order and
carries the hint as visible text.

### 3. Badges compare availability snapshots
`src/ui/badges.ts` (pure) exposes:
- `availability(state): Record<BadgeTab, ReadonlySet<string>>`: the unlocked building ids, the
  offered upgrade ids, the offered species and shelter ids, and the offered Aktion ids plus the
  active event id.
- `hasNew(seen, now): boolean`

`badges.svelte.ts` keeps `seen` per tab in memory:
- At start-up, `seen` is set to the current availability, so a reload shows no badges.
- While a tab is open, its `seen` follows the current availability on every read.
- A tab shows a badge when `hasNew(seen[tab], now[tab])` is true.

Nothing is saved, so the save format is untouched.

- *Alternative: badges on "affordable" items.* Rejected because affordability flickers as money
  rises and falls, and the badge would nag.

### 4. Layout: one CSS grid sized to the viewport
The shell is a grid with rows `auto auto auto 1fr auto`: top bar, ticker, alerts (notices and
counter-event banner), then tabs plus body, then footer. Its height is `100dvh` at 1024 px and
wider. Inside the body, a two-column grid places the main area (`1fr`) and the rail (230 px).
Only `.tab-content` has `overflow-y: auto`. The maximum width is 1280 px, centred.

Breakpoints:
- **768–1023 px**: the rail shrinks to about 150 px. Resource names become visually hidden but
  stay readable for screen readers.
- **Below 768 px**:
  - The grid drops the fixed height and the document scrolls normally.
  - `TabNav` renders as a fixed bottom bar (icon plus label, at least 44 px tall).
  - The rail becomes a sticky strip above it with money, the Sell button and a "Vorrat" toggle.
  - The toggle (`aria-expanded`) opens a bottom sheet with the full stock. Escape or the toggle
    closes it.
  - The content gets bottom padding for the fixed bars.
  - The footer sits at the end of the scrolling content, which the legal spec allows because it
    only rules out horizontal scrolling.

Height budget at 1280 × 720:
- top bar 56, ticker 28, tab strip 36, footer 32, gaps 48, about 200 px in total
- 3 chain rows of cards at about 120 px plus labels, about 420 px

That leaves about 100 px spare for a notice or the banner. Beyond that, the content area scrolls.

### 5. Components
| New or changed | Role |
|---|---|
| `App.svelte` | The shell grid. Chooses the legal page, dev page or game as before. |
| `TopBar.svelte` (replaces `Header`) | Brand, stats (reuses `Money` and `PlayTime` logic), income, awareness, DE/EN toggle and ⚙ link. |
| `TabNav.svelte` | Tab links with lock state, hint and badge. The same markup restyles into the bottom bar. |
| `ResourceRail.svelte` (absorbs `StockPanel`) | Stock list, shop numbers, the Sell button or assistant note, the overstock line and the phone drawer. |
| `Alerts.svelte` | Wraps `Notices` and the new `CounterEventBanner.svelte`. The banner markup moves out of `AktionenPanel`. |
| `ProductionTab.svelte` and `BuildingCard.svelte` | Replace `ChainPanel`, `BuildingRow` and `ManualActions`, which are deleted. A card finds its manual action through `MANUAL_ACTIONS.find(a => a.building === id)`. `LockedBuildingCard` handles the locked state. |
| `SalesTab.svelte` | `SalesPanel` without the Sell button, which moves to the rail, plus `BulkBuyersPanel`. |
| `UpgradesPanel`, `LebenshofPanel`, `AktionenPanel` | Kept, restyled into card grids. The hidden-until checks move out of `App`, and the tab lock takes their place. |
| `SettingsTab.svelte` | Language toggle, `SavePanel`, legal links and Ko-fi. |
| `Footer.svelte` | Kept, slimmed to one line. |
| `ArtSlot.svelte` | `kind` (building, resource, species, shelter, aktion, buyer, tab or stat) and `id`. Renders a 48, 32 or 20 px paper tile with an ink border, a tint per chain or kind, and a one- or two-letter monogram. It is `aria-hidden`, because the visible name is always next to it. |

`Money.svelte` and `PlayTime.svelte` are merged into `TopBar` stat items. `Header.svelte`,
`ChainPanel.svelte`, `BuildingRow.svelte`, `ManualActions.svelte` and `StockPanel.svelte` are
deleted.

### 6. Tokens and fonts
`app.css` gets semantic tokens for both schemes:
- `--paper`, `--paper-2`, `--ink`, `--ink-muted`, `--line`, `--leaf`, `--on-leaf`, `--danger`,
  `--shadow`
- `--radius` (12 px), `--radius-sm` (8 px), `--outline` (1.6 px)
- `--font-heading` and `--font-ui`

The old token names are mapped onto the new ones during the move and removed at the end. Dark
mode stays on `prefers-color-scheme`.

Planned values:
- **Light**: paper `#fbf5e6`, ink `#4a3a28`, muted ink `#6e5c45`, leaf `#5d7a2c` with white text,
  danger `#a8412b`.
- **Dark**: paper `#2e2820`, ink `#efe4cc`, muted ink `#c7b89a`, leaf `#9cc265` with dark text,
  danger `#f0a08c`.

The contrast pairs are checked in the tasks with a small script, not by eye.

The fonts are `@fontsource-variable/fraunces` and `@fontsource-variable/nunito`, imported in
`main.ts`. Vite emits the woff2 files as same-origin assets, and the `font-display: swap` from
@fontsource keeps text visible while they load. Numbers use `font-variant-numeric: tabular-nums`.

- *Alternative: the Google Fonts CDN.* Rejected because it is a third-party request, which the
  legal-pages privacy requirement rules out.

### 7. i18n
New keys, in both `de.json` and `en.json`:
- `tab.<id>` and `tab.locked`
- `rail.stock`, `rail.shop` and `rail.drawer`
- `building.byHand` and `building.lockedUntil`
- `topbar.money`, `topbar.income`, `topbar.awareness` and `topbar.playTime`
- `settings.title`, `settings.language` and `settings.save`
- `banner.openAktionen`

`manual.<id>` stays, used as the accessible name of each by-hand button ("Sojabohnen ernten"),
while the visible label is the short "von Hand". The dictionary parity test covers the new keys.

## Risks / Trade-offs

- [Information hidden behind tabs, such as an upgrade becoming available] → The rail keeps
  everything time-critical visible, and badges point at new things.
- [The fixed-height layout breaks on short desktop windows] → Only the content area scrolls. The
  bars are compact, and below 600 px of height the layout falls back to the scrolling phone
  flow.
- [Losing the "By hand" panel confuses returning players] → The by-hand button sits on each
  building's card, where its step is. The tutorial hints are unchanged.
- [Spec drift in the other capabilities that mention a "stock panel" or "sales panel"] → The rail
  counts as the stock panel, and the Verkauf tab counts as the sales panel. The wording in those
  specs still holds, so no delta is needed.
- [The bundled fonts add about 150 KB] → Only the woff2 subsets for the characters on the page
  are downloaded, thanks to `unicode-range`.
- [Placeholder monograms look unfinished until `ui-art` lands] → They are styled as deliberate
  paper tiles and replaced in the next change.

## Migration Plan

UI only, with no save migration. Old bookmarks without a hash, or with legal or dev hashes, keep
working. Rollback means reverting the commit.
