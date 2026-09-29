# upgrades Specification

## Purpose

Gives the player one-time purchases that permanently change the rules of the current game:
faster buildings, better prices, more demand, stronger awareness, cheaper animals and Aktionen.

## Requirements

### Requirement: Upgrades panel
The Upgrades tab SHALL be locked until the first upgrade is on offer, and SHALL stay unlocked
after that. Its lock hint SHALL name the total money earned at which the first upgrade comes on
offer. The tab SHALL list every upgrade that is on offer and not yet owned, cheapest first. Each
entry SHALL show the upgrade's name, a short joke line, its effect in plain words and its price in
a buy button. Owned upgrades SHALL be listed in a collapsed section with their count.

The entries SHALL be cards in a grid. Cards in the same row SHALL have the same height, and each
card's buy button SHALL sit at the bottom of its card, so the buy buttons of a row line up at the
same height. Every buy button SHALL have the same height as the Buy buttons on the Produktion
tab, with its text on one line, however long the card's text is.

#### Scenario: Nothing on offer yet
- **WHEN** a new game starts
- **THEN** the Upgrades tab is locked with the hint that it unlocks at €30 earned

#### Scenario: First offer
- **WHEN** the total money earned reaches €30
- **THEN** the Upgrades tab can be opened and shows "strong hands" and its price of €40

#### Scenario: Buttons line up
- **WHEN** two offers sit side by side and one card's joke line wraps to three lines while the
  other's fits on one
- **THEN** both cards have the same height and both buy buttons are at the same height, at the
  bottom of their cards

#### Scenario: Same height as Produktion
- **WHEN** the player compares a buy button on the Upgrades tab with a Buy button on the
  Produktion tab at the same screen width
- **THEN** both buttons have the same height

#### Scenario: Phone width
- **WHEN** the viewport is 375 px wide
- **THEN** each offer card spans the width, and its buy button is 44 px tall and at the bottom of
  the card

### Requirement: Unlock conditions
An upgrade SHALL be on offer while all of its conditions hold. A condition SHALL be one of:

- total money earned of at least an amount
- owning at least a number of a building or of a shelter type
- having at least a number of residents, of one species or in total
- having run an Aktion at least a number of times

Every condition SHALL only ever go from false to true within a game (money earned, buildings,
shelters, residents and Aktion runs never decrease), so an upgrade on offer stays on offer until
it is bought.

#### Scenario: Building count
- **WHEN** the player owns 4 soybean fields
- **THEN** "better seeds" is not on offer, and it is on offer once the fifth field is bought

#### Scenario: Spending keeps the offer
- **WHEN** "mustard on the side" is on offer and the player spends all their money
- **THEN** "mustard on the side" is still on offer

### Requirement: Buying an upgrade
The player SHALL be able to buy an upgrade that is on offer when they have at least its price.
Buying it SHALL subtract the price from money, SHALL NOT change the total money earned, and SHALL
make the upgrade owned for the rest of this game. An owned upgrade SHALL NOT be offered again.
The buy button SHALL be unavailable while money is short.

#### Scenario: Buying
- **WHEN** "strong hands" is on offer and the player has €50 and buys it
- **THEN** money is €10, "strong hands" is owned and it moves to the owned section

#### Scenario: Not enough money
- **WHEN** the player has less money than an upgrade costs
- **THEN** its buy button is unavailable

### Requirement: Upgrade effects
Values that other capabilities define (building output rates, output per run, units per manual
click, product prices, orders per customer, species awareness, campaign reach, shelter space,
animal prices and Aktion awareness costs) SHALL be the values without upgrades. Owned upgrades
SHALL change them as follows:

- A **rate** effect SHALL multiply the output per second of its buildings.
- A **yield** effect SHALL add whole units to the output of each run of one processing building
  or kitchen type, without changing the input a run takes or the runs per second. Manual actions
  SHALL NOT be affected.
- A **manual** effect SHALL multiply the units a manual action makes and the input it takes. When
  the stock covers fewer units, the action SHALL make as many whole units as the stock covers,
  and SHALL remain available while it covers at least one.
- A **price** effect SHALL add whole euros to a product's price. That price SHALL count
  everywhere a product's price counts, including the most-expensive-first order.
- An **orders** effect SHALL multiply the orders each customer places per second.
- An **awareness** effect SHALL multiply a species' awareness per second.
- A **conversion** effect SHALL multiply the customers each campaign wins, together with any
  counter-event factor, before rounding down.
