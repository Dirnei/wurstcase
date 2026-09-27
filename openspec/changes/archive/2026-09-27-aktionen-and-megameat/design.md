# Design

## Context

See proposal.md (Why) and the four delta specs. The current code:

- **Awareness:** `src/game/systems/awareness.ts` computes `awarenessRate` from the residents.
  `convert()` turns the rate into whole customers, with `conversionProgress` carrying the
  fraction, capped at `POPULATION` (20,000).
- **Tick order:** `produce → convert → takeOrders`.
- **Save:** at format 5. Each new field needs a migration, a read check and a write.
- **Unlocks:** follow `totalEarned`. Species and shelters are content with plain lookup helpers.
- **Player actions:** plain functions called through `act()` in `src/ui/game.svelte.ts`.
- **i18n:** flat DE/EN dictionaries with identical keys.
- **Section 9 of the concept doc:** it names ticker headlines and Aktion names as author content.
  The texts below are drafts for the author to revise.

## Goals / Non-Goals

**Goals:**
- `tick()` stays deterministic: counter-events follow a timer and a fixed order. The only
  randomness, picking satirical headlines, lives in the ticker selection. The UI calls it with
  an injectable `random`.
- Aktionen, events, headlines and hint conditions are content. A later act adds its own with data
  only.
- One effect model: an event is a set of factors (`awareness`, `conversion`, `aktionCost`) that the
  systems read through one helper.

**Non-Goals:**
- Splitting a tick exactly at an event's end. At 0.1 s ticks the error is negligible.
  `offline-progress` (11) steps its simulation in chunks anyway.
- Saving the ticker's position. After a reload it starts with a fresh headline.

## Decisions

### Files

```
src/game/content/aktionen.ts        AKTIONEN: id, unlockAt, requiresSpecies?, cost, customers?, cooldown, endsEvent?
src/game/content/megaMeatEvents.ts  MEGAMEAT_EVENTS (in order): id, duration, factors;
                                    FIRST_EVENT_DELAY = 60, EVENT_PAUSE = 300
src/game/content/headlines.ts       SATIRE: id, unlockAt;  HINTS: id, when: HintCondition[];
                                    breaking-news keys per event; HEADLINE_SECONDS = 15
src/game/systems/aktionen.ts        isAktionenUnlocked, isAktionOffered, aktionCost, canRun (+reason),
                                    runAktion, coolDown(state, s)
src/game/systems/villain.ts         activeFactors, advanceVillain(state, s), onFirstAktion, endEvent
src/game/systems/ticker.ts          hintApplies, nextHeadline(state, memory, random)
src/game/systems/awareness.ts       awarenessRate × factor; gatherAwareness (pool); convert × factor
src/game/state.ts                   + awareness, awarenessProgress, aktionen, megaMeat
src/game/tick.ts                    produce → advanceVillain → gatherAwareness → convert → takeOrders → coolDown
src/game/save.ts                    format 6, migration 5 → 6
src/ui/AktionenPanel.svelte         pool, event banner, Aktion buttons
src/ui/NewsTicker.svelte            headline line, 15 s rotation, breaking news
src/ui/LebenshofPanel.svelte        rate marked "reduced" under an event
src/App.svelte                      ticker under the header (game route only); panel after the Lebenshof
```

### State

```ts
awareness: Decimal            // pool, whole points
awarenessProgress: number     // fraction towards the next point
aktionen: {
  cooldown: Record<AktionId, number>   // seconds left, 0 = ready
  runs: Record<AktionId, number>       // times run in this game
}
megaMeat: {
  active: { event: MegaMeatEventId; remaining: number } | null
  nextIn: number | null       // seconds until the next event starts; null = none scheduled
  nextIndex: number           // position in MEGAMEAT_EVENTS
  started: number             // events started so far; the ticker watches it for breaking news
}
```

`started > 0` unlocks the fact check. `runs` drives the "flyers never run" hint and the first-event
trigger.

### Counter-event timing

`advanceVillain(state, s)` works in two cases:

- **Event active:** `remaining -= s`. At `≤ 0` the event ends: `active = null`,
  `nextIn = EVENT_PAUSE`.
