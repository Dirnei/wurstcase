# Spec Delta

## Purpose

Gives every player an always-reachable Impressum and privacy policy with the operator's current
details, and guarantees the privacy properties those pages promise: no cookies and no third-party
requests.

## ADDED Requirements

### Requirement: Always-visible legal footer
The game SHALL show a footer on every screen with two links: "Impressum" and "Datenschutz" in
German, "Legal notice" and "Privacy" in English. The footer SHALL be visible without scrolling
horizontally at any width down to 320 px.

#### Scenario: Footer while playing
- **WHEN** the game is open in German
- **THEN** the page shows links labelled "Impressum" and "Datenschutz"

#### Scenario: Footer in English
- **WHEN** the player switches to English
- **THEN** the links read "Legal notice" and "Privacy"

### Requirement: Legal pages open without interrupting the game
Choosing a footer link SHALL show the corresponding page within the game, with a way back to the
game. The game SHALL keep running while a legal page is shown, and returning SHALL NOT reset any
game state.

#### Scenario: Read the Impressum mid-game
- **WHEN** the play-time counter shows 0:02:00, the player opens the Impressum for 10 seconds and
  goes back
- **THEN** the counter shows about 0:02:10

### Requirement: Direct links
The Impressum SHALL be reachable directly at the game URL with `#impressum`, and the privacy
policy at `#datenschutz`. The browser's back button SHALL return from a legal page to the game.

#### Scenario: Link from outside
- **WHEN** someone opens `http://localhost:8234/#datenschutz`
- **THEN** the privacy policy is shown immediately

#### Scenario: Back button
- **WHEN** the player opened the Impressum from the footer and presses the browser's back button
- **THEN** the game view is shown again

### Requirement: Impressum content
The Impressum SHALL state, as information according to § 5 DDG, the operator's name, street
address, postal code, city, country and email address, with the email shown as a `mailto:` link.
These details SHALL come from the operator configuration, not from the game's built-in text.

#### Scenario: Configured details
- **WHEN** the operator configured the name "Erika Beispiel" and the email "erika@example.org"
- **THEN** the Impressum shows "Erika Beispiel" and a link to `mailto:erika@example.org`

### Requirement: Privacy policy content
The privacy policy SHALL cover at least: the controller (the operator's details); that the game
sets no cookies and uses no analytics, ads or third-party content; what the game stores in the
browser (language choice and game progress), why, and how to delete it; the server access log,
including that IP addresses are stored only in shortened form; the hosting provider; and the
visitor's rights under Art. 15–21 GDPR plus the right to complain to a supervisory authority
(Art. 77 GDPR).

#### Scenario: Topics present
- **WHEN** the privacy policy is opened in German
- **THEN** it has a section for each of: Verantwortlicher, Cookies und Tracking, Speicherung im
  Browser, Server-Logdateien, Hosting, Ihre Rechte

### Requirement: German text is authoritative
Both legal pages SHALL be available in German and English. The English pages SHALL state that
they are a courtesy translation and that the German version is legally binding.

#### Scenario: English privacy page
- **WHEN** the privacy policy is opened in English
- **THEN** a note says the German version is legally binding

### Requirement: Missing operator details
If the operator details cannot be loaded, the legal pages SHALL show a clear message that the
details are temporarily unavailable, and the rest of the game SHALL keep working.

#### Scenario: legal.json unreachable
- **WHEN** the operator details request fails and the player opens the Impressum
- **THEN** a "details unavailable" message is shown and the play-time counter keeps running

### Requirement: No cookies and no third-party requests
The game SHALL NOT set cookies and SHALL NOT make requests to any host other than the one serving
it.

#### Scenario: Cookie jar stays empty
- **WHEN** the game has been played and both legal pages opened
- **THEN** the game's own origin has no cookies

#### Scenario: Same-origin only
- **WHEN** all network requests made while loading and playing are recorded
- **THEN** every request goes to the game's own origin
