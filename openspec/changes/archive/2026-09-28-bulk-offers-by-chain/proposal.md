# Proposal: bulk-offers-by-chain

## Why

The bulk buyers list their offers by kind: all raw ingredients, then all intermediates, then (at
the biogas plant) all products. Soybeans, tofu and Tofu-Wurst are therefore spread over the list,
mixed in with the oat and wheat offers. The rail's stock is already grouped by chain
(`stock-by-chain`), so the player thinks in chains: "what do I do with my soy surplus?". The bulk
offers should use the same groups and order.

The concept doc did not plan this change in its section 8 sequence. It is UI polish on the Verkauf
tab, following `stock-by-chain` and `bulk-sell-shares`.

## What Changes

- In each buyer card, the offers are grouped by chain (Soy, Oats, Wheat), in the chain order of the
  Produktion tab and the rail, each group labelled with the chain's name.
- Inside a group, offers follow production order: raw ingredient, intermediate, product.
- A group is shown in a card only while at least one of its offers is shown there; which offers are
  shown does not change.
- Side by side, the two cards keep sharing rows: the same chain heading and the same resource sit
  at the same height in both cards. Where the biogas plant offers a product that MegaMeat does not
  buy, MegaMeat's card shows a short muted note in that row ("MegaMeat nimmt keine veganen
  Produkte" / "MegaMeat takes no vegan products") so the gap reads as intended.

## Non-goals

- Changing prices, shares, the flooded market or any sale rule.
- Collapsing groups.
- Grouping the sold-amounts table on the Verkauf tab (it lists only products already).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `game-screen`: the Sales tab requirement groups the bulk offers by chain and keeps the two cards
  aligned per group.

## Impact

- `src/ui/BulkBuyersPanel.svelte`: offers built from `CHAIN_RESOURCES`, group headings, shared row
  count per group, MegaMeat's product-row note.
- `src/i18n/en.json`, `de.json`: `bulk.noProducts`.
- No change to `src/game/`, saves or balance.