- **Next event scheduled** (`nextIn !== null`): `nextIn -= s`. At `≤ 0` the next event starts:
  - `active = { event: MEGAMEAT_EVENTS[nextIndex], remaining: duration }`
  - `nextIndex = (nextIndex + 1) % length`
  - `started++`
  - `nextIn = null`

`runAktion` calls `onFirstAktion`. If this is the first Aktion ever run, nothing is active and
nothing is scheduled, it sets `nextIn = FIRST_EVENT_DELAY`. The fact check calls `endEvent`,
which works the same as running out.

`activeFactors(state)` returns `{ awareness, conversion, aktionCost }`. All three are 1 when no
event is active. The events set:

- ad campaign: awareness ×0.5
- study: conversion ×0
- billboards: Aktion cost ×2

Alternative: random events on a timer. Rejected because randomness in `tick()` would break
the "one simulation path" determinism that offline progress and the balancing page depend on.

### Awareness pool

`gatherAwareness(state, s)`:

- `gained = awarenessRate(state) × factors.awareness × s + awarenessProgress`
- the pool gets `floor(gained)`, and the fraction is kept

`convert` uses the same factored rate × `factors.conversion`. With `conversion = 0` it returns
early and keeps `conversionProgress`. The displayed rate uses the factored value, with a "reduced"
mark when `factors.awareness < 1`.

### Aktionen

Content, starting values (the table in the `aktionen` spec):

```ts
{ id: 'flyer',       unlockAt: 1_000,  cost: 100,   customers: 20,    cooldown: 30 }
{ id: 'openFarmDay', unlockAt: 5_000,  cost: 1_500, customers: 300,   cooldown: 120 }
{ id: 'viralReel',   unlockAt: 15_000, requiresSpecies: 'pig', cost: 6_000, customers: 1_500, cooldown: 300 }
{ id: 'factCheck',   unlockAt: 0, endsEvent: true, cost: 300, cooldown: 60 }  // offered once megaMeat.started > 0
```

`aktionCost = ceil(cost × factors.aktionCost)`. `canRun` returns `'ok' | 'cooldown' | 'awareness'
| 'noEvent'`. A campaign converts `min(floor(customers × (1 − c/P)), P − c)`. Aktionen never
touch money.

Rough pacing:

- **First flyers at €1,000 earned:** the player is around 10–15 min in with a few chickens,
  about 5 awareness per second. That gives 100 points in about 20 s, and each run brings about
  20 customers.
- **First counter-event:** 60 s later, in the 10–20 min window of concept doc section 5.

### Ticker

`nextHeadline(state, memory, random)` returns `{ key, memory }`:

- **Slot parity:** odd slots are hint slots. If any hint applies, it shows the first applicable
  hint that is not `memory.lastHint`, or `memory.lastHint` if it is the only one.
- **Other slots:** a satirical headline with `unlockAt ≤ totalEarned` and not among the last 3
  shown. The pick is uniform with `random()`. If fewer than 4 are unlocked, it only avoids the
  last one.

`NewsTicker.svelte` keeps the memory and calls `nextHeadline` every 15 s with a `setInterval`
(real time, like the UI). It also watches `readGame(s => s.megaMeat.started)`. When the count
goes up, it shows that event's breaking-news key and restarts the 15 s timer. The line is a
`<p aria-live="polite">`. A new headline fades in; there is no marquee.

Hint conditions are declarative, and all clauses of a hint must hold:

```ts
type HintClause =
  | { owned: BuildingId; is: 'none' | 'some' }
  | { unlocked: BuildingId }
  | { assistantOffered: true }
  | { lebenshofEmpty: true }
  | { aktionNeverRun: AktionId }
  | { canFactCheck: true }
```

`hintApplies` evaluates them with the existing system helpers.

### Draft texts (the author revises them)

