# dev-tools Specification

## Purpose

Gives the author a developer page with balancing charts and a simulated playthrough, computed from
the game's current content and rules. The page is available only on development instances.

## Requirements

### Requirement: Developer page availability
The game SHALL show the developer page at `#dev` when developer tools are enabled, and SHALL show
the game as for any unknown address otherwise. Developer tools SHALL be enabled on the development
server. In a built game they SHALL be enabled only when the server's developer configuration says
so. A missing or unreadable configuration SHALL count as disabled. The configuration SHALL be
requested only when `#dev` is opened. The page's code and chart library SHALL be downloaded only
after developer tools are found to be enabled.

#### Scenario: Development server
- **WHEN** the game runs under the development server and the author opens `#dev`
- **THEN** the developer page is shown

#### Scenario: Production container, default
- **WHEN** the container runs without `DEV_TOOLS` and a visitor opens `#dev`
- **THEN** the game is shown, and the developer page's code is not downloaded

#### Scenario: Build without a server configuration
- **WHEN** the built game is served without a developer configuration (as on itch.io) and a
  visitor opens `#dev`
- **THEN** the game is shown

#### Scenario: Normal play makes no extra request
- **WHEN** a player loads and plays the game without opening `#dev`
- **THEN** no request for the developer configuration is made

### Requirement: Developer page basics
The developer page SHALL be in English only and SHALL NOT be linked from the game. It SHALL have
a link back to the game. It SHALL compute everything from the content and systems in the running
build, so a changed content value shows up after a reload. Opening it SHALL NOT change the
player's game or save.

#### Scenario: Content change shows up
- **WHEN** the soybean field's base price is changed in the content and the page is reloaded
- **THEN** the cost and payback charts use the new price

#### Scenario: Save untouched
- **WHEN** the author opens the developer page, runs a simulation and returns to the game
- **THEN** the game continues from the same state, and the simulation's state is not saved

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

### Requirement: Chain balance table
The page SHALL show, per chain, the smallest whole numbers of fields, processors and kitchens that
run without stalls or surplus, the product output per second of that set, and its income per second.
It SHALL also show what one pass through the chain's manual actions earns, and how many clicks it
takes.

#### Scenario: Soy chain
- **WHEN** the chain balance table is shown with the current content
- **THEN** the soy chain reads 3 soybean fields : 2 tofu presses : 2 Tofu-Wurst kitchens

### Requirement: Demand ceiling chart
The page SHALL plot, against the number of customers from 10 up to the town size on a logarithmic
axis, the most income per second the customers can pay for when every order is filled with each
product. The chart's title SHALL say that the lines differ only by product price. It SHALL also
show as a table how many kitchens of each product that demand keeps busy.

#### Scenario: Starting neighbours
- **WHEN** the chart is read at 10 customers
- **THEN** it shows €1.50 per second for Tofu-Wurst and €12.50 per second for Leverkas

### Requirement: Bulk buyer table
The page SHALL list every resource with its market value and each bulk buyer's price per unit,
both in euros and as a percentage of the market value. The header of the table SHALL show the step
markup.

#### Scenario: Soybeans
- **WHEN** the table is shown with the current content
- **THEN** soybeans read a market value of €0.64, MegaMeat €0.57 (89%) and the biogas plant
  €0.43 (67%)

### Requirement: Simulated playthrough
The page SHALL simulate a game from a new game state with the game's own simulation step. The
default length is 60 minutes of game time, and the default click rate is 2 clicks per second;
both can be changed on the page. The surplus buyer is the biogas plant by default and can be
switched to MegaMeat on the page. The scripted player SHALL:

- spend its clicks on the manual actions, furthest step of the chain first
- sell by hand until the shop assistant is hired
- hire the assistant as soon as it can pay for it
- every 10 seconds of game time, sell to the surplus buyer whatever stock is more than its
  buildings use, or for products more than the customers order, in the next 30 seconds; when the
  surplus buyer is MegaMeat, resources MegaMeat does not buy go to the biogas plant
- run a campaign whenever one is ready and the pool can pay for it, choosing the one that wins
  the most customers per awareness point right now
- expand the storeroom when any resource is marked as full and the expansion costs at most 300
  seconds of its current income, before choosing its next purchase
- otherwise buy the purchase with the shortest payback in the current state, and save up for it
  when it cannot pay yet. A missing building that would make a new chain run counts as a
  purchase together with the rest of that chain. Income from a purchase SHALL count what
  customers pay for the products they order and what the surplus buyer pays for the rest. A
  rescue counts as a purchase together with the shelter it needs when space is short; its income
  is what the customers add that its awareness of the next 10 minutes would win through the
  campaign with the most customers per awareness point right now.

The same content and settings SHALL always give the same result. The page SHALL plot money, total
earned, income per second and customers over time, and SHALL list every purchase, storeroom
expansions and campaign runs included, with its game time.

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
- **THEN** it has rescued animals, has run campaigns, and ends with more than the 10 starting
  customers

#### Scenario: Campaigns in the log
- **WHEN** a default simulation has run
- **THEN** the log lists the first flyer run with the game time at which it happened

#### Scenario: Feeding the industry
- **WHEN** the simulation runs with MegaMeat as the surplus buyer and otherwise default settings
- **THEN** it sells to MegaMeat and ends with at most half the customers of the default run

#### Scenario: Storeroom grows
- **WHEN** a default simulation has run
- **THEN** the log lists at least one storeroom expansion, and the storeroom's final level is in
  the result

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

### Requirement: Art sheet
The developer page SHALL show every illustration of the game, grouped by kind, each at every size
the game uses it and labelled with its id. The sheet SHALL show each illustration on light paper
and on dark parchment side by side, and SHALL show the landscape in its day and dusk variants.

#### Scenario: Review the art
- **WHEN** the author opens `#dev`
- **THEN** the art sheet shows the soybean field at every size it is used, in the day and dusk
  colours, labelled `soybeanField`

#### Scenario: New art shows up
- **WHEN** an illustration is changed and the page is reloaded
- **THEN** the art sheet shows the changed illustration

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
