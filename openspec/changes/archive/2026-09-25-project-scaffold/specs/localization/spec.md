# Spec Delta

## Purpose

Lets every player read the game in German or English, switch between them at any time, and keep
their choice between visits.

## ADDED Requirements

### Requirement: All player-facing text is translatable
The game SHALL display all player-facing text from translation entries that exist in both German
and English. Visible text SHALL NOT be written directly into the page outside the translation
entries.

#### Scenario: Translation sets are complete
- **WHEN** the automated test suite runs
- **THEN** it fails if any translation key exists in one language but not in the other

#### Scenario: Text with values
- **WHEN** a translated text contains a placeholder such as `{time}` and is shown with a value
- **THEN** the placeholder is replaced by that value in the displayed text

### Requirement: Initial language selection
On first visit the game SHALL pick the first German or English entry in the browser's preferred
languages (matching `de` or `en` by language prefix, e.g. `de-AT` → German). If none matches, it
SHALL use English. A previously chosen language SHALL take precedence over the browser setting.

#### Scenario: German browser, first visit
- **WHEN** a player with browser language `de-DE` opens the game for the first time
- **THEN** the game is shown in German

#### Scenario: Unsupported browser language
- **WHEN** a player whose browser only prefers `fr-FR` opens the game for the first time
- **THEN** the game is shown in English

#### Scenario: Stored choice wins
- **WHEN** a player with browser language `de-DE` previously switched to English and reloads
- **THEN** the game is shown in English

### Requirement: Language toggle
The game SHALL offer a DE/EN toggle that is always visible in the header. Switching SHALL update
all visible text immediately without reloading the page and without resetting game time. The
choice SHALL be remembered across page reloads.

#### Scenario: Switch while playing
- **WHEN** the player switches from German to English while the play-time counter shows 0:01:30
- **THEN** all visible text changes to English and the counter continues from 0:01:30

#### Scenario: Choice persists
- **WHEN** the player selects English and reloads the page
- **THEN** the game opens in English

#### Scenario: Storage unavailable
- **WHEN** the browser blocks storage (e.g. strict private mode) and the player switches language
- **THEN** the switch still works for the current visit and no error is shown

### Requirement: Missing translation fallback
If a translation is missing at runtime, the game SHALL show the English text; if that is missing
too, it SHALL show the translation key itself. It SHALL NOT show an empty string or crash.

#### Scenario: Key missing in German only
- **WHEN** the game is in German and a key has only an English entry
- **THEN** the English text is shown

#### Scenario: Key missing everywhere
- **WHEN** a key has no entry in either language
- **THEN** the key name is shown in its place

### Requirement: Document language and title
The page's declared language and the browser tab title SHALL follow the selected language.

#### Scenario: Switch updates tab title
- **WHEN** the player switches to German
- **THEN** the page's language attribute is `de` and the tab title is the German game title
