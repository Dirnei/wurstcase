# Spec Delta

## ADDED Requirements

### Requirement: Support link
The footer SHALL show a link to the author's Ko-fi page at https://ko-fi.com/dirnei, labelled
"☕ Unterstütze mich auf Ko-fi" in German and "☕ Support me on Ko-fi" in English. The link SHALL
be plain text, SHALL open in a new tab and SHALL send no referrer. Showing the link SHALL NOT load
anything from Ko-fi or any other host.

#### Scenario: Link in German
- **WHEN** the game is open in German
- **THEN** the footer shows a link "☕ Unterstütze mich auf Ko-fi" to https://ko-fi.com/dirnei

#### Scenario: Link in English
- **WHEN** the player switches to English
- **THEN** the link reads "☕ Support me on Ko-fi"

#### Scenario: Game keeps running
- **WHEN** the player follows the link
- **THEN** Ko-fi opens in a new tab and the game's tab stays open and keeps running

#### Scenario: No request before the click
- **WHEN** all network requests made while loading and playing are recorded and the link is not
  clicked
- **THEN** no request goes to Ko-fi

## MODIFIED Requirements

### Requirement: Privacy policy content
The privacy policy SHALL cover at least: the controller (the operator's details); that the game
sets no cookies and uses no analytics, ads or third-party content; that the footer links to Ko-fi,
an external site that receives data only when a visitor follows the link; what the game stores in
the browser (language choice and game progress), why, and how to delete it; the server access log,
including that IP addresses are stored only in shortened form; the hosting provider; and the
visitor's rights under Art. 15–21 GDPR plus the right to complain to a supervisory authority
(Art. 77 GDPR).

#### Scenario: Topics present
- **WHEN** the privacy policy is opened in German
- **THEN** it has a section for each of: Verantwortlicher, Cookies und Tracking, Speicherung im
  Browser, Server-Logdateien, Hosting, Ihre Rechte

#### Scenario: Ko-fi link explained
- **WHEN** the privacy policy is opened in German or English
- **THEN** the cookies and tracking section says that the Ko-fi link leads to an external site
  that receives data only when it is followed
