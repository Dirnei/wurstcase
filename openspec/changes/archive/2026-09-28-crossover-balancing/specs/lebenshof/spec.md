# Spec Delta

## MODIFIED Requirements

### Requirement: Species
The game SHALL offer three species. Each SHALL have a base price, a total-earnings unlock
threshold, a space need and an awareness output:

| Species | Base price | Unlock at | Space | Awareness per second |
|---|---|---|---|---|
| Chicken | €50 | €100 | 1 | 1 |
| Pig | €600 | €12,000 | 4 | 5 |
| Cow | €4,000 | €150,000 | 10 | 20 |

A species SHALL be offered only once the total money earned reaches its threshold. Each offered
species SHALL show its emoji, name, price, space need and awareness output.

#### Scenario: Only chickens early on
- **WHEN** the total money earned is €1,000
- **THEN** chickens are offered and pigs and cows are not

#### Scenario: Cows
- **WHEN** the total money earned reaches €150,000
- **THEN** chickens, pigs and cows are offered

### Requirement: Rising animal prices
The price of a species SHALL be its base price × its own price growth to the power of the number
of animals of that species already rescued in this game, rounded up to whole euros. Later species
SHALL grow more slowly than earlier ones. Rescuing one species SHALL NOT change the price of
another.

| Species | Price growth |
|---|---|
| Chicken | 1.25 |
| Pig | 1.18 |
| Cow | 1.12 |

#### Scenario: Third chicken
- **WHEN** 2 chickens have been rescued
- **THEN** the next chicken costs €79 (about €78.13, rounded up)

#### Scenario: Second cow
- **WHEN** 1 cow has been rescued
- **THEN** the next cow costs €4,480

#### Scenario: Species are priced separately
- **WHEN** 5 chickens and no pigs have been rescued
- **THEN** the next pig costs €600

### Requirement: Shelters and space
The player SHALL be able to build shelters that add space to the Lebenshof. Each shelter type SHALL
have a base price, its own price growth, a total-earnings unlock threshold and the space it adds:

| Shelter | Base price | Price growth | Unlock at | Space |
|---|---|---|---|---|
| Stable | €30 | 1.13 | €100 | 4 |
| Pasture | €2,000 | 1.09 | €5,000 | 25 |

A shelter's price SHALL be its base price × its price growth to the power of the number already
built, rounded up to whole euros. Total space SHALL be the sum of the space of all shelters built.
Space in use SHALL be the sum of the space needs of all residents. A shelter SHALL be buildable
only when it is unlocked and the player has enough money. Building one SHALL subtract its price
from money and SHALL NOT change the total money earned.

#### Scenario: First stable
- **WHEN** the Lebenshof is unlocked, the player has €40 and builds a stable
- **THEN** money is €10 and 0 of 4 space is in use

#### Scenario: Second stable
- **WHEN** one stable has been built
- **THEN** the next stable costs €34 (€33.90, rounded up)

#### Scenario: Second pasture
- **WHEN** one pasture has been built
- **THEN** the next pasture costs €2,180
