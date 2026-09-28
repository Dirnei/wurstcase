# game-art Specification

## Purpose
Gives the game its storybook look: an illustration for every building, resource, animal and other
item, a landscape behind the game view with a dusk variant for dark mode, and a farm scene where
the rescued animals live.

## Requirements

### Requirement: An illustration for every item
Every building, resource, animal species, shelter type, Aktion, bulk buyer, upgrade effect type
and tab SHALL have its own illustration. The top-bar stats (money, income, awareness), the play
time and the rail's customers and open orders SHALL have one too. The illustrations SHALL be shown
wherever the item is shown:
- building cards
- the rail
- the sales figures
- shelter, rescue and resident entries
- Aktion cards
- bulk buyer cards
- the tab strip and bottom bar
- the top bar
- the play time on the Einstellungen tab

Each item SHALL use the same illustration everywhere. A build SHALL fail when any item that is
content has no illustration.

#### Scenario: Building card
- **WHEN** the Produktion tab shows the soybean field
- **THEN** its card shows the soybean field illustration

#### Scenario: Same art everywhere
- **WHEN** tofu is shown in the rail and in the tofu press's recipe
- **THEN** both show the same tofu illustration

#### Scenario: Play-time art
- **WHEN** the player opens Einstellungen
- **THEN** the play time is shown with the hourglass illustration

### Requirement: Upgrade art
Each upgrade card SHALL show the illustration of its effect type. For effects that name
buildings, a product or a species, the card SHALL also show the illustration of the first item
named.

#### Scenario: Rate upgrade
- **WHEN** the "second farmer" upgrade (fields ×1.5) is on offer
- **THEN** its card shows the faster-production illustration together with the soybean field
  illustration

### Requirement: Illustrations and screen readers
An illustration shown next to its item's visible name SHALL be hidden from screen readers. An
illustration shown without a visible name, as in the compact rail, SHALL carry the item's name
in the selected language.

#### Scenario: Compact rail
- **WHEN** the viewport is 900 px wide and the rail hides the resource names
- **THEN** a screen reader reads each resource's name with its amount

### Requirement: Vector art from the game's own files
Illustrations SHALL be vector graphics that stay sharp at every size and zoom level. They SHALL be
part of the game's own files and SHALL NOT cause requests to other hosts.

#### Scenario: Zoomed in
- **WHEN** the browser zoom is 200 %
- **THEN** the illustrations are sharp, with no pixelated edges

### Requirement: Landscape background
The game view SHALL show a landscape behind its panels: sky, sun, clouds, hills, fields and a
farmhouse. It SHALL fill the whole viewport at every size and aspect ratio without distortion. It
SHALL stay in place while a tab's content scrolls, and SHALL never cover or reduce the contrast of
text or controls. Legal pages and the developer page SHALL NOT show it.

#### Scenario: Wide screen
- **WHEN** the viewport is 2560 × 1080 px
- **THEN** the landscape fills the whole background, and the hills and farmhouse are not stretched

#### Scenario: Content scrolls
- **WHEN** a tab's content scrolls
- **THEN** the landscape stays where it is

### Requirement: Dusk in dark mode
When the dark theme is in effect, whether chosen by the player or taken from the system's colour
scheme, the landscape SHALL show dusk: a dark evening sky, the moon instead of the sun and lit
farmhouse windows. Every illustration SHALL switch to its dusk colours. In both themes, an
illustration's outlines SHALL have a contrast of at least 3:1 against the panel behind them.

#### Scenario: Evening
- **WHEN** the theme choice is System and the system switches to a dark colour scheme while the
  game is open
- **THEN** the landscape shows the dusk sky, the moon and lit windows, without a reload

#### Scenario: Chosen dusk
- **WHEN** the system uses a light colour scheme and the player chooses Dark
- **THEN** the landscape shows the dusk sky, the moon and lit windows, and every illustration uses
  its dusk colours

### Requirement: Farm scene
The Lebenshof tab SHALL show a farm scene above its lists. The scene SHALL show one building per
shelter built and one figure per resident, in rescue order, up to 30 figures. Above that, it SHALL
show 30 figures and a "+N" label for the rest.

Each resident SHALL keep its place in the scene when more animals arrive or the page is reloaded.
For screen readers, the scene SHALL be summarised as a count per species ("3 chickens, 1 pig"),
and the drawing itself SHALL be hidden from them.

#### Scenario: First residents
- **WHEN** the player has built one stable and rescued 2 chickens
- **THEN** the scene shows one stable and 2 chickens, and a screen reader hears "2 chickens"

#### Scenario: Many residents
- **WHEN** the Lebenshof has 45 residents
- **THEN** the scene shows 30 figures and "+15"

#### Scenario: Stable places
- **WHEN** the player rescues another animal
- **THEN** the animals already in the scene stay where they were

### Requirement: No emoji as icons
The game view SHALL NOT use emoji as icons. Awareness, the news ticker and animal species SHALL
use their illustrations. Emoji inside player-facing text that a spec fixes word for word, such as
the Ko-fi link label, are not icons and stay.

#### Scenario: Awareness
- **WHEN** the Aktionen tab shows the awareness pool
- **THEN** the amount is shown with the awareness illustration and without the 📣 emoji
