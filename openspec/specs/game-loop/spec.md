# game-loop Specification

## Purpose

Advances game time smoothly and deterministically while the game is open, so that every later
mechanic progresses at the same rate on any device, whether the tab is visible or not.

## Requirements

### Requirement: Game time follows real time
While the page is open, the game SHALL advance game time by the real time that has elapsed, in
steps of about one tenth of a second, and the display SHALL refresh after every step.

#### Scenario: One minute of play
- **WHEN** the page stays open and visible for 60 seconds
- **THEN** the play-time counter shows 0:01:00 (±1 second)

#### Scenario: Slow device
- **WHEN** the browser can only run the loop 4 times per second instead of 10
- **THEN** game time still advances by the real elapsed time, not by a fixed amount per step

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

### Requirement: Catch-up after a hidden tab
When the tab was hidden or the browser paused the page, the game SHALL credit the missed time when
it resumes, up to a maximum of 60 seconds per resume. Longer gaps SHALL be credited as 60 seconds.

#### Scenario: Short hidden period
- **WHEN** the tab is hidden for 20 seconds and then shown again
- **THEN** play time has advanced by about 20 seconds

#### Scenario: Long hidden period is capped
- **WHEN** the tab is hidden for 10 minutes and then shown again
- **THEN** play time has advanced by 60 seconds for that gap

#### Scenario: Clock jumps backwards
- **WHEN** the system clock is set back while the game is running
- **THEN** game time does not go backwards and the game keeps running

### Requirement: Play-time counter
The game SHALL show the total play time of the current game, labelled in the selected language.
It continues from the saved play time when the page loads and starts at 0:00:00 only for a new
game.

#### Scenario: Fresh load
- **WHEN** the page is loaded and no save exists
- **THEN** the counter shows 0:00:00 and starts counting up

#### Scenario: Continued game
- **WHEN** the page is loaded and the save contains 1 hour of play time
- **THEN** the counter shows 1:00:00 and continues counting up
