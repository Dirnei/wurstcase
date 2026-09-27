# Spec Delta

## Purpose

Gives the author a developer page with balancing charts and a simulated playthrough, computed from
the game's current content and rules. The page is available only on development instances.

## ADDED Requirements

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
be its output per second times the vegan value of the output, assuming the rest of its chain and
the demand keep up. The vegan value of a unit is what it earns once it is turned into its chain's
product and sold to a customer. The chart SHALL offer a logarithmic y axis.

#### Scenario: Soybean field
- **WHEN** the soybean field is chosen
- **THEN** the price of the first copy is €10, of the second €11, and one field earns €1 per
  second

### Requirement: Payback chart
The page SHALL plot, for every building on one chart, the payback time of the n-th copy (its
price divided by the income it adds) for n from 1 to 50, in seconds on a logarithmic axis.

#### Scenario: First copies
- **WHEN** the payback chart is shown with the current content
- **THEN** the first soybean field pays back in 10 seconds and the first tofu press in about 17
  seconds

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
product. It SHALL also show as a table how many kitchens of each product that demand keeps busy.

#### Scenario: Starting neighbours
- **WHEN** the chart is read at 10 customers
- **THEN** it shows €1.50 per second for Tofu-Wurst and €12.50 per second for Leverkas

### Requirement: Bulk buyer table
The page SHALL list every resource with its vegan value and each bulk buyer's price per unit, both
in euros and as a percentage of the vegan value.

#### Scenario: Soybeans
- **WHEN** the table is shown with the current content
- **THEN** soybeans read a vegan value of €1.00, MegaMeat €0.10 (10%) and the biogas plant
  €0.05 (5%)

### Requirement: Simulated playthrough
The page SHALL simulate a game from a new game state with the game's own simulation step. The
default length is 60 minutes of game time, and the default click rate is 2 clicks per second;
both can be changed on the page. The scripted player SHALL:

- spend its clicks on the manual actions, furthest step of the chain first
- sell by hand until the shop assistant is hired
- hire the assistant as soon as it can pay for it
- otherwise buy the purchase with the shortest payback in the current state, and save up for it
  when it cannot pay yet. A missing building that would make a new chain run counts as a
  purchase together with the rest of that chain.

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

### Requirement: Pacing table
After a simulation, the page SHALL show each pacing milestone with its target window from the
concept doc and the simulated game time at which it happened. Each milestone SHALL be marked as
early, in the window, late, or not reached. The milestones are:

| Milestone | Target window |
|---|---|
| First soybean field | 2–10 min |
| First tofu press | 2–10 min |
| First wheat field | 10–20 min |
| First Leverkas oven | 20–35 min |
| First oat field | 20–35 min |

Milestones and windows SHALL be data, so later changes can add their own, such as the first
chicken.

#### Scenario: Milestone in its window
- **WHEN** the simulated player buys the first soybean field at 4:30
- **THEN** that row shows 4:30 and is marked in the window

#### Scenario: Not reached
- **WHEN** the simulation ends before any oat field is bought
- **THEN** the oat field row is marked not reached
