# Design

## Context

See proposal.md (Why) and the specs. Today `src/ui/game.svelte.ts` creates a fresh `GameState`
(`{ playTime }`) on every load, and `main.ts` drives `advance()` from the loop. `GameState` is
plain data by design, and later mechanics will add break_eternity `Decimal` fields. The browser
UI is verified by playing; pure logic is tested with Vitest. The only existing storage use is
`vegle.language`, wrapped in try/catch.

## Goals / Non-Goals

**Goals:**
- A save format that every later change extends by adding a field and, when needed, a migration
  step. No change to the save machinery itself.
- All save logic is pure and testable with a fake storage and a fake clock.
- No path where an existing save is silently destroyed.

**Non-Goals:**
- Offline progress, settings UI, reset button (see proposal Non-goals).
- Compression of save strings. They are tiny today; revisit if they exceed a few KB.

## Decisions

### Files

```
src/game/save.ts        pure codec: encodeSave / decodeSave, migrations, export string   (src/game)
src/game/state.ts       doc comment: playTime is total play time; no new fields          (src/game)
src/save/slots.ts       createSaveSlots(storage): load() / write(json), backup + pointer logic
src/save/autosave.ts    startAutosave({ save, schedule, onPageHide }): 30 s timer + page-hide
src/ui/game.svelte.ts   state comes from slots.load(); replaceState() for imports; save notices
src/ui/SavePanel.svelte export / import UI
src/ui/Notices.svelte   dismissible notices (backup restored, unreadable, too new, cannot save)
src/main.ts             starts autosave
```

No content entries are added. `src/game/` gains `save.ts`; `state.ts` changes only its comment.

### Save envelope and codec (`src/game/save.ts`)

```ts
interface SaveEnvelope { format: number; savedAt: number /* epoch ms */; state: unknown }
const CURRENT_FORMAT = 1
```

- `encodeSave(state, now)` → JSON string of the envelope. The state is converted field by field
  into plain JSON. Future `Decimal` fields are written as strings (`decimal.toString()`), which
  keeps full precision beyond 10^308, whereas JSON numbers would lose it.
- `decodeSave(json, migrations = MIGRATIONS)` →
  `{ ok: true, state, savedAt } | { ok: false, reason: 'invalid' | 'too-new' }`. It parses,
  checks the envelope, applies migrations `format → format + 1` until current, then validates and
  converts the state field by field (e.g. `playTime` must be a finite number ≥ 0). Invalid data
  never reaches the game.
- `MIGRATIONS: Record<number, (state: unknown) => unknown>`, keyed by the version being upgraded
  *from*. It is empty for format 1. `decodeSave` takes the table as a parameter so tests can prove
  step-by-step migration with synthetic formats. **Alternative rejected:** a schema library (zod
  etc.). Manual validation is a few lines per field and keeps the bundle small.
- **Export string:** `WURSTCASE1:` + base64 of the UTF-8 JSON. It's one line, safe to paste into
  chats, and the prefix makes wrong input recognizable. Import strips the prefix, decodes, then
  runs `decodeSave`.

### Slots with a "latest" pointer (`src/save/slots.ts`)

Keys: `vegle.save.0`, `vegle.save.1`, `vegle.save.latest`, `vegle.save.unreadable`.

- `write(json)` writes to the slot that is *not* the current latest, then updates
  `vegle.save.latest`. A crash between the two writes leaves the old pointer on the previous,
  intact save.
- `load()` reads the pointer slot first. If it's valid, it uses it. If not, it tries the other
  slot and reports `restoredFromBackup`. Without a pointer (e.g. hand-edited storage) it picks
  the valid slot with the newest `savedAt`. If both are unreadable, it copies the raw texts into
  `vegle.save.unreadable` (only if that key is empty, so the first failure is what's kept) and
  reports `unreadable`.
- **Too new:** if a slot decodes as `too-new`, `load()` reports it and the slots object refuses
  all further writes for this session, so a stale tab can never overwrite progress from a newer
  version.
- Storage is injected as `{ getItem, setItem }`. Every access is wrapped; any throw sets
  `storageAvailable = false`, and `write()` becomes a no-op that reports failure. The real
  `localStorage` accessor itself can throw, so it's also read inside try/catch.
- **Why a pointer instead of comparing `savedAt`:** the clock can jump back (spec: game-loop), and
  a corrupted slot has no readable timestamp. The pointer tells which slot was written last
  without either.

### Autosave (`src/save/autosave.ts`)

It saves every 30 s via the injected scheduler, plus on `visibilitychange` → hidden and on
`pagehide`. `pagehide` fires reliably on mobile and with bfcache, unlike `beforeunload`. Saving is
synchronous (`localStorage`), so it completes inside those events. Tests drive it with a manual
scheduler and a fake page-hide trigger.

### UI

- `SavePanel`: an "Export" button reveals a read-only text field with the save string and a
  "Copy" button (`navigator.clipboard`, with select-all as fallback). "Import" reveals a text
  field and a "Load" button. A valid string triggers `confirm()` ("replace current progress?"),
  then `replaceState()` and an immediate save. An invalid string shows an inline error. The
  native `confirm()` is accessible and needs no dialog component. A styled dialog can replace it
  with the settings screen.
- `Notices`: a small list above the game content, each notice dismissible. Texts come from i18n.

## Risks / Trade-offs

- [Two tabs of the game open at once overwrite each other's saves] → Accepted for v1; the newest
  write wins, same as most browser idle games. A later change can add a `storage` event check.
- [A future field is added without a migration] → The decode step validates every field. A save
  missing a new field fails validation in tests, so each new field comes with a migration
  (supply a default) and a test. Stated in the file header comment for later changes.
- [`confirm()` blocks the page briefly] → The game loop catches up with real elapsed time
  afterwards (game-loop spec), so no progress is lost.
- [Storage quota] → Saves are well under 1 KB today; the "cannot save" notice covers quota errors.
