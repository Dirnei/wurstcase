# Spec Delta

## Purpose

Lays out the game in one screen: an always-visible top bar and resource rail, and tabs that
switch the main area between production, sales, upgrades, the Lebenshof, Aktionen and settings,
so the player never has to scroll to find what they need.

## ADDED Requirements

### Requirement: Top bar
The game view SHALL show a top bar on every tab with:
- the game's name
- money
- income per minute
- play time
- the DE/EN toggle
- a button that opens the Einstellungen tab

Once the Lebenshof is unlocked, the top bar SHALL also show the awareness pool. The news ticker
SHALL be shown directly below the top bar.

#### Scenario: Top bar at the start
- **WHEN** a new game starts
- **THEN** the top bar shows €0, the income per minute, the play time and the DE/EN toggle, and
  no awareness

#### Scenario: Awareness appears
- **WHEN** the total money earned reaches €100
- **THEN** the top bar also shows the awareness pool

#### Scenario: Visible on every tab
- **WHEN** the player opens the Verkauf tab and then the Einstellungen tab
- **THEN** the top bar and the news ticker stay visible with the same values

### Requirement: Tabs
The game view SHALL offer these tabs in this order, each with a label in the selected language:
Produktion, Verkauf, Upgrades, Lebenshof, Aktionen and Einstellungen. Exactly one tab SHALL be
shown at a time, and the tab strip SHALL mark the current one visibly and for screen readers. A
new game SHALL open on Produktion.

#### Scenario: Switch tab
- **WHEN** the player chooses the Verkauf tab
- **THEN** the Verkauf content is shown, the Produktion content is not, and Verkauf is marked as
  the current tab

#### Scenario: Labels follow the language
- **WHEN** the player switches to English
- **THEN** the tabs read Production, Sales, Upgrades, Lebenshof, Campaigns and Settings

### Requirement: Tabs in the address
Each tab SHALL have its own address fragment, the same in every language: `#produktion`,
`#verkauf`, `#upgrades`, `#lebenshof`, `#aktionen` and `#einstellungen`. Opening a fragment SHALL
show its tab. The browser's back and forward buttons SHALL move between tabs, and a reload SHALL
keep the current tab. An address without a fragment, with an unknown fragment or with a locked
tab's fragment SHALL show Produktion. The fragments `#dev`, `#impressum` and `#datenschutz` SHALL
keep working as before. Switching tabs SHALL NOT reset or pause the game.

#### Scenario: Reload keeps the tab
- **WHEN** the player is on the Lebenshof tab and reloads the page
- **THEN** the Lebenshof tab is shown

#### Scenario: Back button
- **WHEN** the player opens Verkauf, then Upgrades, then presses the browser's back button
- **THEN** the Verkauf tab is shown

#### Scenario: Locked tab by address
- **WHEN** the Aktionen tab is locked and the player opens `#aktionen`
- **THEN** the Produktion tab is shown

#### Scenario: Legal page still reachable
- **WHEN** the player opens `#impressum`
- **THEN** the Impressum is shown as before

### Requirement: Locked tabs
The Upgrades, Lebenshof and Aktionen tabs SHALL be locked until their content unlocks. A locked
tab SHALL stay visible in the tab strip, dimmed and marked as locked, and SHALL NOT open. It SHALL
show, as visible text and for screen readers, the total money earned at which it unlocks. Once
unlocked, a tab SHALL stay unlocked for the rest of the game.

#### Scenario: Locked Lebenshof
- **WHEN** a new game starts
- **THEN** the Lebenshof tab is shown locked with the hint that it unlocks at €100 earned, and
  choosing it keeps the current tab

#### Scenario: Tab unlocks
- **WHEN** the total money earned reaches €100
- **THEN** the Lebenshof tab can be opened

### Requirement: Tab badges
A tab other than the current one SHALL show a badge when something there became available since
the player last had that tab open:
- Produktion: a building unlocked
- Upgrades: an upgrade came on offer
- Lebenshof: a species or shelter type unlocked
- Aktionen: an Aktion unlocked or a counter-event started

The badge SHALL be announced to screen readers as part of the tab's name. Opening the tab SHALL
clear its badge. The tab that is open never shows a badge. Badges SHALL NOT be saved; after a
reload no tab shows a badge.

#### Scenario: New upgrade while on another tab
- **WHEN** the player is on the Produktion tab and an upgrade comes on offer
- **THEN** the Upgrades tab shows a badge

#### Scenario: Badge clears
- **WHEN** the Upgrades tab shows a badge and the player opens it
- **THEN** the badge is gone

#### Scenario: Tab unlocks with a badge
- **WHEN** the total money earned reaches €100 while the player is on Produktion
- **THEN** the Lebenshof tab unlocks and shows a badge

