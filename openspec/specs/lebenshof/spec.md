# lebenshof Specification

## Purpose

Lets the player spend money to buy animals out of MegaMeat Corp and house them for good in the
Lebenshof. There they get names and produce the awareness that grows the customer base.

## Requirements

### Requirement: Lebenshof unlock
The Lebenshof tab SHALL be locked until the total money earned in this game reaches its unlock
threshold (€100). After that it SHALL stay unlocked, even if money is spent. The tab SHALL show
the space in use and the total space.

#### Scenario: Before the unlock
- **WHEN** the total money earned is €99
- **THEN** the Lebenshof tab is locked with the hint that it unlocks at €100 earned

#### Scenario: Unlocked
- **WHEN** the total money earned reaches €100 and the player then spends all their money
- **THEN** the Lebenshof tab can be opened and shows 0 of 0 space in use

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

### Requirement: Rescuing an animal
The player SHALL be able to rescue an animal of an offered species when they have at least its
price in money and the free space (total space minus space in use) is at least its space need.
Rescuing SHALL subtract the price from money, SHALL NOT change the total money earned, and SHALL
add a new resident of that species. The rescue button SHALL be unavailable otherwise, and SHALL
show whether money or space is lacking.

#### Scenario: First chicken
- **WHEN** chickens are offered, the player has €60, one stable is built and there are no residents
- **THEN** the player can rescue a chicken, after which money is €10 and 1 of 4 space is in use

#### Scenario: Not enough space
- **WHEN** one stable is built, 1 chicken lives there and the player has €1,000 with pigs offered
- **THEN** the pig cannot be rescued, and the button shows that space is lacking

#### Scenario: Not enough money
- **WHEN** there is free space but the player has less money than a chicken costs
- **THEN** the chicken cannot be rescued, and the button shows that money is lacking

### Requirement: Animal names
Each rescued animal SHALL get a name picked at random from its species' name pool in the
current language. Every species SHALL have a pool of the same size in German and English. A
name SHALL NOT be given to a second animal of the same species until every name in that pool is in
use. Once the pool is used up, names SHALL repeat, and the second, third and later animal with the
same name SHALL be shown with a number after it ("Rosi 2", "Rosi 3"). An animal's name SHALL
never change after the rescue, except that switching the language SHALL show the name from the
same place in the other language's pool.

#### Scenario: No repeats while names remain
- **WHEN** as many chickens are rescued as the chicken pool has names
- **THEN** every chicken has a different name

#### Scenario: Repeated name
- **WHEN** one more chicken is rescued after the pool is used up, and it gets the name "Rosi"
- **THEN** the older chicken is shown as "Rosi" and the new one as "Rosi 2"

#### Scenario: Language switch
- **WHEN** the player switches from German to English
- **THEN** each resident is shown with the English name from the same place in the pool

### Requirement: Resident list
The Lebenshof tab SHALL list every resident with its species illustration and name, grouped by
species and in rescue order within each species. Each group SHALL show how many animals it has.

#### Scenario: Mixed residents
- **WHEN** the player has rescued 3 chickens and then 1 pig
- **THEN** the list shows a chicken group of 3 names in rescue order and a pig group of 1 name,
  each with its species illustration

### Requirement: Animals are never lost
No player action and no passage of game time SHALL remove a resident or change its species or
name, except replacing the whole game: starting a new game or importing a save, both after the
player confirms.

#### Scenario: Time passes
- **WHEN** the game advances by 12 hours with 5 residents
- **THEN** the same 5 residents are still there, with the same names

#### Scenario: New game
- **WHEN** the player has 5 residents and confirms a new game
- **THEN** the Lebenshof has no residents

### Requirement: Lebenshof is saved
Residents (species and name), the number of each shelter type built, and progress towards the next
converted customer SHALL be part of the save. A save from before this change SHALL load with
no residents and no shelters, and keep everything else.

#### Scenario: Reload
- **WHEN** the player has 2 stables and chickens named "Rosi" and "Frau Huhn", and reloads the page
- **THEN** the Lebenshof still has 2 stables and the chickens "Rosi" and "Frau Huhn"

#### Scenario: Older save
- **WHEN** a save from before this change with 3 tofu presses and 40 customers is loaded
- **THEN** the game continues with 3 tofu presses, 40 customers, no residents and no shelters