- A **space** effect SHALL add whole space to each shelter of a type, including shelters already
  built.
- An **animal price** effect SHALL multiply MegaMeat's animal prices, rounded up to whole euros.
- An **Aktion cost** effect SHALL multiply Aktion awareness costs, together with any counter-event
  factor, rounded up to whole points.

Factors of several owned upgrades SHALL multiply, and additions SHALL add up. A building's output
per second SHALL be its runs per second times its rate factors times its output per run. The
panels showing these values SHALL show the upgraded values; a yield effect SHALL read as the
building, the added units and the output resource per run.

#### Scenario: Better seeds
- **WHEN** the player owns 5 soybean fields and "better seeds", and 1 second passes
- **THEN** the fields produce 10 soybeans

#### Scenario: Upgrade on top of a milestone
- **WHEN** the player owns 25 soybean fields, "better seeds" and the soy chain's first milestone
  upgrade, and 1 second passes
- **THEN** the fields produce 100 soybeans

#### Scenario: Factors stack
- **WHEN** the player owns "better seeds" (soybean fields ×2) and "second farmer" (all fields ×1.5)
- **THEN** each soybean field produces 3 soybeans per second

#### Scenario: Hydraulic press
- **WHEN** the player owns 2 tofu presses and the hydraulic press, has 30 soybeans and 10 seconds
  pass
- **THEN** 10 runs are done: soybeans have dropped by 30 and tofu has grown by 20

#### Scenario: Yield and rate stack
- **WHEN** the player owns 1 tofu press, the hydraulic press and the soy chain's first milestone
  upgrade, with plenty of soybeans
- **THEN** the press runs once per second, takes 3 soybeans per run and makes 2 tofu per second

#### Scenario: Yield leaves manual work alone
- **WHEN** the player owns the hydraulic press and presses tofu by hand with 3 soybeans in stock
- **THEN** the stock holds 0 soybeans and 1 tofu

#### Scenario: Strong hands
- **WHEN** the player owns "strong hands" and presses tofu by hand with 6 soybeans in stock
- **THEN** the stock holds 0 soybeans and 2 tofu

#### Scenario: Strong hands with little stock
- **WHEN** the player owns "strong hands" and presses tofu by hand with 4 soybeans in stock
- **THEN** the stock holds 1 soybean and 1 tofu

#### Scenario: Secret recipe
- **WHEN** the player owns the Leverkas secret recipe and sells 2 Leverkas
- **THEN** money grows by €70

#### Scenario: Loyalty card
- **WHEN** the player owns the loyalty card, has 10 customers and 10 seconds pass without selling
- **THEN** there are 7 open orders

#### Scenario: More straw
- **WHEN** the player owns "more straw" and 2 stables
- **THEN** the Lebenshof has 12 space

#### Scenario: Tough negotiator
- **WHEN** the player owns the tough negotiator and has rescued no chickens
- **THEN** the next chicken costs €40

#### Scenario: Instagram under billboards
- **WHEN** the player owns the Instagram account, the flyers have been run 3 times and MegaMeat's
  billboards event is active
- **THEN** the flyers cost 293 awareness

#### Scenario: Local newspaper
- **WHEN** the player owns the local newspaper, the flyers have not been run yet, there are 10
  customers and the player runs the flyers
- **THEN** there are 39 customers

### Requirement: Act 1 upgrades
The game SHALL offer these upgrades (starting values), plus the chain milestone upgrades:

| Upgrade | Conditions | Price | Effect |
|---|---|---|---|
| Strong hands | €30 earned | €40 | manual actions ×2 |
| Mustard on the side | €500 earned | €400 | Tofu-Wurst +€1 |
| Better seeds | 5 soybean fields | €150 | soybean fields ×2 |
| Hydraulic press | 5 tofu presses | €300 | tofu presses +1 tofu per run |
| Sausage filler | 5 Tofu-Wurst kitchens | €400 | Tofu-Wurst kitchens +1 Tofu-Wurst per run |
| More straw | 3 stables | €500 | stables +2 space |
| Hen photo shoot | 5 chickens | €800 | chickens' awareness ×2 |
| Loyalty card | €2,000 earned | €1,500 | orders per customer ×1.5 |
| Instagram account | flyers run 3 times | €2,000 | Aktion costs ×0.75 |
| Second farmer | €3,000 earned | €2,500 | all fields ×1.5 |
| Kneading machine | 5 seitan kitchens | €12,000 | seitan kitchens +1 seitan per run |
| Leverkas secret recipe | 1 Leverkas oven | €20,000 | Leverkas +€10 |
| Tough negotiator | 10 residents | €5,000 | animal prices ×0.8 |
| Pig influencer | 3 pigs | €6,000 | pigs' awareness ×2 |
| Local newspaper | €10,000 earned | €8,000 | campaigns win ×1.5 customers |
| Steam oven | 5 Leverkas ovens | €40,000 | Leverkas ovens +1 Leverkas per run |
| Barista course | 3 café bars | €4,000 | Hafer-Cappuccino +€4 |
| New millstones | 5 oat mills | €6,000 | oat mills +1 oat drink per run |
| Oat foam nozzle | 5 café bars | €8,000 | café bars +1 Hafer-Cappuccino per run |

