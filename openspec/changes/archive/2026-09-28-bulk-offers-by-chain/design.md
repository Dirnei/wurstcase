# Design: bulk-offers-by-chain

## Context

See proposal.md - Why. What we found in the code:

- `BulkBuyersPanel.svelte` builds each buyer's offers from `RESOURCES` (raw, intermediates,
  products), filtered by `hasLot` and `isResourceShown`, into one `<ul>`. The cards are grid items
  of `.buyers`; each spans `offerRows + 1` rows (`offerRows` = the longest offer list) with
  `grid-template-rows: subgrid`, so row n is the same height in both cards. That only lines up the
  same resource because both lists use the same order and the biogas plant's extra products come
  last.
- `CHAIN_RESOURCES` (from `stock-by-chain`) gives each chain's `[raw, intermediate, product]` in
  `CHAINS` order; the rail and the Produktion tab use it, and `chain.<id>` keys name the chains.
- On phones the cards stack and each keeps its own rows.

**src/game/ files and content entries:** none are added or changed.

## Goals / Non-Goals

**Goals:**
- Same resource, same row, in both cards, with chain groups in between.

**Non-Goals:**
- A shared "grouped resource list" component for the rail and the bulk panel; the markup differs
  too much (rows vs. offer blocks).

## Decisions

### 1. Rows are planned across both buyers, per chain

The panel first computes, per chain, the shown resources across all buyers (in production order).
A chain with none is dropped. Each remaining chain contributes one heading row plus one row per
resource. Every card then renders exactly those rows: its own offer where it buys the resource, and
a placeholder where it does not. The card spans `1 + total rows` of the subgrid, so row n means the
same thing in both cards by construction, not by relying on list order.

- *Alternative: per-card groups and a separate row count per chain.* Rejected: the card would need
  to know the other card's lists anyway to stay aligned.

### 2. MegaMeat's placeholder is a note, not a blank

The only resources one buyer takes and the other does not are the products, which only the biogas
plant buys. MegaMeat's placeholder in those rows is a muted, italic single line: "MegaMeat nimmt
keine veganen Produkte" / "MegaMeat takes no vegan products" (`bulk.noProducts`). A satirical beat
rather than an unexplained gap. A generic empty placeholder remains for any other future mismatch.

On phones the cards stack and do not share rows, so the placeholder row shrinks to its note line
and wastes no space.

### 3. Group heading

Each group starts with an `h4` chain name styled like the rail's group labels (small, muted,
uppercase), with a thin top border from the second group on. The row is the same height in both
cards because both render the same heading text.

## Risks / Trade-offs

- [The biogas card gets one extra heading row per chain, making the Verkauf tab taller] → Three short
  rows at most; the tab content already scrolls. Checked at 1280 × 720.
- [MegaMeat's note repeats once per chain] → One short line per group, and it only shows while the
  biogas plant offers that product. Accepted.

## Migration Plan

No data migration. Roll back by reverting the commit.
