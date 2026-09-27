# Proposal: ui-art

## Why

After `ui-shell-tabs` the game has a tight one-screen layout, but every building, resource and
animal is still a lettered placeholder tile, and the background is plain paper. The game needs
real graphics to feel like a game and not a spreadsheet: a landscape behind the UI, and an
illustration for everything the player buys, makes or rescues. It also needs a dusk look for dark
mode. The chosen direction is **storybook**: thin brown ink lines on warm paper and earthy
colours, which fits the "Bio-Laden" satire.

This is the second of the three UI changes (`ui-shell-tabs`, `ui-art`, `ui-motion`). None of them
was foreseen in the planned change sequence in section 8 of the concept doc. They sit between #8
`upgrades` (done) and #9 `faktenbuch`.

## What Changes

- **About 45 hand-drawn SVG illustrations** in one storybook style, replacing the placeholder
  tiles in every art slot:
  - 9 buildings and 9 resources
  - 3 animals and 2 shelters
  - 4 Aktionen and 2 bulk buyers
  - 9 upgrade effect types
  - 6 tabs and the top-bar stats (money, income, awareness, play time, customers, orders)
  - the MegaMeat mark (a made-up satirical logo) and the news ticker's newspaper
- **Upgrade cards** show their effect-type illustration together with the art of what they
  affect, such as a building, product or species. The 17 upgrades need no drawings of their own.
- **Landscape background** behind the whole game view: sky, sun, clouds, rolling hills, fields and
  the farmhouse. It fills every screen shape.
- **Dusk variant** in dark mode: dusk sky, moon, lit farmhouse windows and adjusted ink and paper
  colours for every illustration.
- **Lebenshof farm scene** at the top of the Lebenshof tab. It shows the shelters that have been
  built and one figure per resident, up to 30, then "+N". Screen readers get a text summary.
- **No more emoji as icons**:
  - 📣 in the awareness texts, 📰 in the ticker and the species emoji are replaced by
    illustrations.
  - The species `emoji` field is removed from the content.
  - The Ko-fi "☕" label stays, because the legal-pages spec fixes that text.
- **An art sheet on the developer page (`#dev`)** shows every illustration at every size it is
  used, for reviewing the art. It is not part of the game.

## Capabilities

### New Capabilities
- `game-art`: covers illustrations for every item, how they appear next to names and for screen
  readers, the landscape background, the dusk variant, the farm scene and the no-emoji rule.

### Modified Capabilities
- `lebenshof`: the resident list shows each species' illustration instead of its emoji.
- `dev-tools`: the developer page gains the art sheet.

## Non-goals

- **Animation** of any kind (clouds, animals, feedback effects) is deferred to `ui-motion`. This
  change ships still images.
- **A separate drawing per upgrade.** Effect-type art plus target art covers them.
- **A new logo.** The existing logo stays.
- **Sound.**
- **Raster art or an external art pipeline.** All art is hand-written SVG.
- **Art for content that does not exist yet**, such as the Faktenbuch or later acts. Each later
  change brings its own art, and the typed art maps enforce that.

## Impact

- **UI code**:
  - New `src/ui/art/` with one Svelte component per illustration, grouped by kind, plus
    `index.ts` with typed maps (`Record<BuildingId, Component>` and so on).
  - `ArtSlot.svelte` now looks the art up there.
  - New `Landscape.svelte` and `FarmScene.svelte`.
  - `app.css` gets `--art-*` colour tokens for day and dusk.
  - `UpgradesPanel`, `LebenshofPanel`, `AktionenPanel`, `NewsTicker` and `TopBar` show the art.
- **Game code**: the `emoji` field is removed from `src/game/content/animals.ts`, and
  `DevPage.svelte` no longer reads it. Nothing else in `src/game/` changes.
- **i18n**: 📣 is removed from `lebenshof.awareness`, `lebenshof.animalInfo`, `aktionen.pool` and
  `aktionen.run` in both languages, and the icon is rendered next to the text instead. There is
  a new key for the farm scene summary and "+N".
- **Dependencies**: none.
- **Bundle**: about 50–80 KB of extra JavaScript before compression. The art is inline, so it
  makes no extra requests.
- **Specs**: a new `game-art` spec, plus deltas for `lebenshof` and `dev-tools`.
