# Design: settings-in-tab

## Context

See proposal.md - Why. What we found in the code:

- `TopBar.svelte` renders brand, the `.stats` grid (three slots, `repeat(3, minmax(0, 11rem))`
  from `stable-top-bar`) and a `.tools` block with the DE/EN button group (`language.toggle.label`)
  and the gear link to `#einstellungen`. On phones the stats take their own row (`order: 3;
  flex-basis: 100%`) and `.tools` sits right of the brand.
- `SettingsTab.svelte` already has a language section with `aria-pressed` buttons calling
  `setLanguage`, so no new language UI is needed.
- `TabNav.svelte` marks the Einstellungen `li` with `.settings` and hides it with `display: none`
  in two media queries (below 1024 px and again below 768 px). The bottom bar uses `li { flex: 1;
  min-width: 0 }`, `min-height: 52px` and `hyphens: auto` labels at 0.75rem.

**src/game/ files and content entries:** none are added or changed.

## Goals / Non-Goals

**Goals:**
- Remove the duplicates without leaving Einstellungen unreachable at any width.

**Non-Goals:**
- Reworking the tab bar's look for six entries beyond what is needed to fit.

## Decisions

### 1. Remove `.tools` from the top bar entirely

The language group, the gear link, their `LANGS` / `currentLang` / `setLanguage` / `currentTab`
imports and the `.tools`, `.language`, `.settings` styles go. With nothing to the right of the
stats, the top bar no longer needs the phone rule that pushes the stats onto their own row: brand
and stats can share one row when they fit, and the stats grid keeps its fixed tracks. The phone
check at 320 px decides whether the brand keeps the first row (current behaviour) or shares it;
keep the current two-row phone layout if three slots next to the logo do not fit.

### 2. Show the Einstellungen tab at every width

Delete both `.settings { display: none }` rules and the now unused `class:settings`. On phones the
bottom bar then has six equal `flex: 1` items: at 320 px that is about 52 px each, above the 44 px
minimum. "Einstellungen" is the longest label; it already hyphenates, and at 0.75rem it breaks as
"Einstel-lungen" in two lines inside the 52 px height.

- *Alternative: a shorter phone label ("Mehr" / "More").* Rejected for now: a second label key for
  one tab, and "Einstellungen" still fits with hyphenation. Revisit only if the browser check shows
  it clipping.

### 3. Drop the unused key

`language.toggle.label` is only used by the top-bar group, so it is removed from both
dictionaries. `language.toggle.de` / `.en` stay (the settings buttons use them).

## Risks / Trade-offs

- [Players used to the header toggle look for it there] → The game detects the browser language
  on first visit, so most never need to switch; the Einstellungen tab is always one tap away.
- [Six bottom-bar entries at 320 px feel cramped, especially with locked tabs showing a hint] →
  Check at 320 px with all tabs locked except the first two and with all unlocked.
- [`theme-choice` is in flight and also touches `SettingsTab.svelte` and the Settings tab
  requirement] → This change touches neither, so both can be applied in any order.

## Migration Plan

No data migration. Roll back by reverting the commit.