### Requirement: Resource rail
The game view SHALL show a resource rail on every tab. It SHALL show:
- every resource that is shown in the stock, with its amount, trend mark and short-supply mark as
  the stock panel requires
- customers of the population
- open orders of the cap
- the Sell button with what the sale would earn or, once the shop assistant is hired, the note
  that the assistant is selling
- the overproduction message while it applies

#### Scenario: Sell from any tab
- **WHEN** the player is on the Lebenshof tab with 10 Tofu-Wurst in stock and open orders
- **THEN** the rail shows the Sell button with the sale's value, and choosing it sells as the
  Sell button does

#### Scenario: Stock on every tab
- **WHEN** the player switches from Produktion to Aktionen
- **THEN** the rail still shows the same stock amounts and trend marks

### Requirement: Production tab
The Produktion tab SHALL show the buildings in one row per chain, in chain order (soy, wheat,
oats), each row in production order (field, processing, product). Each shown building SHALL be
one card with its name, count, output per second, recipe (for buildings with an input), progress
bar, a Buy button with its price, and the manual action for the same step. The manual action
SHALL work as the manual actions require.

#### Scenario: Start of the game
- **WHEN** a new game starts
- **THEN** the Produktion tab shows a soy row with cards for the soybean field, tofu press and
  Tofu-Wurst kitchen, each with a Buy button and a by-hand button, and a wheat row with the
  locked cards the unlock rules require

#### Scenario: By hand on the card
- **WHEN** the player chooses the by-hand button on the soybean field card 3 times
- **THEN** the soybean stock is 3

### Requirement: Sales tab
The Verkauf tab SHALL show the sales figures, the sold amount per product, the shop assistant
offer, the overproduction and demand-limit messages, and the bulk buyers.

#### Scenario: Sales content
- **WHEN** the player opens the Verkauf tab while the bulk buyers are unlocked
- **THEN** it shows customers, open orders, demand, income, the sold amounts and both bulk buyers

### Requirement: Settings tab
The Einstellungen tab SHALL be always unlocked and SHALL show the DE/EN toggle, saving (export
and import), and the Impressum, Datenschutz and Ko-fi links.

#### Scenario: Export from settings
- **WHEN** the player opens Einstellungen and chooses export
- **THEN** the save is exported as the save system requires

### Requirement: Screen fits without page scrolling
At a viewport of 1280 × 720 px or larger, the whole game view SHALL fit the viewport without the
page scrolling:
- the top bar, ticker, tab strip, rail and footer SHALL stay in place
- only a tab's own content area MAY scroll, when its content is taller than the space left

#### Scenario: Mid-game on a laptop screen
- **WHEN** all tabs are unlocked, all 9 buildings are shown and the viewport is 1280 × 720 px
- **THEN** the page has no vertical scrollbar, and the Produktion tab shows all 9 building cards

### Requirement: Small screens
Below 1024 px width:
- the rail SHALL become compact, with amounts and marks and without resource names
- the tab strip SHALL leave out Einstellungen, which stays reachable through the top bar's
  settings button

Below 768 px width:
- the tabs SHALL move to a bar at the bottom of the screen, each tab with an icon and a label
- the rail SHALL become a strip that shows money and the Sell button
- a control SHALL open the full stock and close it again

At every width down to 320 px, nothing SHALL need horizontal scrolling, and every button SHALL be
at least 44 × 44 px on screens below 768 px.

#### Scenario: Phone layout
- **WHEN** the viewport is 375 × 667 px
- **THEN** the tabs are at the bottom, the Sell button is visible, and no content needs
  horizontal scrolling

#### Scenario: Stock drawer
- **WHEN** the viewport is 375 px wide and the player opens the stock
- **THEN** every shown resource is listed with its amount and trend mark, and the player can close
  it again

### Requirement: Paper look in light and dark
The game view SHALL use the storybook paper look: paper panels with ink outlines. It SHALL follow
the system's colour scheme, with light paper in light mode and dark parchment in dark mode. In
both schemes:
- normal text SHALL have a contrast of at least 4.5:1 against its background
- outlines of controls SHALL have a contrast of at least 3:1
- keyboard focus SHALL be visibly marked

#### Scenario: Dark mode
- **WHEN** the system uses a dark colour scheme
- **THEN** the game shows dark parchment panels with light text that meets the contrast minimum

### Requirement: Bundled fonts
The game's fonts SHALL be served from the game's own origin. The game SHALL remain usable with
the fallback system font while its fonts load.

#### Scenario: No font requests to other hosts
- **WHEN** all network requests made while loading and playing are recorded
- **THEN** every font request goes to the game's own origin