| Key | DE | EN |
|---|---|---|
| hint.soybeanField | Bauer Heinz fragt sich, ob ein eigenes Sojafeld schneller wäre als Ernten von Hand. | Farmer Heinz wonders whether a soybean field would beat harvesting by hand. |
| hint.tofuPress | Gerücht im Dorf: Mit einer Presse wird Tofu angeblich viel schneller fertig. | Village rumour: tofu is said to get done much faster with a press. |
| hint.assistant | Stellenmarkt: Verkaufstalent sucht Imbiss. Bezahlung in Tofu-Wurst möglich. | Jobs: sales talent seeks snack bar. Happy to be paid in Tofu-Wurst. |
| hint.lebenshof | Leerer Stall am Ortsrand wartet auf erste Bewohner. MegaMeat hätte da welche. | Empty stable at the edge of town awaits its first residents. MegaMeat has some. |
| hint.wheat | Weizen im Trend: Seitan-Fans stehen Schlange. | Wheat is trending: seitan fans are queueing. |
| hint.flyer | Wochenmarkt-Chef: „Wer Flyer verteilt, dem glauben die Leute." | Market boss: "People believe whoever hands out flyers." |
| hint.factCheck | Leserbrief: „Kann das mal jemand nachprüfen?" | Letter to the editor: "Could someone check that, please?" |
| event.adCampaign | MegaMeat-Plakate überall: „Echte Männer essen Fleisch". Echte Männer zucken mit den Schultern. | MegaMeat posters everywhere: "Real men eat meat". Real men shrug. |
| event.study | Neue Studie (finanziert von MegaMeat): Tofu macht müde. Die Stadt gähnt. | New study (funded by MegaMeat): tofu makes you tired. The town yawns. |
| event.billboards | MegaMeat mietet alle Plakatwände der Stadt. Auch die am Klo vom Bahnhof. | MegaMeat books every billboard in town. Even the one in the station toilet. |

The satirical pool starts with 12 headlines, for example:

- "MegaMeat-Sprecher: ‚Unsere Hühner lieben enge Räume'" / "MegaMeat spokesperson: 'Our chickens
  love tight spaces'"
- "Metzgerinnung fordert Namensschutz für das Wort ‚Wurst'" / "Butchers' guild demands the word
  'sausage' be protected"
- "Rentnerin schwört: Leverkas schmeckt wie früher, nur ohne schlechtes Gewissen" / "Pensioner
  swears Leverkas tastes like it used to, minus the guilt"

The other nine are written in implementation with thresholds spread over €0–€20,000. They are
jokes, not facts; real facts wait for the Faktenbuch (9).

### UI

`AktionenPanel` sits after the Lebenshof. It has:

- a header with "📣 Pool: 1,234"
- the event banner when active, with name, description, effect and seconds left, in a warning
  colour
- one button per offered Aktion: name, cost, "+~N customers" (the current conversion estimate)
  or "ends MegaMeat's campaign", and the cooldown or lacking-awareness label

The Lebenshof line shows "📣 12/s (reduced by MegaMeat)" under the ad campaign.

### Save format 6

Bump to 6. Migration 5 → 6 adds:

- `awareness: "0"`, `awarenessProgress: 0`
- `aktionen: { cooldown: {}, runs: {} }`
- `megaMeat: { active: null, nextIn: null, nextIndex: 0, started: 0 }`

`readState` checks:

- the pool is a whole amount, and every number is finite and non-negative
- cooldowns and runs are defaulted to 0 per known Aktion; unknown ids are ignored
- `nextIndex` is less than the number of events, otherwise it is reset to 0
- an active event with an unknown id is dropped, and the next event is scheduled after
  `EVENT_PAUSE` so MegaMeat still comes back
- `started` and `runs` must be safe integers

## Risks / Trade-offs

- [Counter-events every 5 minutes could feel nagging] → Their effects are mild and short, and the
  fact check ends them. The pause is content and gets tuned in 13.
- [The Aktionen make passive conversion feel irrelevant, or the other way round] → A flyer run
  (about 20 customers every 30 s) is several minutes of early passive conversion. That rewards
  clicking without making idling useless. The balancing page can plot both once it lands.
- [A ticker hint can point at something the player cannot afford yet] → The hint conditions are
  about ownership, not affordability, and the text teases rather than orders.
- [An event ending mid-tick applies its factor to the whole tick] → At most 0.1 s off in live
  play. Offline (11) uses chunked ticks.

## Migration Plan

Format 5 saves load through migration 5 → 6 with an empty pool, no cooldowns and no MegaMeat
activity. The first counter-event then waits for the player's first Aktion, as in a new game.
