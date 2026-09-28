# Spec Delta

## MODIFIED Requirements

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
- otherwise buy the purchase with the shortest payback in the current state, and save up for it
  when it cannot pay yet. A missing building that would make a new chain run counts as a
  purchase together with the rest of that chain. Income from a purchase SHALL count what
  customers pay for the products they order and what the surplus buyer pays for the rest. A
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

#### Scenario: Feeding the industry
- **WHEN** the simulation runs with MegaMeat as the surplus buyer and otherwise default settings
- **THEN** it sells to MegaMeat and ends with at most half the customers of the default run
