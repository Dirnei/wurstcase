# Spec Delta

## MODIFIED Requirements

### Requirement: Cost vs income chart
For a chosen building, the page SHALL plot, for 0 to 50 copies owned, the price of the next copy,
the total spent so far and the income per second of that many copies. A building's income SHALL
be its output per second without upgrades times the vegan value of the output, assuming the rest
of its chain and the demand keep up. The vegan value of a unit is what it earns once it is turned
into its chain's product and sold to a customer. The chart SHALL offer a logarithmic y axis.

#### Scenario: Soybean field
- **WHEN** the soybean field is chosen
- **THEN** the price of the first copy is €10, of the second €12, and one field earns €1 per
  second

#### Scenario: Milestone jump
- **WHEN** the soybean field is chosen
- **THEN** 24 fields earn €24 per second and 25 fields earn €25 per second: owning more copies
  alone brings no jump

### Requirement: Payback chart
The page SHALL plot, for every building on one chart, the payback time of the n-th copy (its
price divided by the income it adds) for n from 1 to 50, in seconds on a logarithmic axis.

#### Scenario: First copies
- **WHEN** the payback chart is shown with the current content
- **THEN** the first soybean field pays back in 10 seconds and the first tofu press in about 17
  seconds

#### Scenario: Milestone copy
- **WHEN** the payback chart is shown with the current content
- **THEN** every soybean field pays back more slowly than the one before it, including the 25th

### Requirement: Chain set payback chart
The page SHALL plot, for every chain on one chart, the payback time of its k-th balanced set for
k from 1 to 25, in seconds on a logarithmic axis. A balanced set is the chain's smallest whole
set of fields, processors and kitchens that runs without stalls or surplus (as in the chain
balance table). The k-th set's price SHALL be the sum of the prices of its buildings when k − 1
sets are already owned, bought cheapest first, plus the price of every chain milestone upgrade the
set brings on offer, and its income SHALL be the income it adds, including that upgrade's
doubling. The header of the page SHALL list the price growth of every building, shelter and
species.

#### Scenario: First soy set
- **WHEN** the chart is shown with the current content
- **THEN** the first soy set (3 soybean fields, 2 tofu presses, 2 Tofu-Wurst kitchens) costs €175,
  earns €3 per second and pays back in about 58 seconds

#### Scenario: Later chains cross earlier ones
- **WHEN** the chart is shown with the current content
- **THEN** the soy line starts below the oat line and is above it by the 24th set, and the oat
  line starts below the wheat line and is above it by the 24th set (the 25th set completes a
  chain milestone in every chain, so its payback dips)
