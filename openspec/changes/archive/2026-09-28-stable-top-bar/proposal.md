# Proposal: stable-top-bar

## Why

The top bar flickers the same way the Verkauf tab did before `stable-sales-layout`. Money, income
and awareness use the regular number format, which drops trailing zeros, so a value switches
between forms like `€37` and `€37.5`, or `1.2K` and `1.23K`, several times a second. The stats sit
in a wrapping flex row that sizes each cell to its text. So every width change pushes the next
stat sideways, and at narrow widths a stat can wrap to the next line and back. The play time adds
a fourth changing figure that the player rarely needs while playing.

The concept doc did not plan this change in its section 8 sequence. It is a UI polish change that
follows `stable-sales-layout` and reuses its fixed-decimal form.

## What Changes

- **Fixed-decimal top-bar figures**: money, income per minute and awareness use the fixed-decimal
  form from `stable-sales-layout` (`€37.0` / `€37.5`, `1.20K` / `1.23K`), in tabular digits.
- **Fixed stat slots**: the stats become a grid of three slots of equal width (money, income,
  awareness). The slot widths come from the layout, not from the text, so a changing value only
  changes digits inside its own slot. The awareness slot is kept empty until the Lebenshof is
  unlocked, so money and income do not move when awareness appears.
- **Income unit moves to the label**: the label reads "Income / min" and the value only
  `+€37.5`, so the value is short enough for a slot at phone width.
- **Play time leaves the top bar** and moves into the Spielstand (save) section of the
  Einstellungen tab, next to export, import and new game.

## Non-goals

- The resource rail and the rail's Sell button. They also show changing figures, but they are left
  for a later change if they turn out to flicker too.
- Any change to what money, income or awareness mean, or to the play-time counting and saving.
- New art or motion for the top bar. The money flash and the floating sale amount stay as they are.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `game-screen`: the Top bar requirement drops play time and gains a stable-layout rule; the
  Settings tab requirement adds the play time to the save section.
- `game-loop`: the Play-time counter requirement says where the counter is shown (Einstellungen).
- `game-art`: the play-time illustration is shown on the Einstellungen tab instead of the top bar.

## Impact

- `src/ui/TopBar.svelte`: stats grid, fixed-decimal values, play time removed.
- `src/ui/SavePanel.svelte`: shows the play time with its hourglass art.
- `src/i18n/en.json`, `src/i18n/de.json`: `topbar.income` gains the unit, `topbar.incomeValue`
  loses it.
- No change to `src/game/`, `src/format/`, the save format or the game rules.
