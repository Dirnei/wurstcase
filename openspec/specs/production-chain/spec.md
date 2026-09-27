# production-chain Specification

## Purpose

Lets the player grow a plant-based food business by producing raw ingredients, processing them
into intermediates and turning those into products. Buildings run automatically in whole units,
get more expensive with every copy, and visibly stall when an input runs short.

## Requirements

### Requirement: Money and stock
The game SHALL track the player's money and the stock of each resource: soybeans, wheat and oats
(raw), tofu, seitan and oat drink (intermediate), and Tofu-Wurst, Leverkas and
Hafer-Cappuccino (products). A new game SHALL start with no money, no stock and no buildings.
Money and stock SHALL always be whole numbers, SHALL be shown in the selected language's number
format, SHALL support values beyond 10^308 and SHALL never become negative.

#### Scenario: New game
- **WHEN** a new game starts
- **THEN** money is 0 and every stock is 0

#### Scenario: Very large amount
- **WHEN** the money is 1e400
- **THEN** it is kept and shown without becoming infinite or wrapping around

### Requirement: Manual production
The player SHALL be able to do every step of every chain by hand, one unit per click:

- Soy: harvest soybeans (+1 soybean), press tofu (3 soybeans → 1 tofu), make Tofu-Wurst
  (1 tofu → 1 Tofu-Wurst).
- Wheat: harvest wheat (+1 wheat), make seitan (2 wheat → 1 seitan), bake Leverkas
  (2 seitan → 1 Leverkas).
- Oats: harvest oats (+1 oat), make oat drink (2 oats → 1 oat drink), make Hafer-Cappuccino
  (1 oat drink → 1 Hafer-Cappuccino).

Each manual action SHALL use the same input ratio as the building that does the same step. A
manual action SHALL be available only once the building for the same step is unlocked, and SHALL
be hidden while it is locked. A manual action that is locked or lacks its input SHALL change
nothing. Manual actions SHALL be shown grouped by chain.

#### Scenario: Harvesting
- **WHEN** the player clicks "harvest soybeans" 3 times
- **THEN** the soybean stock is 3

#### Scenario: Pressing by hand
- **WHEN** the player has 3 soybeans and clicks "press tofu"
- **THEN** soybeans are 0 and tofu is 1

#### Scenario: Missing input
- **WHEN** the player has 2 soybeans
- **THEN** "press tofu" is unavailable and clicking it changes no stock

#### Scenario: New game
- **WHEN** a new game starts
- **THEN** only the three soy actions are shown

#### Scenario: Wheat chain by hand
- **WHEN** the wheat field, seitan kitchen and Leverkas oven are unlocked and the player clicks
  "harvest wheat" 4 times, "make seitan" twice and "bake Leverkas" once
- **THEN** wheat is 0, seitan is 0 and Leverkas is 1

#### Scenario: Oat chain by hand
- **WHEN** the oat chain is unlocked and the player clicks "harvest oats" twice, "make oat drink"
  once and "make Hafer-Cappuccino" once
- **THEN** oats are 0, oat drink is 0 and Hafer-Cappuccino is 1

#### Scenario: Step unlocks with its building
- **WHEN** lifetime earnings reach the wheat field's unlock but not the Leverkas oven's
- **THEN** "harvest wheat" and "make seitan" are shown and "bake Leverkas" is hidden

#### Scenario: Locked action changes nothing
- **WHEN** the oat field is still locked and the player somehow triggers "harvest oats"
- **THEN** the oat stock is unchanged

### Requirement: Buildings
The game SHALL offer three chains of buildings: soybean field → tofu press → Tofu-Wurst kitchen,
wheat field → seitan kitchen → Leverkas oven, and oat field → oat mill → café bar
(Hafer-Cappuccino). Fields SHALL produce their raw ingredient at a fixed rate per second per
building. Processing buildings and kitchens SHALL convert their input into their output at a
fixed ratio and a fixed maximum rate per second per building. Buildings SHALL produce and consume
only whole units: all copies of a building type work towards the next unit together, and each
completed unit is added to stock at once, taking its whole input at that moment. Each building
SHALL show how many the player owns, what it produces per second, and how far along its next
unit is.

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

### Requirement: Buying buildings
The player SHALL be able to buy one building at a time when they have enough money. The price
SHALL be the building's base price × 1.10^(number already owned), rounded up to whole euros.
Buying SHALL subtract the price from the money and add one building. A building the player
cannot afford SHALL show its price but SHALL NOT be buyable.

#### Scenario: Cost scaling
- **WHEN** a building has a base price of €10 and the player owns 2
- **THEN** the next one costs €13 (€12.10 rounded up)

#### Scenario: Cost scaling with many copies
- **WHEN** a building has a base price of €10 and the player owns 24
- **THEN** the next one costs €99 (about €98.50, rounded up)

#### Scenario: Loaded save uses the current rate
- **WHEN** a save made under the old 15% rate is loaded with 2 soybean fields
- **THEN** the player keeps both fields, gets no refund, and the next field costs €13

#### Scenario: Buying
- **WHEN** the player has €15 and buys a soybean field costing €10
- **THEN** money is €5 and the player owns 1 soybean field

#### Scenario: Not enough money
- **WHEN** the player has €9 and a soybean field costs €10
- **THEN** the buy button is disabled and nothing changes

