# Design: ui-art

## Context

See proposal.md for the motivation. This change builds on `ui-shell-tabs`:

- Every illustration renders through `ArtSlot.svelte` (`kind`, `id`, `size`). Today it draws a
  monogram tile.
- `app.css` has the paper and ink tokens for light and dark.
- The approved style comes from the brainstorming mockups, option C "storybook":
  - brown ink outlines
  - muted earthy fills (soil `#b98a5e`, leaf `#8fae5d`, grain `#e0bf6a`, oat `#d8c79a`, brick
    `#c1715a`, tofu `#f6ecd0`)
  - warm paper and a little hatching
- The known weakness of this style: thin lines turn fuzzy at small sizes. Icons appear at 20 px
  (rail), 32 px (tabs, stats, recipes) and 48 px (cards). The farm scene figures are about 40 px.

## Goals / Non-Goals

**Goals:**
- **One style guide** that every illustration follows, so 45 pieces look like one set.
- **Theming through CSS custom properties only**: no second file per illustration for dusk.
- **Missing art is a type error.**
- **Parts can be animated.** Illustrations expose named parts, such as an animal's eyes and
  body, so `ui-motion` can animate them with CSS alone.

**Non-Goals:**
- Automated visual tests. The art sheet on `#dev` is the review tool.
- Pixel-perfect illustration. The art is hand-written SVG, so it stays simple on purpose.

## Decisions

### 1. One Svelte component per illustration
Each illustration is a component such as `src/ui/art/buildings/SoybeanField.svelte`. The folders
are `buildings`, `resources`, `animals`, `shelters`, `aktionen`, `buyers`, `effects`, `tabs`,
`stats` and `misc` (MegaMeat mark, newspaper).

Each component renders one `<svg viewBox="0 0 64 64">` with no fixed width or height, filling its
slot. `src/ui/art/index.ts` exports typed maps:
- `BUILDING_ART: Record<BuildingId, Component>`
- `RESOURCE_ART: Record<ResourceId, Component>`
- `SPECIES_ART`, `SHELTER_ART`, `AKTION_ART`, `BUYER_ART`
- `EFFECT_ART: Record<UpgradeEffect['kind'], Component>`
- `TAB_ART: Record<TabId, Component>`
- `STAT_ART`

TypeScript rejects a map with a missing key, so `npm run check`, which the Docker build runs,
fails for content without art.

`ArtSlot` keeps its props and swaps the monogram for a map lookup. Callers do not change.

- *Alternative: `.svg` files loaded through `<img>`.* Rejected because CSS custom properties
  cannot reach inside an `<img>`, so dusk would need duplicate files and `ui-motion` could not
  animate parts.
- *Alternative: an SVG sprite with `<use>`.* Rejected because styling and animating parts
  across the shadow boundary is awkward.

### 2. The style guide
- **Grid**: a 64 × 64 viewBox, with the subject inside 4–60 and the ground line at y ≈ 56.
- **Ink**: `stroke: var(--art-ink)`, `stroke-width: 2` (about 1.5 px at 48 px), round caps and
  joins, and one outline weight for every illustration.
- **Fills**: only `--art-*` tokens, at most 5 per illustration, no gradients inside icons, and
  hatching as short ink strokes at 1.2 px.
- **Small sizes**: detail lines sit in `<g class="detail">`. `ArtSlot` sets `data-size`, and CSS
  hides `.detail` at 20 px. That keeps rail icons to silhouette plus main fill, where thin lines
  would otherwise go fuzzy.
- **Named parts**: `class="part-eye"`, `part-body`, `part-crop`, `part-smoke` and so on, for
  `ui-motion`.
- **Faces**: only animals get faces. Buildings and products stay objects, which keeps the
  storybook tone gentle.
- **The MegaMeat mark**: a made-up square logo with a grinning sausage and a crown. It must not
  resemble any real company's mark.

