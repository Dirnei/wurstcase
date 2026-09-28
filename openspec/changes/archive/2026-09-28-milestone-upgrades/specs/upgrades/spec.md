# Spec Delta

## ADDED Requirements

### Requirement: Chain milestone upgrades
For each chain, the game SHALL offer three chain milestone upgrades, on offer once the player owns
at least 25, 50 and 100 of every building of that chain (its field, its processing building and
its kitchen). Each SHALL be a rate upgrade that doubles the output per second of all buildings of
its chain. Each SHALL have its own name and joke line in every language.

A chain milestone upgrade's price SHALL be a fixed multiple (starting value 10) of the sum of the
prices of the copies that complete it (the 25th, 50th or 100th copy of each of the chain's
buildings), rounded to two significant digits. The milestones, the factor and the price multiple
SHALL be content data, and the prices SHALL follow the buildings' base prices and price growth.

#### Scenario: First chain milestone offer
- **WHEN** the player owns 25 soybean fields, 25 tofu presses and 25 Tofu-Wurst kitchens
- **THEN** the soy chain's first milestone upgrade is on offer for €14,000

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

## MODIFIED Requirements

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

#### Scenario: Upgrade on top of a milestone
- **WHEN** the player owns 25 soybean fields, "better seeds" and the soy chain's first milestone
  upgrade, and 1 second passes
- **THEN** the fields produce 100 soybeans

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
The game SHALL offer these upgrades (starting values), plus the chain milestone upgrades:

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
| Kneading machine | 5 seitan kitchens | €12,000 | seitan kitchens ×2 |
| Leverkas secret recipe | 1 Leverkas oven | €20,000 | Leverkas +€10 |
| Tough negotiator | 10 residents | €5,000 | animal prices ×0.8 |
| Pig influencer | 3 pigs | €6,000 | pigs' awareness ×2 |
| Local newspaper | €10,000 earned | €8,000 | passive conversion ×1.5 |
| Steam oven | 5 Leverkas ovens | €40,000 | Leverkas ovens ×2 |
| Barista course | 3 café bars | €4,000 | Hafer-Cappuccino +€4 |
| New millstones | 5 oat mills | €6,000 | oat mills ×2 |

Upgrades, their conditions, prices and effects SHALL be content data.

#### Scenario: Complete list
- **WHEN** every condition is met
- **THEN** 26 upgrades are on offer: the 17 above and 9 chain milestone upgrades

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
