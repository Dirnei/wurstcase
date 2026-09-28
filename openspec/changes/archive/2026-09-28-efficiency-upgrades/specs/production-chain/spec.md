# Spec Delta

## MODIFIED Requirements

### Requirement: Buildings
The game SHALL offer three chains of buildings: soybean field → tofu press → Tofu-Wurst kitchen,
oat field → oat mill → café bar (Hafer-Cappuccino), and wheat field → seitan kitchen → Leverkas
oven. Fields SHALL produce their raw ingredient at a fixed rate per second per
building. Processing buildings and kitchens SHALL work in runs: each run takes a fixed amount of
input and makes its output, at a fixed maximum number of runs per second per building. Without
upgrades a run makes 1 unit; yield upgrades add whole units per run without changing the input or
the runs per second. Buildings SHALL produce and consume only whole units: all copies of a
building type work towards the next run together, and each completed run adds its whole output to
stock at once, taking its whole input at that moment. Each building SHALL show how many the player
owns, what it produces per second, its recipe (input per run → output per run) and how far along
its next run is.

The number of copies owned SHALL NOT change a building's output per copy by itself; output per
copy changes only through upgrades. The building SHALL NOT show owned-count milestones.

#### Scenario: Field output
- **WHEN** the player owns 2 soybean fields, each producing 1 soybean per second, and 10 seconds
  pass
- **THEN** the soybean stock has grown by 20

#### Scenario: Processing at full speed
- **WHEN** the player owns 1 tofu press (3 soybeans → 1 tofu, at most 0.5 runs per second), has
  100 soybeans and 10 seconds pass
- **THEN** tofu has grown by 5 and soybeans have dropped by 15

#### Scenario: Whole units only
- **WHEN** the player owns 1 tofu press with plenty of soybeans and 1 second passes
- **THEN** no tofu has been made yet, soybeans are unchanged, and the press shows its next run
  half done

#### Scenario: Unit completes
- **WHEN** another second passes
- **THEN** tofu has grown by exactly 1 and soybeans have dropped by exactly 3

#### Scenario: Efficient run
- **WHEN** the player owns 1 tofu press and the hydraulic press upgrade, has 100 soybeans and 10
  seconds pass
- **THEN** tofu has grown by 10, soybeans have dropped by 15, and the press shows the recipe
  "3 soybeans → 2 tofu" and 1 tofu per second

#### Scenario: Below the first milestone
- **WHEN** the player owns 24 soybean fields and 1 second passes
- **THEN** the soybean stock has grown by 24, and the soybean field shows no milestone

#### Scenario: First milestone
- **WHEN** the player owns 25 soybean fields and no upgrades, and 1 second passes
- **THEN** the soybean stock has grown by 25, and the soybean field shows only its count, its
  output per second and its progress bar

#### Scenario: Milestones stack
- **WHEN** the player owns 50 of each soy chain building and the soy chain's 25 and 50 milestone
  upgrades
- **THEN** the soybean field shows 200 soybeans per second

#### Scenario: Last milestone
- **WHEN** the player owns 100 of each soy chain building and all three soy chain milestone
  upgrades
- **THEN** the soybean field shows 800 soybeans per second
