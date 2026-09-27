# awareness Specification

## Purpose

Turns the Lebenshof's residents into a growing customer base. Animals produce awareness, and
awareness steadily converts the townspeople into customers until the town runs out of people.

## Requirements

### Requirement: Awareness production
Each resident SHALL produce awareness at its species' rate (chicken 1, pig 5, cow 20 per second).
The total awareness per second SHALL be the sum over all residents. It SHALL be shown in the
Lebenshof panel.

#### Scenario: Mixed residents
- **WHEN** the Lebenshof has 3 chickens, 2 pigs and 1 cow
- **THEN** awareness is 33 per second

#### Scenario: Empty Lebenshof
- **WHEN** there are no residents
- **THEN** awareness is 0 per second and no customers are converted

### Requirement: Town population
Act 1's town SHALL have a population of 20,000. The sales panel SHALL show the customers
together with the population, both in the game's number format ("12 of 20K townspeople").

#### Scenario: New game
- **WHEN** a new game starts
- **THEN** the sales panel shows "Customers: 10 of 20K townspeople" in English and
  "Kundschaft: 10 von 20 Tsd. Einwohnern" in German

### Requirement: Passive conversion
Every time the game advances, townspeople SHALL become customers at a rate of 0.02 × awareness per
second × (1 − customers ÷ population) per second. Customers SHALL grow in whole customers only.
The fraction towards the next customer SHALL carry over to later ticks, so splitting time into short
ticks loses no progress. Customers SHALL never exceed the population.

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

### Requirement: More customers, more orders
Converted customers SHALL place orders in the same way as the starting neighbours.

#### Scenario: Orders follow customers
- **WHEN** conversion has raised the customers from 10 to 40
- **THEN** open orders build up four times as fast as with 10 customers
