## MODIFIED Requirements

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
- expand the storeroom when any resource is marked as full and the expansion costs at most 300
  seconds of its current income, before choosing its next purchase
- otherwise buy the purchase with the shortest payback in the current state, and save up for it
  when it cannot pay yet. A missing building that would make a new chain run counts as a
  purchase together with the rest of that chain. Income from a purchase SHALL count what
  customers pay for the products they order and what the surplus buyer pays for the rest. A
  rescue counts as a purchase together with the shelter it needs when space is short; its income
  is what the customers it converts in the next 10 minutes add.

The same content and settings SHALL always give the same result. The page SHALL plot money, total
earned, income per second and customers over time, and SHALL list every purchase, storeroom
expansions included, with its game time.

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

#### Scenario: Storeroom grows
- **WHEN** a default simulation has run
- **THEN** the log lists at least one storeroom expansion, and the storeroom's final level is in
  the result
