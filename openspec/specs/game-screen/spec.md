# game-screen Specification

## Purpose
Lays out the game in one screen: an always-visible top bar and resource rail, and tabs that
switch the main area between production, sales, upgrades, the Lebenshof, Aktionen and settings,
so the player never has to scroll to find what they need.

## Requirements

### Requirement: Top bar
The game view SHALL show a top bar on every tab with:
- the game's name
- money
- income per minute

Once the Lebenshof is unlocked, the top bar SHALL also show the awareness pool. The news ticker
SHALL be shown directly below the top bar. The top bar SHALL NOT show the play time, the language
toggle or a button that opens the Einstellungen tab.

The top bar SHALL keep a stable layout while the game runs. A value that changes SHALL NOT move,
resize or re-wrap any other element of the top bar:

- Money, income and awareness SHALL each have a slot of its own. The slots SHALL have equal widths
  that come from the top bar's layout, not from the values in them.
- The awareness slot SHALL keep its space before the Lebenshof is unlocked, so money and income do
  not move when awareness appears.
- The values SHALL use the fixed-decimal form of the number format, in digits of equal width.
- The income label SHALL name the unit (per minute), and the income value SHALL show only the
  signed amount.

#### Scenario: Top bar at the start
- **WHEN** a new game starts
- **THEN** the top bar shows the game's name, €0.0 and the income per minute, and no awareness,
  no play time, no language toggle and no settings button

#### Scenario: Awareness appears
- **WHEN** the total money earned reaches €100
- **THEN** the top bar also shows the awareness pool, and money and income stay where they were

#### Scenario: Visible on every tab
- **WHEN** the player opens the Verkauf tab and then the Einstellungen tab
- **THEN** the top bar and the news ticker stay visible with the same values

#### Scenario: Money gains a decimal
- **WHEN** the money changes from €37.0 to €37.5, or from €1.20K to €1.23K
- **THEN** the income and the awareness do not move

#### Scenario: Money crosses a thousand
- **WHEN** the money changes from €999.9 to €1.00K
- **THEN** no other element of the top bar moves or changes size

#### Scenario: Phone width
- **WHEN** the viewport is 320 px wide and money, income and awareness each show a German value
  in the millions
- **THEN** all three values fit their slots on one line each, and the top bar needs no horizontal
  scrolling

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
show, as visible text and for screen readers, what unlocks it: for the Upgrades and Lebenshof tabs
the total money earned at which it unlocks, for the Aktionen tab the awareness it needs. Once
unlocked, a tab SHALL stay unlocked for the rest of the game.

#### Scenario: Locked Lebenshof
- **WHEN** a new game starts
- **THEN** the Lebenshof tab is shown locked with the hint that it unlocks at €100 earned, and
  choosing it keeps the current tab

#### Scenario: Tab unlocks
- **WHEN** the total money earned reaches €100
- **THEN** the Lebenshof tab can be opened

#### Scenario: Locked Aktionen
- **WHEN** a new game starts and the game is in German
- **THEN** the Aktionen tab is shown locked with the hint "ab 50 Aufmerksamkeit"

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
- the storeroom: its illustration, name and level, the room per good, and an Expand button with
  the price of the next level, as the storeroom requires
- every resource that is shown in the stock, with its amount, trend mark, short-supply mark and
  full mark as the stock panel and the storeroom require
- customers of the population
- open orders of the cap
- the Sell button with what the sale would earn or, once the shop assistant is hired, the note
  that the assistant is selling
- the overproduction message while it applies

The stock SHALL be grouped by production chain, in the chain order of the Produktion tab (soy,
oats, wheat). Each group SHALL be labelled with the chain's name in the selected language, and
SHALL list its resources in production order: raw ingredient, intermediate, product. A group
SHALL be shown only while at least one of its resources is shown. Where the rail hides resource
names, the group label MAY be hidden too, but the groups SHALL stay visibly separated and the
label SHALL stay available to screen readers.

The stock amounts SHALL use the whole-count form of the number format.

The full mark SHALL have a text label in the selected language that screen readers announce and
that shows as a tooltip; colour SHALL NOT be the only way it is shown. The short overproduction
note in the rail SHALL NOT say that the storeroom is full.

#### Scenario: Sell from any tab
- **WHEN** the player is on the Lebenshof tab with 10 Tofu-Wurst in stock and open orders
- **THEN** the rail shows the Sell button with the sale's value, and choosing it sells as the
  Sell button does

#### Scenario: Stock on every tab
- **WHEN** the player switches from Produktion to Aktionen
- **THEN** the rail still shows the same stock amounts and trend marks

#### Scenario: Soy line together
- **WHEN** the soy and oat chains are unlocked
- **THEN** the stock shows a Soy group with soybeans, tofu and Tofu-Wurst in that order, followed
  by an Oats group with oats, oat drink and Hafer-Cappuccino

#### Scenario: Locked chain has no group
- **WHEN** only the soy chain is unlocked and the player has no wheat, seitan or Leverkas
- **THEN** the stock shows no Wheat group

