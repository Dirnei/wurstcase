# Proposal

## Why

With the Lebenshof, awareness converts townspeople passively, and that is all. The player has
nothing active to do with it, the villain never acts, and the game has no voice apart from button
labels. Section 3.5–3.6 of `docs/superpowers/specs/2026-09-25-vegan-idle-game-design.md` plans
three things for this:

- **Aktionen:** campaigns that spend awareness for fast conversion, which rewards active play.
- **MegaMeat counter-events:** these give the villain teeth.
- **A satirical news ticker:** the main joke delivery. It is also the tutorial, with hints at
  the next step.

This is row 7 (`aktionen-and-megameat`) of the planned change sequence in section 8 of the concept
doc: "Campaigns, counter-events, news ticker with tutorial hints".

## What Changes

- **Awareness pool:** awareness is now also collected, not only a rate. Residents add their
  awareness per second to a pool of whole points. The pool is shown next to the rate. Passive
  conversion still uses the rate and does not use up the pool.
- **Aktionen panel:** it appears with the first Aktion's unlock. Each Aktion costs awareness from
  the pool, converts townspeople into customers at once, and then cools down. The amount converted
  shrinks as the town fills up, like passive conversion. The Act 1 Aktionen:
  - "Flyer am Wochenmarkt" (market flyers)
  - "Tag der offenen Hoftür" (open farm day)
  - "Virales Video: Schwein auf der Rutsche" (viral reel: pig on a slide). It needs at least one
    pig in the Lebenshof.
  - "Faktencheck" (fact check): converts no one, but ends MegaMeat's current counter-event.

  All costs, effects, cooldowns and unlocks are content data.
- **MegaMeat counter-events:** MegaMeat reacts to the player's campaigns. The first counter-event
  starts 60 s after the first Aktion. After each event ends, the next starts 5 minutes later. The
  events cycle through a fixed list:
  - "Echte Männer essen Fleisch" ad campaign: awareness counts half for 2 minutes
  - a MegaMeat-funded "study": passive conversion stops for 1 minute
  - MegaMeat books every billboard in town: Aktionen cost double for 90 s

  The active event shows as a banner in the Aktionen panel with its time left and the fact-check
  button. Only one event runs at a time. Events are deterministic (no randomness in `tick()`).
- **News ticker:** a line under the header that always shows one headline and changes every 15 s.
  There are three kinds:
  - satirical headlines, unlocked as the business grows
  - breaking news, shown at once when a counter-event starts
  - tutorial hints, which appear while their condition holds, e.g. "Bauer Heinz wonders whether a
    field would beat harvesting by hand…" while no soybean field is owned

  Hints take every other slot, so jokes still come through. Hint conditions are declarative
  content, not code.
- **Save format 6:** the awareness pool, Aktion cooldowns and use counts, and the counter-event
  state are saved. Older saves start with an empty pool and no events.

## Capabilities

### New Capabilities

- `aktionen`: the Aktionen panel and its unlocks, costs, cooldowns and instant conversion, and the
  fact check that ends a counter-event.
- `megameat-events`: when counter-events start, their order, effects and duration, the banner, and
  being ended early.
- `news-ticker`: the ticker line, its rotation, satirical headlines, breaking news and tutorial
  hints with their conditions.

### Modified Capabilities

- `awareness`: awareness production also fills a spendable pool, and a counter-event can halve
  awareness or pause passive conversion.

## Non-goals

- Upgrades such as "Instagram-Account" (Aktionen cheaper): `upgrades` (8).
- Fact cards shown in the ticker: `faktenbuch` (9) adds them as another headline kind.
- The lawsuit event and act story: `prestige-and-act-1` (10).
- Counter-events or ticker lines that react to bulk sales to MegaMeat. The counters exist, and a
  later change can use them.
- Events that take customers or animals away. Animals are never lost, and customers are only
  converted more slowly.
- A ticker history or log view.
- Aktionen in the scripted player of `balancing-dev-page`. Whichever change lands second decides
  whether the player uses them. That change's pacing charts still work without them.
- Pacing: every number is a starting value, tuned in `release-v1` (13).

## Impact

- New:
  - content: `src/game/content/aktionen.ts`, `src/game/content/megaMeatEvents.ts`,
    `src/game/content/headlines.ts`
  - systems: `src/game/systems/aktionen.ts`, `src/game/systems/villain.ts`,
    `src/game/systems/ticker.ts`
  - UI: `src/ui/AktionenPanel.svelte`, `src/ui/NewsTicker.svelte`
  - DE/EN texts for every Aktion, event and headline
- Changed:
  - `src/game/systems/awareness.ts`: the pool, and the event multipliers
  - `src/game/state.ts`, `src/game/tick.ts`
  - `src/game/save.ts`: format 6, migration 5 → 6
  - `src/ui/LebenshofPanel.svelte`: pool display
  - `src/App.svelte`: the ticker and the panel
