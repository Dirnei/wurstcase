# Spec Delta

## MODIFIED Requirements

### Requirement: Upgrade effects
Values that other capabilities define (building output rates, output per run, units per manual
click, product prices, orders per customer, species awareness, passive conversion, shelter space,
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
- A **conversion** effect SHALL multiply the passive conversion rate.
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
- **WHEN** the player owns the Instagram account and MegaMeat's billboards event is active
- **THEN** the flyers cost 150 awareness

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
| Local newspaper | €10,000 earned | €8,000 | passive conversion ×1.5 |
| Steam oven | 5 Leverkas ovens | €40,000 | Leverkas ovens +1 Leverkas per run |
| Barista course | 3 café bars | €4,000 | Hafer-Cappuccino +€4 |
| New millstones | 5 oat mills | €6,000 | oat mills +1 oat drink per run |
| Oat foam nozzle | 5 café bars | €8,000 | café bars +1 Hafer-Cappuccino per run |

Upgrades, their conditions, prices and effects SHALL be content data.

#### Scenario: Complete list
- **WHEN** every condition is met
- **THEN** 28 upgrades are on offer: the 19 above and 9 chain milestone upgrades