#### Scenario: Partly shown chain
- **WHEN** the wheat field and seitan kitchen are unlocked but the Leverkas oven is not, and there
  is no Leverkas in stock
- **THEN** the Wheat group shows wheat and seitan, and no Leverkas

#### Scenario: Phone drawer
- **WHEN** the viewport is 375 px wide and the player opens the stock
- **THEN** the drawer shows the storeroom and the same groups with their chain names

#### Scenario: Storeroom at the start
- **WHEN** a new game starts
- **THEN** the rail shows the storeroom at level 1 with room for 500 per good and an Expand
  button for €100

#### Scenario: Full good in the rail
- **WHEN** soybeans are full
- **THEN** the soybean row shows the full mark, with the label "full" as tooltip and for screen
  readers

#### Scenario: Expand from the rail
- **WHEN** the player has €150 and chooses Expand in the rail
- **THEN** the rail shows level 2 with room for 1,000 per good, and the money drops by €100

#### Scenario: Rail stock in thousands
- **WHEN** the soybean stock grows from 1,200 to 1,230
- **THEN** the rail shows `1.20K` and then `1.23K`, and no row moves

### Requirement: Production tab
The Produktion tab SHALL show the buildings in one row per chain, in chain order (soy, wheat,
oats), each row in production order (field, processing, product). Each shown building SHALL be
one card with its name, count, output per second, recipe (for buildings with an input), a stock
line, progress bar, a Buy button with its price, and the manual action for the same step. The
manual action SHALL work as the manual actions require.

The stock line SHALL show the stock of the good the building makes, the storeroom's room for it,
and a meter filled by stock ÷ room. While the good is full, the stock line SHALL show the full mark
as the storeroom requires.

The by-hand button SHALL show a short verb for its step in the selected language (for example
"Ernten", "Pressen", "Backen"), and SHALL keep the full action text ("Tofu pressen") as tooltip and
screen-reader label. While a step lacks input, the input in the card's recipe line SHALL carry the
short mark: a visible mark, the short colour, and the text "not enough" as tooltip and for screen
readers.

The card SHALL keep a stable layout while the game runs. A value that changes SHALL NOT move,
resize or re-wrap anything on the card or in its row:
- the stock and the room SHALL use the whole-count form of the number format, in digits of equal
  width, right-aligned in slots whose width comes from the card's layout
- the full mark and the short mark SHALL take space that is reserved whether or not they show
- the float and the highlight from manual production SHALL be drawn over the card

With every building of Act 1 unlocked, the tab SHALL still fit a 1280 × 720 viewport without
scrolling, as the screen-fit requirement requires.

#### Scenario: Start of the game
- **WHEN** a new game starts
- **THEN** the Produktion tab shows a soy row with cards for the soybean field, tofu press and
  Tofu-Wurst kitchen, each with a Buy button, a by-hand button and a stock line, and a wheat row
  with the locked cards the unlock rules require

#### Scenario: By hand on the card
- **WHEN** the player chooses the by-hand button on the soybean field card 3 times
- **THEN** the soybean stock is 3, and the soybean field card's stock line shows 3 of 500

#### Scenario: Verb on the button
- **WHEN** the game is in German
- **THEN** the soybean field's by-hand button reads "Ernten" and the tofu press's reads "Pressen",
  with "Sojabohnen ernten" and "Tofu pressen" as their tooltips

#### Scenario: Missing input
- **WHEN** there are 2 soybeans
- **THEN** the tofu press's by-hand button is disabled, and the soybeans in its recipe line carry
  the short mark with the text "not enough"

#### Scenario: Full good on the card
- **WHEN** soybeans are full at 500
- **THEN** the soybean field card's stock line shows 500 of 500, a full meter and the full mark

#### Scenario: Stock ticks without twitching
- **WHEN** the tofu stock grows from 999 to 1,000 and from 1.20K to 1.23K
- **THEN** no text, button or meter on any card moves or changes size

#### Scenario: All chains on a laptop screen
- **WHEN** every building of Act 1 is unlocked and the viewport is 1280 × 720 px
- **THEN** the Produktion tab shows all 9 cards without scrolling

### Requirement: Sales tab
The Verkauf tab SHALL show the sales figures, the sold amount per product, the shop assistant
offer, the overproduction and demand-limit messages, and the bulk buyers.

The tab SHALL keep a stable layout while the game runs. A value that changes SHALL NOT move,
resize or re-wrap any other element on the tab:

- Customers, open orders, demand and income SHALL each be shown as a cell in a grid, with a label
  and a right-aligned value in digits of equal width.
- The sold amounts SHALL be shown as a table with the product (icon and name) in one column and
  the amount per minute right-aligned in another. The table SHALL keep its column widths while
  the amounts change.
- Each bulk offer SHALL be a sell button that fills the width of its buyer card. The resource
  SHALL be on the left, and the units and price right-aligned on the right. The lot size and any
  cost of the sale SHALL be shown on a separate line below the button.
- The buyer cards SHALL share one row grid: side by side, their headers take the same height and
  the same resource sits at the same height in every card that buys it.
