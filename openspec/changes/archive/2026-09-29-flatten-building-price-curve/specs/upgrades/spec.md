## MODIFIED Requirements

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
