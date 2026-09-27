# Spec Delta

## MODIFIED Requirements

### Requirement: Deterministic simulation
Advancing the game SHALL depend only on the current game state and the amount of time advanced.
Advancing by a total duration in one step or in several smaller steps SHALL give the same result,
within a relative tolerance of 10^-9 for floating-point rounding, with one exception: because
buildings produce and customers order in whole units, amounts MAY differ by what completes at the
boundary of the period. That is at most one unit per building type for each resource, and at most
one order for open orders, with the money and stock of a sale made from that order.

#### Scenario: Split steps
- **WHEN** one game state is advanced by 1 second, and an identical state is advanced 10 times by
  0.1 seconds
- **THEN** both resulting states are equal within that tolerance

#### Scenario: Split steps with production
- **WHEN** a game state with a soybean field, a tofu press and a Tofu-Wurst kitchen is advanced
  by 60 seconds once, and an identical state 600 times by 0.1 seconds
- **THEN** play time is equal within the tolerance, and each resource differs by at most one unit
  per building type in the chain

#### Scenario: Split steps with automatic selling
- **WHEN** a game state with a Tofu-Wurst chain and the shop assistant is advanced by 60 seconds
  once, and an identical state 600 times by 0.1 seconds
- **THEN** open orders differ by at most one, and money differs by at most the price of one
  Tofu-Wurst