- Demand, income, the sold amounts, and the units and price on the bulk sell buttons SHALL use
  the fixed-decimal form of the number format.

#### Scenario: Sales content
- **WHEN** the player opens the Verkauf tab while the bulk buyers are unlocked
- **THEN** it shows customers, open orders, demand, income, the sold amounts and both bulk buyers

#### Scenario: Income gains a decimal
- **WHEN** the income changes from €37.0 per minute to €37.5 per minute
- **THEN** no other figure, label or button on the Verkauf tab moves or changes size

#### Scenario: Sold amount changes
- **WHEN** Tofu-Wurst's sold amount changes from 3.0 to 12.5 per minute
- **THEN** the product names and the other sold amounts stay where they are

#### Scenario: Bulk price grows
- **WHEN** the soybean stock grows so the MegaMeat button's price changes from €9.0 to €14.0
- **THEN** the button keeps its size and the lot line below it does not move

#### Scenario: Buyers line up
- **WHEN** both buyer cards sit side by side and MegaMeat's lot line wraps onto two lines
- **THEN** soybeans, tofu and every other resource both buyers take still start at the same height
  in both cards

#### Scenario: Phone width
- **WHEN** the viewport is 375 px wide and the player opens the Verkauf tab
- **THEN** the figure grid, the sold table and the bulk buttons fit without horizontal scrolling

### Requirement: Settings tab
The Einstellungen tab SHALL be always unlocked and SHALL show the DE/EN toggle, the theme choice,
saving (export and import), and the Impressum, Datenschutz and Ko-fi links. The saving section SHALL
also show the play time of the current game.

The theme choice SHALL offer System, Light and Dark, labelled in the selected language, and SHALL
mark the current choice. Choosing an option SHALL take effect at once, without a reload.

#### Scenario: Export from settings
- **WHEN** the player opens Einstellungen and chooses export
- **THEN** the save is exported as the save system requires

#### Scenario: Play time in settings
- **WHEN** the player has played for 1 hour and 5 minutes and opens Einstellungen
- **THEN** the saving section shows the play time `1:05:00`, labelled in the selected language,
  and it keeps counting up while the tab is open

#### Scenario: Choose dark
- **WHEN** the system uses a light colour scheme and the player chooses Dark in Einstellungen
- **THEN** the game switches to dark parchment and the dusk landscape at once, and Dark is marked
  as the current choice

#### Scenario: Default choice
- **WHEN** a player opens Einstellungen for the first time
- **THEN** System is marked as the current choice

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
- the tab strip SHALL still show every tab, Einstellungen included

Below 768 px width:
- the tabs SHALL move to a bar at the bottom of the screen, each tab with an icon and a label,
  Einstellungen included
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

#### Scenario: Settings on a tablet
- **WHEN** the viewport is 900 px wide
- **THEN** the tab strip shows Einstellungen as its last tab, and choosing it opens the tab

#### Scenario: Settings on a phone
- **WHEN** the viewport is 320 px wide
- **THEN** the bottom bar shows six tabs, Einstellungen last, each at least 44 × 44 px, with
  readable labels and no horizontal scrolling

### Requirement: Paper look in light and dark
The game view SHALL use the storybook paper look: paper panels with ink outlines. It SHALL show
light paper in the light theme and dark parchment in the dark theme. The theme in effect SHALL be
the player's choice of Light or Dark; with System, which is the default, it SHALL follow the
system's colour scheme and change with it while the game is open.

The choice SHALL be kept in the browser across visits, apart from the save, so starting a new game
or importing a save SHALL NOT change it. When the browser blocks storage, the choice SHALL last
for the current visit. After a reload, the first painted frame SHALL already use the theme in
effect.

In both themes:
- normal text SHALL have a contrast of at least 4.5:1 against its background
- outlines of controls SHALL have a contrast of at least 3:1
- keyboard focus SHALL be visibly marked

#### Scenario: Dark mode
- **WHEN** the system uses a dark colour scheme and the theme choice is System
- **THEN** the game shows dark parchment panels with light text that meets the contrast minimum

#### Scenario: Light choice on a dark system
- **WHEN** the system uses a dark colour scheme and the player has chosen Light
- **THEN** the game shows light paper panels and the day landscape

#### Scenario: System follows live
- **WHEN** the theme choice is System and the system switches from light to dark while the game
  is open
- **THEN** the game switches to dark parchment without a reload

#### Scenario: Explicit choice ignores the system
- **WHEN** the player has chosen Light and the system switches to dark
- **THEN** the game stays light

#### Scenario: Choice survives a reload
- **WHEN** the player chose Dark on a light system and reloads the page
- **THEN** the game opens in the dark theme, with no light frame shown first

#### Scenario: New game keeps the theme
- **WHEN** the player has chosen Dark and starts a new game
- **THEN** the game stays dark and Dark stays marked

### Requirement: Bundled fonts
The game's fonts SHALL be served from the game's own origin. The game SHALL remain usable with
the fallback system font while its fonts load.

#### Scenario: No font requests to other hosts
- **WHEN** all network requests made while loading and playing are recorded
- **THEN** every font request goes to the game's own origin
