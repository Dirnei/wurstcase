# Spec Delta

## MODIFIED Requirements

### Requirement: Buildings
The game SHALL offer three chains of buildings: soybean field → tofu press → Tofu-Wurst kitchen,
oat field → oat mill → café bar (Hafer-Cappuccino), and wheat field → seitan kitchen → Leverkas
oven. Fields SHALL produce their raw ingredient at a fixed rate per second per
building. Processing buildings and kitchens SHALL convert their input into their output at a
fixed ratio and a fixed maximum rate per second per building. Buildings SHALL produce and consume
only whole units: all copies of a building type work towards the next unit together, and each
completed unit is added to stock at once, taking its whole input at that moment. Each building
SHALL show how many the player owns, what it produces per second, and how far along its next
unit is.

Owning 25, 50 and 100 copies of a building SHALL each double that building type's output per
second, so 25 copies run at ×2, 50 at ×4 and 100 at ×8. A processing building or kitchen SHALL
take its input at the same multiplied rate. Each building SHALL show the next milestone it has
not reached and its multiplier, and SHALL show nothing more once it owns 100.

#### Scenario: Field output
- **WHEN** the player owns 2 soybean fields, each producing 1 soybean per second, and 10 seconds
  pass
- **THEN** the soybean stock has grown by 20

#### Scenario: Processing at full speed
- **WHEN** the player owns 1 tofu press (3 soybeans → 1 tofu, at most 0.5 tofu per second), has
  100 soybeans and 10 seconds pass
- **THEN** tofu has grown by 5 and soybeans have dropped by 15

#### Scenario: Whole units only
- **WHEN** the player owns 1 tofu press with plenty of soybeans and 1 second passes
- **THEN** no tofu has been made yet, soybeans are unchanged, and the press shows its next tofu
  half done

#### Scenario: Unit completes
- **WHEN** another second passes
- **THEN** tofu has grown by exactly 1 and soybeans have dropped by exactly 3

#### Scenario: Below the first milestone
- **WHEN** the player owns 24 soybean fields and 1 second passes
- **THEN** the soybean stock has grown by 24, and the soybean field shows "×2 at 25"

#### Scenario: First milestone
- **WHEN** the player owns 25 soybean fields and 1 second passes
- **THEN** the soybean stock has grown by 50, and the soybean field shows "×4 at 50"

#### Scenario: Milestones stack
- **WHEN** the player owns 50 soybean fields and 1 second passes
- **THEN** the soybean stock has grown by 200

#### Scenario: Last milestone
- **WHEN** the player owns 100 soybean fields
- **THEN** they produce 800 soybeans per second and the field shows no next milestone

### Requirement: Buying buildings
The player SHALL be able to buy one building at a time when they have enough money. The price
SHALL be the building's base price × its price growth^(number already owned), rounded up to whole
euros. Each building SHALL have its own price growth; later chains SHALL grow more slowly than
earlier ones. Buying SHALL subtract the price from the money and add one building. A building the
player cannot afford SHALL show its price but SHALL NOT be buyable.

Values tuned with the balancing page's 60-minute simulation:

| Chain | Building | Base price | Price growth | Unlock at |
|---|---|---|---|---|
| Soy | Soybean field | €10 | 1.13 | start |
| Soy | Tofu press | €25 | 1.13 | start |
| Soy | Tofu-Wurst kitchen | €40 | 1.13 | start |
| Oat | Oat field | €400 | 1.11 | €30,000 |
| Oat | Oat mill | €1,000 | 1.11 | €30,000 |
| Oat | Café bar | €1,000 | 1.11 | €30,000 |
| Wheat | Wheat field | €600 | 1.09 | €140,000 |
| Wheat | Seitan kitchen | €1,600 | 1.09 | €140,000 |
| Wheat | Leverkas oven | €800 | 1.09 | €200,000 |

#### Scenario: Cost scaling
- **WHEN** the soybean field (€10, growth 1.13) is bought and the player owns 2
- **THEN** the next one costs €13 (about €12.77, rounded up)

#### Scenario: Cost scaling with many copies
- **WHEN** the player owns 24 soybean fields
- **THEN** the next one costs €188 (about €187.88, rounded up)

#### Scenario: Slower growth in a later chain
- **WHEN** the player owns 1 wheat field (€600, growth 1.09)
- **THEN** the next one costs €654

#### Scenario: Loaded save uses the current rate
- **WHEN** a save made under the old 10% rate is loaded with 2 soybean fields
- **THEN** the player keeps both fields, gets no refund, and the next field costs €13

#### Scenario: Buying
- **WHEN** the player has €15 and buys a soybean field costing €10
- **THEN** money is €5 and the player owns 1 soybean field

#### Scenario: Not enough money
- **WHEN** the player has €9 and a soybean field costs €10
- **THEN** the buy button is disabled and nothing changes

### Requirement: Unlocks
The soy chain SHALL be available from the start. Every other building SHALL become available
once the player's total money earned in this game reaches that building's unlock threshold, and
SHALL stay available after that. Resources nobody has produced yet SHALL not be shown. The oat
chain SHALL unlock before the wheat chain, and the Leverkas oven SHALL be the last building of
Act 1 to unlock.

Of the locked buildings, those with the lowest unlock threshold SHALL be shown as locked cards
in their chains' places. When several share that threshold, all of them are shown. A locked card
shows the building's name and the total money earned at which it unlocks, and has no Buy or
by-hand button. Every other locked building SHALL not be shown.

#### Scenario: Start of the game
- **WHEN** a new game starts
- **THEN** the soybean field, tofu press and Tofu-Wurst kitchen are shown, and the oat field, oat
  mill and café bar are shown locked with "€30K earned"

#### Scenario: Oat chain unlocks
- **WHEN** the total money earned reaches €30,000
- **THEN** the oat field, oat mill and café bar are shown and can be bought, and the wheat field
  and seitan kitchen are shown locked with "€140K earned"

#### Scenario: Wheat chain unlocks
- **WHEN** the total money earned reaches €140,000
- **THEN** the wheat field and seitan kitchen can be bought, and the Leverkas oven is shown
  locked with "€200K earned"

#### Scenario: Spending does not relock
- **WHEN** a building is unlocked and the player then spends money below its threshold
- **THEN** the building stays available

#### Scenario: Everything unlocked
- **WHEN** all 9 buildings are unlocked
- **THEN** no locked card is shown
