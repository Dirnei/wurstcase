# save-system Specification

## Purpose

Keeps the player's progress safe across reloads, closed tabs and game updates, recovers from a
damaged save instead of losing progress, and lets players move their progress between devices.

## Requirements

### Requirement: Automatic saving
The game SHALL save its complete state in the browser at least every 30 seconds while running,
and additionally when the page becomes hidden or is being closed.

#### Scenario: Periodic save
- **WHEN** the game has been running for 35 seconds since the last save
- **THEN** a new save exists that contains the current play time

#### Scenario: Closing the tab
- **WHEN** the player closes the tab 10 seconds after the last periodic save
- **THEN** the save contains the play time at the moment of closing

### Requirement: Restore on start
When the game starts and a save exists, the game SHALL continue from the newest readable save.
Without any save it SHALL start a new game.

#### Scenario: Reload
- **WHEN** the player reloads the page after 5 minutes of play
- **THEN** the game continues with about 5 minutes of play time

#### Scenario: First visit
- **WHEN** no save exists
- **THEN** a new game starts with play time 0:00:00

### Requirement: Backup slot recovery
The game SHALL keep its two most recent saves. If the newest save cannot be read, the game SHALL
load the other one and show the player a notice that an older save was restored. If neither can
be read, the game SHALL start a new game, show a notice, and keep a copy of the unreadable save
data under a separate key that later saves never overwrite.

#### Scenario: Newest save damaged
- **WHEN** the newest save is corrupted and the previous save is intact
- **THEN** the game continues from the previous save and shows a notice about the restored backup

#### Scenario: Both saves damaged
- **WHEN** both saves are corrupted
- **THEN** a new game starts, a notice says the saved progress could not be read, and the
  unreadable data is still present in the browser after the next autosave

### Requirement: Versioned save format
Every save SHALL record its format version and the time it was written. Saves in an older format
SHALL be upgraded step by step to the current format when loaded. A save with a newer format than
the game supports SHALL NOT be loaded and SHALL NOT be overwritten; the player SHALL see a notice
to reload the page for the newest game version.

#### Scenario: Older format
- **WHEN** a save in format version 1 is loaded by a game whose current format is version 2
- **THEN** the save is upgraded through every step from 1 to 2 and the game continues from it

#### Scenario: Newer format
- **WHEN** the only save has a format version newer than the game supports
- **THEN** the game shows the reload notice and leaves that save untouched

### Requirement: Export and import
The player SHALL be able to export the current progress as a single line of text and copy it. The
player SHALL be able to import such a text; after confirming, the game SHALL continue from the
imported progress and save it immediately. Invalid text SHALL be rejected with a message, and the
current progress SHALL stay unchanged.

#### Scenario: Move to another device
- **WHEN** the player exports on one browser and imports that text on another and confirms
- **THEN** the second browser continues with the same play time

#### Scenario: Invalid import
- **WHEN** the player imports text that is not a valid save
- **THEN** a message says the text is not a valid save and the current progress is unchanged

#### Scenario: Cancelled import
- **WHEN** the player pastes a valid save but does not confirm replacing the current progress
- **THEN** the current progress is unchanged

### Requirement: Storage unavailable
If the browser blocks storage or refuses to save (e.g. storage full), the game SHALL keep running
and SHALL show a notice that progress cannot be saved. Export SHALL still work.

#### Scenario: Blocked storage
- **WHEN** the browser throws on every storage access
- **THEN** the game runs normally, shows the "cannot save" notice, and export still produces a
  valid save text

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
