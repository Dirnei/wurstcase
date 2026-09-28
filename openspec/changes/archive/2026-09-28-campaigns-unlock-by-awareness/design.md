# Design: campaigns-unlock-by-awareness

## Context

See proposal.md - Why. What we found in the code (with `campaign-growth` applied):

- `isAktionOffered` checks `totalEarned ≥ unlockAt`, an optional species and, for the fact check,
  `megaMeat.started > 0`. `isAktionenUnlocked` is "any Aktion offered"; it never re-locks because
  earnings only grow.
- `firstAktionAt()` feeds `tabUnlockAt('aktionen')`, which `TabNav.svelte` turns into
  `t('locked.at', { amount: euros(at) })` for every locked tab.
- The pool (`state.awareness`) grows in `gatherAwareness` and shrinks in `runAktion` and in
  `bulkSell` (MegaMeat's feed cost). So "pool ≥ 50" alone can become false again.
- Save format after `campaign-growth` is 11.

**src/game/ files and content entries:**
- `content/aktionen.ts`: `AKTIONEN_UNLOCK_AWARENESS = 50`; the flyer's `unlockAt` becomes 0.
- `systems/aktionen.ts`: `unlockAktionen(state)`, changed `isAktionOffered`,
  `isAktionenUnlocked`; `firstAktionAt` removed.
- `state.ts` (`aktionen.unlocked: boolean`), `save.ts`, `tick.ts`.

## Goals / Non-Goals

**Goals:**
- The tab unlocks exactly once, at the first moment the pool holds 50, and never locks again.

**Non-Goals:**
- A general "unlock by any resource" system for all tabs.

## Decisions

### 1. A saved flag, set once

`state.aktionen.unlocked` starts `false`. `unlockAktionen(state)` sets it when `state.awareness ≥
AKTIONEN_UNLOCK_AWARENESS`, and is called in `tick()` right after `gatherAwareness`, the only place
the pool grows. `isAktionenUnlocked` returns the flag; `isAktionOffered` requires the flag and then
the Aktion's own conditions.

- *Alternative: derive from lifetime awareness gathered.* Rejected: needs a new ever-growing
  counter just to answer one yes/no question.
- *Alternative: `pool ≥ 50 || any run`.* Rejected: a MegaMeat bulk sale can drop the pool before the
  first run and lock the tab again, which the Locked tabs requirement forbids.

### 2. Hints that name money or awareness

`tabUnlockAt(tab)` becomes `tabUnlockHint(tab): { kind: 'earned'; amount: number } | { kind:
'awareness'; amount: number } | null`. `TabNav` picks `locked.at` (money, `euros`) or the new
`locked.atAwareness` ("unlocks at {amount} awareness" / "ab {amount} Aufmerksamkeit", `amount`).

### 3. Save format 12

Migration 11 → 12 adds `aktionen.unlocked`: `true` when any `aktionen.runs` value is above 0, the
pool is at least 50, or `totalEarned` is at least €100 (the flyers' threshold under
`campaign-growth`); otherwise `false`. `readState` requires a boolean.

## Risks / Trade-offs

- [A player who sells to MegaMeat early never reaches 50 in the pool] → Chickens make 1 awareness
  per second each, and MegaMeat's feed cost only applies to sales; the first chicken fills 50 in
  under a minute unless the player keeps feeding MegaMeat. Accepted; the hint says what to do.
- [The hint "50 awareness" before the Lebenshof exists] → The awareness stat appears in the top bar
  once the Lebenshof unlocks (€100), which is before anyone can collect awareness, so the hint's
  word matches what the player sees.
- [Depends on `campaign-growth`] → Implement and archive after it; the aktionen delta is written
  against its version of the requirements.

## Migration Plan

Save format 11 → 12 as above. Rollback would reject format-12 saves as too new; acceptable before
release.
