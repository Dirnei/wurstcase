# Spec Delta

## Purpose

Advances game time smoothly and deterministically while the game is open, so that every later
mechanic progresses at the same rate on any device, whether the tab is visible or not.

## ADDED Requirements

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
within a relative tolerance of 10^-9 for floating-point rounding.

#### Scenario: Split steps
- **WHEN** one game state is advanced by 1 second, and an identical state is advanced 10 times by
  0.1 seconds
- **THEN** both resulting states are equal within that tolerance

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
The game SHALL show the play time of the current visit, labelled in the selected language. It
starts at 0:00:00 when the page loads.

#### Scenario: Fresh load
- **WHEN** the page is loaded
- **THEN** the counter shows 0:00:00 and starts counting up
