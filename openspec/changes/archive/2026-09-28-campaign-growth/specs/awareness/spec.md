## MODIFIED Requirements

### Requirement: Awareness production
Each resident SHALL produce awareness at its species' rate (chicken 1, pig 5, cow 20 per second).
The total awareness per second SHALL be the sum over all residents, multiplied by the awareness
factor of the active MegaMeat counter-event (1 when none is active). The produced awareness SHALL
be added to an awareness pool of whole points. The fraction towards the next point SHALL carry
over between ticks. Awareness SHALL NOT convert townspeople into customers by itself; customers
SHALL grow only through campaigns, as the Aktionen require. The Lebenshof panel SHALL show the
awareness per second, and the Aktionen panel SHALL show the pool. While a counter-event lowers
awareness, the rate SHALL be marked as reduced.

#### Scenario: Mixed residents
- **WHEN** the Lebenshof has 3 chickens, 2 pigs and 1 cow
- **THEN** awareness is 33 per second

#### Scenario: Empty Lebenshof
- **WHEN** there are no residents and 60 seconds pass
- **THEN** awareness is 0 per second and the pool does not grow

#### Scenario: Pool fills
- **WHEN** the Lebenshof has 3 chickens, the pool holds 0 and 10 seconds pass
- **THEN** the pool holds 30

#### Scenario: Pool in whole points
- **WHEN** the Lebenshof has 1 chicken and 1.5 seconds pass in 15 ticks of 0.1 seconds
- **THEN** the pool holds 1, and after 0.5 more seconds it holds 2

#### Scenario: Ad campaign halves awareness
- **WHEN** the Lebenshof has 3 chickens, the "Echte Männer essen Fleisch" campaign is active and
  10 seconds pass
- **THEN** awareness is 1.5 per second, shown as reduced, and the pool grows by 15

#### Scenario: No customers without campaigns
- **WHEN** there are 10 customers, awareness is 1,000 per second and 10 minutes pass without a
  campaign being run
- **THEN** there are still 10 customers, and the pool has grown by 600,000

### Requirement: More customers, more orders
Converted customers SHALL place orders in the same way as the starting neighbours.

#### Scenario: Orders follow customers
- **WHEN** campaigns have raised the customers from 10 to 40
- **THEN** open orders build up four times as fast as with 10 customers

## REMOVED Requirements

### Requirement: Passive conversion
**Reason**: Customers now grow only through campaigns that cost awareness, so every new customer
is the result of a player decision and the awareness pool is the currency of growth.
**Migration**: Run campaigns on the Aktionen tab; their reach grows with every run. The saved
passive conversion progress is dropped by the save migration. Automated campaigns for idle play
are planned for a later change.
