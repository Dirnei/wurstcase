# Spec Delta

## ADDED Requirements

### Requirement: Start a new game
The save panel SHALL offer a "New game" button. Clicking it SHALL ask the player to confirm, and
the question SHALL say that all progress including the Lebenshof animals will be deleted, that
this cannot be undone, and that Export makes a backup first. After confirming, the game SHALL
continue from a new game state, save it immediately into both save slots, and show that a new
game has started. Without confirmation nothing SHALL change. After a new game, neither a reload
nor the backup slot SHALL bring back the previous progress.

#### Scenario: Confirmed
- **WHEN** the player has 5 tofu presses and 3 chickens, clicks "New game" and confirms
- **THEN** money is €0, no buildings or residents are owned, customers are 10, play time is
  0:00:00, and a message says a new game has started

#### Scenario: Cancelled
- **WHEN** the player clicks "New game" and does not confirm
- **THEN** the progress is unchanged

#### Scenario: Reload after a new game
- **WHEN** the player confirms a new game and reloads the page at once
- **THEN** the game continues from the new game, not from the previous progress

#### Scenario: Backup slot does not restore the old game
- **WHEN** the player confirms a new game and the newest save is then damaged
- **THEN** the game restores from the backup slot and still shows the new game

#### Scenario: Unlocks badge again
- **WHEN** the player had unlocked the Lebenshof, starts a new game and earns €100 again
- **THEN** the Lebenshof tab shows its badge as new
