# Proposal

## Why

The bulk buyers panel is organised by buyer: two cards, each listing every resource with three
sell buttons (10 %, 50 %, 100 %). With all chains unlocked that is up to 54 buttons. Playtesting
shows three problems: too much on screen at once, comparing the two buyers for the same resource
means looking across two cards, and selling takes a lot of scrolling, especially on a phone. The
question a player actually has is "where do I sell this resource, and how much?", and the panel
should answer it in one row.

This is a UI rework of the bulk buyers from the sales and customers work (concept doc section 8,
row 5 `sales-and-customers`, extended by later balance changes). It does not match a planned row
of its own.

## What Changes

- **One share choice for the whole panel.** A single 10 % / 50 % / 100 % toggle replaces the three
  buttons per offer. It starts at 100 % on each page load and is not saved.
- **One row per resource instead of one card per buyer.** Each row shows the resource (icon, name,
  stock) and one cell per buyer with its price per unit and one sell button for the chosen share,
  showing the units and the price of that sale.
- **Buyers named once.** A header row shows each buyer's illustration, name and line above its
  column.
- **"Pays more" mark.** In each row, the buyer that currently pays more per unit is marked.
  MegaMeat's awareness and scandal cost stays shown under its button, so the mark never hides the
  moral price.
- **Flood meter in the cell.** The level, meter and recovery time of a flooded market move into
  that buyer's cell as one compact line.
- **"No products" as a dash.** Where MegaMeat takes nothing (finished products), its cell shows a
  dash with the note as its label.
- **Stable rows.** Rows stay in chain order with thin chain separators. A resource without enough
  stock keeps its row with disabled buttons, so the list never jumps.
- **Phone layout.** On narrow screens each row stacks: name and stock above, the two buyer buttons
  side by side below. The share toggle stays visible while scrolling the panel.
- No change to lots, prices, floods, the scandal, the sale rules or the save.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `bulk-sales`: "Selling in bulk" and "Price of feeding MegaMeat" describe one share choice and one
  sell button per buyer and resource instead of three buttons; the sale rules themselves are
  unchanged.
- `game-screen`: the "Sales tab" requirement's bulk layout changes from side-by-side buyer cards
  with three buttons per offer to resource rows with one cell per buyer, a shared share toggle and
  the phone layout.

## Impact

- UI: `src/ui/BulkBuyersPanel.svelte` is rewritten; it may be split into a row component. The
  share toggle's state lives in the UI only.
- i18n: new and changed `bulk.*` keys in `src/i18n/de.json` and `src/i18n/en.json`.
- Game logic: none. `src/game/` is not changed; the panel keeps using the existing `bulkSales`
  functions (`bulkSaleUnits`, `bulkSaleValue`, `bulkSaleCost`, `canBulkSell`, `unitPrice`,
  `bestBuyer`, `marketLevel`, `timeToRecover`).
- Save format: unchanged, no migration.

## Non-goals

- Changing lots, prices, flood or scandal balance (the Tofu-Wurst market stays as it is).
- Hiding resources without stock (rejected: rows would appear and disappear while processors draw
  on the stock).
- Remembering the share choice across page loads or in the save.
- Selling one resource to both buyers in one action, or any automatic selling.
- Reworking the sales figures, the sold table or the shop assistant offer on the same tab.
