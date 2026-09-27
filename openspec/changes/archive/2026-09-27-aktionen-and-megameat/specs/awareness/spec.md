# Spec Delta

## MODIFIED Requirements

### Requirement: Awareness production
Each resident SHALL produce awareness at its species' rate (chicken 1, pig 5, cow 20 per second).
The total awareness per second SHALL be the sum over all residents, multiplied by the awareness
factor of the active MegaMeat counter-event (1 when none is active). The produced awareness SHALL
also be added to an awareness pool of whole points. The fraction towards the next point SHALL carry
over between ticks. The Lebenshof panel SHALL show the awareness per second, and the Aktionen
panel SHALL show the pool. While a counter-event lowers awareness, the rate SHALL be marked as
reduced.

#### Scenario: Mixed residents
- **WHEN** the Lebenshof has 3 chickens, 2 pigs and 1 cow
- **THEN** awareness is 33 per second

#### Scenario: Empty Lebenshof
- **WHEN** there are no residents
- **THEN** awareness is 0 per second and no customers are converted

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

### Requirement: Passive conversion
Every time the game advances, townspeople SHALL become customers at a rate of 0.02 × awareness per
second × (1 − customers ÷ population) per second, using the awareness per second including any
counter-event factor. While a counter-event pauses conversion, no townspeople SHALL be converted
passively and the fraction towards the next customer SHALL be kept. Customers SHALL grow in whole
customers only. The fraction towards the next customer SHALL carry over to later ticks, so
splitting time into short ticks loses no progress. Passive conversion SHALL NOT use up the
awareness pool. Customers SHALL never exceed the population.

#### Scenario: Half the town converted
- **WHEN** there are 10,000 customers, awareness is 100 per second and 10 seconds pass
- **THEN** there are 10,010 customers

#### Scenario: Saturation slows conversion
- **WHEN** there are 15,000 customers, awareness is 100 per second and 10 seconds pass
- **THEN** there are 15,005 customers

#### Scenario: Whole customers only
- **WHEN** there are 10 customers, awareness is 1 per second and 10 seconds pass
- **THEN** there are still 10 customers

#### Scenario: Progress carries over
- **WHEN** there are 10 customers, awareness is 1 per second and 60 seconds pass in ticks of 10 seconds
- **THEN** there are 11 customers

#### Scenario: Split ticks
- **WHEN** the same Lebenshof converts once for 60 seconds and once in 600 ticks of 0.1 seconds
- **THEN** both end within one customer of each other

#### Scenario: Never beyond the town
- **WHEN** there are 19,995 customers, awareness is 1,000,000 per second and 60 seconds pass
- **THEN** there are 20,000 customers

#### Scenario: Pool untouched by conversion
- **WHEN** there are 10,000 customers, awareness is 100 per second, the pool holds 500 and 10
  seconds pass
- **THEN** there are 10,010 customers and the pool holds 1,500

#### Scenario: Paused by the study
- **WHEN** the MegaMeat "study" is active, awareness is 100 per second and 30 seconds pass
- **THEN** no customers are converted passively, and the pool still grows by 3,000
