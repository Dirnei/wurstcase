## MODIFIED Requirements

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