### Requirement: Stalls
A processing building or kitchen SHALL complete a unit only when the whole input for that unit is
in stock, and it never lets stock go negative. A building whose next unit is ready but lacks
input SHALL wait with that unit ready, without building up further progress, and SHALL complete
it as soon as the input is there. While any building waits for an input, the game SHALL mark
that input's stock as short (shown in red). The mark SHALL stay until no building has waited for
that input for 3 seconds of game time, so a brief or recurring shortage does not flicker.

#### Scenario: Input runs out
- **WHEN** the player owns 1 tofu press and no soybean field, and the soybean stock is 0
- **THEN** no tofu is produced and the soybean stock is marked as short

#### Scenario: Not enough for a whole unit
- **WHEN** a tofu press has its next tofu ready and there are 2 soybeans in stock
- **THEN** no tofu is made, the 2 soybeans stay in stock, and the soybean stock is marked as short

#### Scenario: Recurring shortage does not flicker
- **WHEN** one soybean field feeds a tofu press, so the press alternates between waiting for
  soybeans and pressing
- **THEN** the soybean stock stays marked as short the whole time

#### Scenario: No banked progress
- **WHEN** a tofu press has waited for 60 seconds and then 30 soybeans arrive at once
- **THEN** it makes 1 tofu right away and the rest at its normal rate, not 30 tofu at once

#### Scenario: Supply returns
- **WHEN** a waiting tofu press receives enough soybeans for its full rate again
- **THEN** the soybean stock stops being marked as short 3 seconds after the press last waited

### Requirement: Unlocks
The soy chain SHALL be available from the start. Every other building SHALL become available
once the player's total money earned in this game reaches that building's unlock threshold, and
SHALL stay available after that. Locked buildings and resources nobody has produced yet SHALL
not be shown.

#### Scenario: Start of the game
- **WHEN** a new game starts
- **THEN** only the soybean field, tofu press and Tofu-Wurst kitchen are shown

#### Scenario: Wheat chain unlocks
- **WHEN** the total money earned reaches the wheat field's unlock threshold
- **THEN** the wheat field is shown and can be bought

#### Scenario: Spending does not relock
- **WHEN** a building is unlocked and the player then spends money below its threshold
- **THEN** the building stays available

### Requirement: Progress is saved
Money, total money earned, every stock, every building count and each building's progress
towards its next unit SHALL be part of the save and
SHALL be restored exactly, including amounts beyond 10^308. A save from before this change SHALL
load as a new economy that keeps its play time.

#### Scenario: Reload
- **WHEN** the player owns 3 tofu presses and has €1.5e320, and reloads the page
- **THEN** they still own 3 tofu presses and have €1.5e320

#### Scenario: Older save
- **WHEN** a save that holds only play time is loaded
- **THEN** the game continues with that play time, no money and no buildings

### Requirement: Stock trend
Every resource shown in the stock panel SHALL carry a trend mark after its amount: rising (▲),
falling (▼) or steady (▬). The trend SHALL be based on the net change of that stock caused by
passing game time (buildings producing and using input, and automatic sales) over the last 10
seconds of game time. Player actions (manual production, selling by hand, bulk sales, buying
buildings) SHALL NOT affect the trend.

The trend SHALL be rising when that net change is more than 1 unit, falling when it is less than
−1 unit, and steady otherwise. A resource that is currently marked as short SHALL show steady.
Each mark SHALL have a text label in the selected language ("rising", "falling", "steady") that
screen readers announce and that shows as a tooltip; colour SHALL NOT be the only way the trend
is shown. The trend SHALL NOT be saved: after loading a game or starting a new one, every
resource SHALL show steady until time has passed.

#### Scenario: Stock piles up
- **WHEN** the player owns 1 soybean field and nothing uses soybeans, and 10 seconds of game time
  pass
- **THEN** soybeans show rising

#### Scenario: Stock is used up faster than it arrives
- **WHEN** there are 100 tofu in stock, 2 Tofu-Wurst kitchens use tofu and nothing makes tofu,
  and 10 seconds of game time pass
- **THEN** tofu shows falling

#### Scenario: Nothing happens
- **WHEN** the player owns no building that makes or uses oats and 10 seconds of game time pass
- **THEN** oats show steady

#### Scenario: Short input stays steady
- **WHEN** one soybean field feeds two tofu presses, so the presses keep waiting for soybeans
- **THEN** soybeans show steady, not alternating between rising and falling

#### Scenario: Balanced chain
- **WHEN** a building makes a resource exactly as fast as the next building uses it
- **THEN** that resource shows steady even though its stock moves by a single unit now and then

#### Scenario: Player actions do not count
- **WHEN** soybeans show steady and the player clicks "harvest soybeans" 20 times within a few
  seconds
- **THEN** soybeans still show steady

#### Scenario: Bulk sale does not flip the trend
- **WHEN** soybeans show rising and the player sells all whole lots of soybeans to MegaMeat
- **THEN** soybeans still show rising

#### Scenario: Assistant sells faster than the kitchen makes
- **WHEN** the shop assistant sells Tofu-Wurst from a stock of 50 faster than the kitchens make it
- **THEN** Tofu-Wurst shows falling until the stock is used up, and then steady

#### Scenario: Old changes drop out of the window
- **WHEN** Tofu-Wurst has been rising, nothing sells it, and the kitchens stop because tofu ran
  out
- **THEN** Tofu-Wurst shows steady at the latest 10 seconds of game time after the last
  Tofu-Wurst was made

#### Scenario: After loading
- **WHEN** the player loads a saved game
- **THEN** every resource shows steady until game time has passed

#### Scenario: Accessible label
- **WHEN** the language is English and tofu is rising
- **THEN** the tofu row has the label "rising", and in German "steigend"