Upgrades, their conditions, prices and effects SHALL be content data.

#### Scenario: Complete list
- **WHEN** every condition is met
- **THEN** 37 upgrades are on offer: the 19 above and 18 chain milestone upgrades

### Requirement: Upgrades are saved
The owned upgrades SHALL be part of the save. A save from before upgrades existed SHALL load with
no upgrades owned; upgrades whose conditions already hold are on offer at once. A save from before
milestone upgrades SHALL load with every chain milestone upgrade owned whose chain it had already
completed (every building of the chain at the milestone's count or more).

#### Scenario: Reload
- **WHEN** the player owns "better seeds" and reloads the page
- **THEN** "better seeds" is still owned and the soybean fields still produce twice as much

#### Scenario: Older save
- **WHEN** a save from before upgrades with 6 soybean fields is loaded
- **THEN** no upgrade is owned, and "better seeds" is on offer

#### Scenario: Save from before milestone upgrades
- **WHEN** a save from before milestone upgrades with 60 soybean fields, 55 tofu presses, 30
  Tofu-Wurst kitchens and "better seeds" is loaded
- **THEN** "better seeds" and the soy chain's 25 milestone upgrade are owned, and the soy chain's
  50 milestone upgrade comes on offer only once the kitchens reach 50 too

### Requirement: Chain milestone upgrades
For each chain, the game SHALL offer six chain milestone upgrades, on offer once the player owns
at least 25, 50, 75, 100, 150 and 200 of every building of that chain (its field, its processing building and
its kitchen). Each SHALL be a rate upgrade that doubles the output per second of all buildings of
its chain. Each SHALL have its own name and joke line in every language.

A chain milestone upgrade's price SHALL be a fixed multiple (starting value 10) of the sum of the
prices of the copies that complete it (the 25th, 50th, 75th, 100th, 150th or 200th copy of each of the chain's
buildings), rounded to two significant digits. The milestones, the factor and the price multiple
SHALL be content data, and the prices SHALL follow the buildings' base prices and price growth.

#### Scenario: First chain milestone offer
- **WHEN** the player owns 25 soybean fields, 25 tofu presses and 25 Tofu-Wurst kitchens
- **THEN** the soy chain's first milestone upgrade is on offer for €5,500

#### Scenario: One building alone is not enough
- **WHEN** the player owns 60 soybean fields, 60 tofu presses and 24 Tofu-Wurst kitchens
- **THEN** no soy chain milestone upgrade is on offer

#### Scenario: Chain milestone doubles the whole chain
- **WHEN** the player owns 25 of each soy chain building and the soy chain's first milestone
  upgrade
- **THEN** each soybean field, tofu press and Tofu-Wurst kitchen produces twice its base rate, and
  the oat and wheat chains are unchanged

#### Scenario: Skipped milestones stay on offer
- **WHEN** the player owns 50 of each soy chain building and no soy chain milestone upgrade
- **THEN** the soy chain's 25 and 50 milestone upgrades are both on offer

#### Scenario: Milestone at 75
- **WHEN** the player owns 75 of each soy chain building and the soy chain's 25 and 50 milestone
  upgrades
- **THEN** the soy chain's 75 milestone upgrade is on offer for €390,000, and the 100 milestone is
  not

#### Scenario: New milestones in an older save
- **WHEN** a save from before the 75, 150 and 200 milestones is loaded with 80 of each oat chain
  building and the oat chain's 25 and 50 milestone upgrades
- **THEN** the oat chain's 75 milestone upgrade is on offer and not owned
