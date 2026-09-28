# Design: stock-by-chain

## Context

See proposal.md - Why. What we found in the code:

- `ResourceRail.svelte` builds its stock list from `RESOURCES` (raw, intermediates, products),
  filtered by `isResourceShown`, and renders one flat `<dl>` of `.row` grids
  (`1fr auto 14px`: name, amount, trend).
- Every building has a `chain` and an `output`, and `BUILDINGS` is in production order (fields,
  processors, kitchens). So each chain's resources in production order follow from the building
  list; no new content data is needed.
- `CHAINS` (`soy`, `oat`, `wheat`) is the order the Produktion tab uses, and `chain.<id>` keys
  already name them in DE and EN.
- `RESOURCE_KINDS` and the `stock.raw` / `stock.intermediate` / `stock.product` keys are left
  over from the old stock panel and are no longer used anywhere.

**src/game/ files and content entries:** `src/game/content/buildings.ts` gains one derived
constant, `CHAIN_RESOURCES`. No content entries are added or changed. `RESOURCE_KINDS` in
`src/game/content/resources.ts` is removed.

## Goals / Non-Goals

**Goals:**
- One source for "which resources belong to which chain", derived from the buildings so a new
  chain or building needs no second list.

**Non-Goals:**
- A `chain` field on resources. It would repeat what the buildings already say.

## Decisions

### 1. Derive `CHAIN_RESOURCES` from the buildings

`CHAIN_RESOURCES: readonly { chain: ChainId; resources: readonly ResourceId[] }[]` is built from
`CHAINS`, and for each chain the `output` of its buildings in `BUILDINGS` order. It lives next to
`BUILDINGS` in `buildings.ts`, which already owns `ChainId` and `CHAINS`. Tests check that every
resource appears in exactly one chain and that soy is `soybeans, tofu, tofuWurst`.

- *Alternative: a hand-written map in `resources.ts`.* Rejected: it could drift from the
  buildings, and `resources.ts` would have to import from `buildings.ts`, which already imports
  from it.

### 2. One `<dl>` per group inside the stock section

The rail maps `CHAIN_RESOURCES` to groups of shown items and drops empty groups. Each group is a
`<div class="group" role="group" aria-labelledby=…>` with an `h3` holding the chain name and its
own `<dl>` of the existing rows. All rows keep the same `1fr auto 14px` grid, so amounts and marks
still line up across groups. Groups are spaced with a small gap; the heading uses the muted small
caps style of the top-bar labels.

- *Alternative: one `<dl>` with heading rows inside.* Rejected: a `dl` may only hold `dt`/`dd`
  groups, and headings inside it read badly in screen readers.

### 3. Tablet: line instead of heading

At 768–1023 px the rail hides names with the visually-hidden pattern. The group headings get the
same treatment, and each group after the first gets a `border-top` so the groups stay apart.

### 4. Remove the unused kind grouping

`RESOURCE_KINDS` and the `stock.raw`, `stock.intermediate`, `stock.product` keys are removed from
code and both dictionaries, so there is one grouping, not two.

## Risks / Trade-offs

- [Three headings make the rail taller at 1280 × 720] → Headings are one short line at 0.7rem;
  the rail already scrolls on its own. Check in the browser that the Sell button stays visible at
  1280 × 720 with all chains unlocked.
- [A future resource used by two chains] → Out of scope (proposal Non-goals). The test that each
  resource appears in exactly one chain fails loudly when that happens.

## Migration Plan

No save or data migration. Roll back by reverting the commit.