### 3. Colour tokens and dusk
`app.css` gets these art tokens:
- `--art-ink`, `--art-paper`
- `--art-soil`, `--art-leaf`, `--art-leaf-dark`, `--art-grain`, `--art-oat`, `--art-tofu`,
  `--art-brick`, `--art-roof`, `--art-metal`, `--art-cream`, `--art-coffee`, `--art-meat`
- `--art-sky-top`, `--art-sky-bottom`, `--art-hill-1`, `--art-hill-2`, `--art-window`, `--art-sun`

The dark scheme redefines them:
- the ink becomes light (`#efe4cc`)
- the fills lose about 15 % lightness and some saturation
- the sky becomes dusk (`#2b3552` to `#6b5a6e`)
- `--art-window` becomes a warm glow (`#f3c96b`)

The sun and the moon are both in the landscape. `prefers-color-scheme` swaps their opacity, so
the scene changes without a reload. The contrast of outlines against the panels is checked with
the same script as in `ui-shell-tabs`.

### 4. Landscape
`Landscape.svelte` is a `position: fixed; inset: 0; z-index: -1` SVG with
`preserveAspectRatio="xMidYMax slice"`. It is anchored at the bottom centre, so the hills and the
farmhouse stay in view and the sky is what gets cropped. The layers, back to front:
1. sky gradient
2. sun or moon
3. 3 clouds, each a `<g class="part-cloud">` for `ui-motion`
4. far hill
5. fields with rows
6. farmhouse with windows
7. near hill

It renders only on game routes, not on legal pages or `#dev`. The shell's panels are opaque
paper, so contrast never depends on the background.

### 5. Farm scene
`FarmScene.svelte` is a wide SVG (`viewBox 0 0 640 200`) with ground, fence and sky, and shelter
buildings from left to right (stable, then pasture).

Residents are placed on a fixed slot grid of 30 positions, precomputed as jittered rows to look
natural. The resident with rescue index *i* always takes slot *i*, so places are stable across
reloads and new arrivals. The figures reuse `SPECIES_ART`, scaled by species (chicken 0.6, pig
0.8, cow 1.0).

The SVG is `aria-hidden`. A visually hidden `<p>` next to it carries the summary built from new
i18n keys (`farm.summary.<species>` with a count, and `farm.more`).

### 6. Replacing the emoji
- 📣 is removed from four i18n strings. The components render `STAT_ART.awareness` before the
  text instead.
- 📰 in `NewsTicker` is replaced by `MISC_ART.newspaper`.
- The `emoji` field goes from `SpeciesDef` in `src/game/content/animals.ts`. `DevPage` labels
  species by id only.

This is the only `src/game/` change. No other content entries change.

### 7. Art sheet on `#dev`
`src/dev/ArtSheet.svelte` iterates over the typed maps. It renders each piece at 20, 32, 48 and
96 px on a light and a dark panel. The dark panel sets the dusk tokens on its own subtree, so
both show at once. Below that, it shows the landscape in day and dusk. It is loaded with the rest
of the dev page, so normal play never downloads it.

## Risks / Trade-offs

- [45 illustrations drift in style] → Build the style guide and the 3 approved mockup pieces
  first, as references. Review the whole set side by side on the art sheet before finishing.
- [Rail icons are unreadable at 20 px] → The `.detail` group is hidden at small sizes. Each
  resource has a distinct silhouette and main colour, and the name is still next to it except in
  the compact rail.
- [Inline SVG adds DOM nodes on busy tabs] → Icons stay under about 40 elements each. The farm
  scene caps figures at 30, and only the open tab renders.
- [Dark ink on dark parchment disappears] → Dusk swaps the ink to light and is checked with the
  contrast script.
- [The MegaMeat mark accidentally resembles a real brand] → Use a deliberately generic shape
  (crowned sausage) and no real typeface or brand colours.

## Migration Plan

UI only. Saves are untouched: the `emoji` field was never saved. Rollback means reverting the
commit.
