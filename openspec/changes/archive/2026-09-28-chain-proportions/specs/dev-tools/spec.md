## MODIFIED Requirements

### Requirement: Cost vs income chart
For a chosen building, the page SHALL plot, for 0 to 50 copies owned, the price of the next copy,
the total spent so far and the income per second of that many copies. A building's income SHALL
be its output per second without upgrades times the vegan value of the output, assuming the rest
of its chain and the demand keep up. The vegan value of a unit is what it earns once it is turned
into its chain's product and sold to a customer. The chart SHALL offer a logarithmic y axis.

#### Scenario: Soybean field
- **WHEN** the soybean field is chosen
- **THEN** the price of the first copy is €10, of the second €11, and one field earns €1 per
  second

#### Scenario: Milestone jump
- **WHEN** the soybean field is chosen
- **THEN** 24 fields earn €24 per second and 25 fields earn €25 per second: owning more copies
  alone brings no jump

### Requirement: Chain balance table
The page SHALL show, per chain, the smallest whole numbers of fields, processors and kitchens that
run without stalls or surplus, the product output per second of that set, and its income per second.
It SHALL also show what one pass through the chain's manual actions earns, and how many clicks it
takes.

#### Scenario: Soy chain
- **WHEN** the chain balance table is shown with the current content
- **THEN** the soy chain reads 3 soybean fields : 2 tofu presses : 2 Tofu-Wurst kitchens

#### Scenario: Oat and wheat chains
- **WHEN** the chain balance table is shown with the starting values
- **THEN** the oat chain reads 4 oat fields : 3 oat mills : 2 café bars and the wheat chain 4 wheat
  fields : 3 seitan kitchens : 2 Leverkas ovens

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
| First Leverkas oven | 20–55 min |

Milestones and windows SHALL be data, so later changes can add their own, such as the first
chicken.

#### Scenario: Milestone in its window
- **WHEN** the simulated player buys the first soybean field at 4:30
- **THEN** that row shows 4:30 and is marked in the window

#### Scenario: Leverkas at 38 minutes
- **WHEN** the simulated player buys the first Leverkas oven at 38:00
- **THEN** that row is marked in the window

#### Scenario: Not reached
- **WHEN** the simulation ends before any Leverkas oven is bought
- **THEN** the Leverkas oven row is marked not reached

### Requirement: Chain set payback chart
The page SHALL plot, for every chain on one chart, the payback time of its k-th balanced set for
k from 1 to 25, in seconds on a logarithmic axis. A balanced set is the chain's smallest whole
set of fields, processors and kitchens that runs without stalls or surplus (as in the chain
balance table). The k-th set's price SHALL be the sum of the prices of its buildings when k − 1
sets are already owned, bought cheapest first, plus the price of every chain milestone upgrade the
set brings on offer, and its income SHALL be the income it adds, including that upgrade's
doubling. The header of the page SHALL list each chain's set growth and the resulting price
growth per copy of every building, and the price growth of every shelter and species.

#### Scenario: First soy set
- **WHEN** the chart is shown with the current content
- **THEN** the first soy set (3 soybean fields, 2 tofu presses, 2 Tofu-Wurst kitchens) costs €173,
  earns €3 per second and pays back in about 58 seconds

#### Scenario: Later chains cross earlier ones
- **WHEN** the chart is shown with the current content
- **THEN** the soy line starts below the oat line and is above it by the 24th set, and the oat
  line starts below the wheat line and is above it by the 24th set (the 25th set completes a
  chain milestone in every chain, so its payback dips)
