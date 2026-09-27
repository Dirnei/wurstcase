# upgrades Specification

## Purpose

Gives the player one-time purchases that permanently change the rules of the current game:
faster buildings, better prices, more demand, stronger awareness, cheaper animals and Aktionen.

## Requirements

### Requirement: Upgrades panel
The upgrades panel SHALL be hidden until the first upgrade is on offer, and SHALL stay visible
after that. It SHALL list every upgrade that is on offer and not yet owned, cheapest first. Each
entry SHALL show the upgrade's name, a short joke line, its effect in plain words and its price in
a buy button. Owned upgrades SHALL be listed in a collapsed section with their count.

#### Scenario: Nothing on offer yet
- **WHEN** a new game starts
- **THEN** the upgrades panel is not shown

#### Scenario: First offer
- **WHEN** the total money earned reaches €30
- **THEN** the upgrades panel is shown with "strong hands" and its price of €40

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
Values that other capabilities define (building output rates, units per manual click, product
prices, orders per customer, species awareness, passive conversion, shelter space, animal prices
and Aktion awareness costs) SHALL be the values without upgrades. Owned upgrades SHALL change them
as follows:

- A **rate** effect SHALL multiply the output per second of its buildings.
- A **manual** effect SHALL multiply the units a manual action makes and the input it takes. When
  the stock covers fewer units, the action SHALL make as many whole units as the stock covers,
  and SHALL remain available while it covers at least one.
- A **price** effect SHALL add whole euros to a product's price. That price SHALL count
  everywhere a product's price counts, including the most-expensive-first order.
- An **orders** effect SHALL multiply the orders each customer places per second.
- An **awareness** effect SHALL multiply a species' awareness per second.
- A **conversion** effect SHALL multiply the passive conversion rate.
- A **space** effect SHALL add whole space to each shelter of a type, including shelters already
  built.
- An **animal price** effect SHALL multiply MegaMeat's animal prices, rounded up to whole euros.
- An **Aktion cost** effect SHALL multiply Aktion awareness costs, together with any counter-event
  factor, rounded up to whole points.

Factors of several owned upgrades SHALL multiply, and additions SHALL add up. The panels showing
these values SHALL show the upgraded values.

#### Scenario: Better seeds
- **WHEN** the player owns 5 soybean fields and "better seeds", and 1 second passes
- **THEN** the fields produce 10 soybeans

#### Scenario: Factors stack
- **WHEN** the player owns "better seeds" (soybean fields ×2) and "second farmer" (all fields ×1.5)
- **THEN** each soybean field produces 3 soybeans per second

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
- **WHEN** the player owns the Instagram account and MegaMeat's billboards event is active
- **THEN** the flyers cost 150 awareness

### Requirement: Act 1 upgrades
The game SHALL offer these upgrades (starting values):

| Upgrade | Conditions | Price | Effect |
|---|---|---|---|
| Strong hands | €30 earned | €40 | manual actions ×2 |
| Mustard on the side | €500 earned | €400 | Tofu-Wurst +€1 |
| Better seeds | 5 soybean fields | €150 | soybean fields ×2 |
| Hydraulic press | 5 tofu presses | €300 | tofu presses ×2 |
| More straw | 3 stables | €500 | stables +2 space |
| Hen photo shoot | 5 chickens | €800 | chickens' awareness ×2 |
| Loyalty card | €2,000 earned | €1,500 | orders per customer ×1.5 |
| Instagram account | flyers run 3 times | €2,000 | Aktion costs ×0.75 |
| Second farmer | €3,000 earned | €2,500 | all fields ×1.5 |
| Kneading machine | 5 seitan kitchens | €3,000 | seitan kitchens ×2 |
| Leverkas secret recipe | 1 Leverkas oven | €4,000 | Leverkas +€10 |
| Tough negotiator | 10 residents | €5,000 | animal prices ×0.8 |
| Pig influencer | 3 pigs | €6,000 | pigs' awareness ×2 |
| Local newspaper | €10,000 earned | €8,000 | passive conversion ×1.5 |
| Steam oven | 5 Leverkas ovens | €10,000 | Leverkas ovens ×2 |
| Barista course | 3 café bars | €25,000 | Hafer-Cappuccino +€4 |
| New millstones | 5 oat mills | €30,000 | oat mills ×2 |

Upgrades, their conditions, prices and effects SHALL be content data.

#### Scenario: Complete list
- **WHEN** every condition is met
- **THEN** 17 upgrades are on offer

### Requirement: Upgrades are saved
The owned upgrades SHALL be part of the save. A save from before this change SHALL load with no
upgrades owned; upgrades whose conditions already hold are on offer at once.

#### Scenario: Reload
- **WHEN** the player owns "better seeds" and reloads the page
- **THEN** "better seeds" is still owned and the soybean fields still produce twice as much

#### Scenario: Older save
- **WHEN** a save from before this change with 6 soybean fields is loaded
- **THEN** no upgrade is owned, and "better seeds" is on offer
