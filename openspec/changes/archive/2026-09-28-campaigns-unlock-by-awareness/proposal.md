# Proposal: campaigns-unlock-by-awareness

## Why

The Aktionen (campaign) tab unlocks by money earned: at €1,000 today, and at €100 once
`campaign-growth` lands. Money says nothing about whether campaigns make sense yet: at €100 the
player may not have rescued a single animal, so the tab opens onto campaigns nobody can pay for.
Campaigns are paid in awareness, so the tab should open when the player has collected enough
awareness to do something with it: 50 points.

The concept doc did not plan this change in its section 8 sequence. It adjusts the unlock from
`aktionen-and-megameat` (row 7) on top of `campaign-growth`, which it must follow.

## What Changes

- The Aktionen tab unlocks the first time the awareness pool reaches 50 points, and stays unlocked
  for the rest of the game, even when the pool drops again (campaigns, MegaMeat bulk sales).
- The flyers are offered from that moment instead of from a money threshold. The open farm day and
  the viral video keep their money (and pig) conditions, and in addition need the tab to be
  unlocked. The fact check is unchanged (it needs MegaMeat's first counter-event, which follows
  the first Aktion).
- The locked tab's hint names the awareness instead of money: "unlocks at 50 awareness" /
  "ab 50 Aufmerksamkeit". The other locked tabs keep their money hints.
- The save remembers that the tab was unlocked (new save format with a migration). Games that
  already had the tab unlocked keep it.

## Non-goals

- Changing when the Lebenshof unlocks or how fast animals produce awareness.
- Unlocking other tabs by anything other than money.
- Changing campaign costs, reach or scaling (`campaign-growth`).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `aktionen`: the Aktionen panel unlock and hint; the Act 1 Aktionen unlock conditions; the saved
  unlock flag.
- `game-screen`: the Locked tabs requirement lets a hint name awareness instead of money.

## Impact

- `src/game/content/aktionen.ts`: `AKTIONEN_UNLOCK_AWARENESS = 50`; flyer without a money
  threshold.
- `src/game/systems/aktionen.ts`: the unlock flag, set when the pool first reaches 50;
  `isAktionOffered` and `isAktionenUnlocked` use it; `firstAktionAt` replaced.
- `src/game/tick.ts`: calls the unlock check after awareness is gathered.
- `src/game/state.ts`, `src/game/save.ts`: `aktionen.unlocked` flag, format bump + migration.
- `src/ui/tabs.ts`, `src/ui/TabNav.svelte`: hints that name either money or awareness.
- `src/i18n/en.json`, `de.json`: `locked.atAwareness`.
- Tests: `aktionen.test.ts`, `tabs.test.ts`, `save.test.ts`, `tick.test.ts`.
- Implement after `campaign-growth` is archived; it edits the same files and requirements.
