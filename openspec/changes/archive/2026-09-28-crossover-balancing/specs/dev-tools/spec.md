# Spec Delta

## MODIFIED Requirements

### Requirement: Cost vs income chart
For a chosen building, the page SHALL plot, for 0 to 50 copies owned, the price of the next copy,
the total spent so far and the income per second of that many copies. A building's income SHALL
be its output per second, including its milestone multipliers, times the vegan value of the
output, assuming the rest of its chain and the demand keep up. The vegan value of a unit is what
it earns once it is turned into its chain's product and sold to a customer. The chart SHALL offer
a logarithmic y axis.

#### Scenario: Soybean field
- **WHEN** the soybean field is chosen
- **THEN** the price of the first copy is €10, of the second €12, and one field earns €1 per
  second

#### Scenario: Milestone jump
- **WHEN** the soybean field is chosen
- **THEN** 24 fields earn €24 per second and 25 fields earn €50 per second

### Requirement: Payback chart
The page SHALL plot, for every building on one chart, the payback time of the n-th copy (its
price divided by the income it adds, including a milestone multiplier that copy reaches) for n
from 1 to 50, in seconds on a logarithmic axis.

#### Scenario: First copies
- **WHEN** the payback chart is shown with the current content
- **THEN** the first soybean field pays back in 10 seconds and the first tofu press in about 17
  seconds

#### Scenario: Milestone copy
- **WHEN** the payback chart is shown with the current content
- **THEN** the 25th soybean field pays back faster than the 24th, because it doubles the output
  of all 25

### Requirement: Demand ceiling chart
The page SHALL plot, against the number of customers from 10 up to the town size on a logarithmic
axis, the most income per second the customers can pay for when every order is filled with each
product. The chart's title SHALL say that the lines differ only by product price. It SHALL also
show as a table how many kitchens of each product that demand keeps busy.

#### Scenario: Starting neighbours
- **WHEN** the chart is read at 10 customers
- **THEN** it shows €1.50 per second for Tofu-Wurst and €12.50 per second for Leverkas

### Requirement: Bulk buyer table
The page SHALL list every resource with its vegan value and each bulk buyer's price per unit, both
in euros and as a percentage of the vegan value.

#### Scenario: Soybeans
- **WHEN** the table is shown with the current content
- **THEN** soybeans read a vegan value of €1.00, MegaMeat €0.40 (40%) and the biogas plant
  €0.30 (30%)

### Requirement: Simulated playthrough
The page SHALL simulate a game from a new game state with the game's own simulation step. The
default length is 60 minutes of game time, and the default click rate is 2 clicks per second;
both can be changed on the page. The scripted player SHALL:

- spend its clicks on the manual actions, furthest step of the chain first
- sell by hand until the shop assistant is hired
- hire the assistant as soon as it can pay for it
- every 10 seconds of game time, sell to the biogas plant whatever stock is more than its
  buildings use, or for products more than the customers order, in the next 30 seconds; it never
  sells to MegaMeat
- otherwise buy the purchase with the shortest payback in the current state, and save up for it
  when it cannot pay yet. A missing building that would make a new chain run counts as a
  purchase together with the rest of that chain. Income from a purchase SHALL count what
  customers pay for the products they order and what the biogas plant pays for the rest. A
  rescue counts as a purchase together with the shelter it needs when space is short; its income
  is what the customers it converts in the next 10 minutes add.

The same content and settings SHALL always give the same result. The page SHALL plot money, total
earned, income per second and customers over time, and SHALL list every purchase with its game
time.

#### Scenario: Deterministic
- **WHEN** the simulation is run twice with the same settings
- **THEN** both runs give the same purchase log and the same final money

#### Scenario: Idle player
- **WHEN** the simulation runs with 0 clicks per second
- **THEN** it ends with no money and no purchases, because a new game has nothing that produces
  on its own

#### Scenario: Purchase log
- **WHEN** a default simulation has run
- **THEN** the log lists the first soybean field with the game time at which it was bought

#### Scenario: Surplus is sold
- **WHEN** the simulated player makes more Tofu-Wurst than the customers order
- **THEN** it sells the extra to the biogas plant, and the sale counts towards total earned

#### Scenario: Customers grow
- **WHEN** a default simulation has run
- **THEN** it has rescued animals and ends with more than the 10 starting customers

### Requirement: Pacing table
After a simulation, the page SHALL show each pacing milestone with its target window from the
concept doc and the simulated game time at which it happened. Each milestone SHALL be marked as
early, in the window, late, or not reached. The milestones are:

| Milestone | Target window |
|---|---|
| First soybean field | 2–10 min |
| First tofu press | 2–10 min |
| First oat field | 10–20 min |
| First wheat field | 20–35 min |
| First Leverkas oven | 20–35 min |

Milestones and windows SHALL be data, so later changes can add their own, such as the first
chicken.

#### Scenario: Milestone in its window
- **WHEN** the simulated player buys the first soybean field at 4:30
- **THEN** that row shows 4:30 and is marked in the window

#### Scenario: Not reached
- **WHEN** the simulation ends before any Leverkas oven is bought
- **THEN** the Leverkas oven row is marked not reached

## ADDED Requirements

### Requirement: Chain set payback chart
The page SHALL plot, for every chain on one chart, the payback time of its k-th balanced set for
k from 1 to 25, in seconds on a logarithmic axis. A balanced set is the chain's smallest whole
set of fields, processors and kitchens that runs without stalls or surplus (as in the chain
balance table). The k-th set's price SHALL be the sum of the prices of its buildings when k − 1
sets are already owned, bought cheapest first, and its income SHALL be the income it adds,
including milestone multipliers the set reaches. The header of the page SHALL list the price
growth of every building, shelter and species.

#### Scenario: First soy set
- **WHEN** the chart is shown with the current content
- **THEN** the first soy set (3 soybean fields, 2 tofu presses, 2 Tofu-Wurst kitchens) costs €175,
  earns €3 per second and pays back in about 58 seconds

#### Scenario: Later chains cross earlier ones
- **WHEN** the chart is shown with the current content
- **THEN** the soy line starts below the oat line and ends above it, and the oat line starts below
  the wheat line and ends above it
