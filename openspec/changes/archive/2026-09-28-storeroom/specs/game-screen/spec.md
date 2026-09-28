## MODIFIED Requirements

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
