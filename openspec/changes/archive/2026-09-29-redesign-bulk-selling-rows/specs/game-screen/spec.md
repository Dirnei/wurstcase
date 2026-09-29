# Spec Delta

## MODIFIED Requirements

### Requirement: Sales tab
The Verkauf tab SHALL show the sales figures, the sold amount per product, the shop assistant
offer, the overproduction and demand-limit messages, and the bulk buyers.

The tab SHALL keep a stable layout while the game runs. A value that changes SHALL NOT move,
resize or re-wrap any other element on the tab:

- Customers, open orders, demand and income SHALL each be shown as a cell in a grid, with a label
  and a right-aligned value in digits of equal width.
- The sold amounts SHALL be shown as a table with the product (icon and name) in one column and
  the amount per minute right-aligned in another. The table SHALL keep its column widths while
  the amounts change.
- The bulk buyers SHALL be shown as one table of resource rows with one column per buyer. Above
  the rows SHALL be the share choice (10%, 50%, 100%), with the current choice marked, and a
  header that shows each buyer's illustration, name and line once, above its column.
- Each row SHALL show the resource (icon, name and current stock) and, per buyer, one cell. A
  buyer that takes the resource SHALL show in its cell the current price per unit and one sell
  button for the chosen share with the units and price of that sale in digits of equal width. For
  MegaMeat the cell SHALL also show the sale's cost in awareness and scandal, on a line that is
  reserved whether or not the sale costs anything. For a flooded market the cell SHALL show the
  market level line that the flooded market requires. An unavailable button SHALL keep its size
  and show a dash instead of the units and price. A buyer that does not take the resource SHALL
  show a dash in its cell; MegaMeat's dash for a finished product SHALL carry the note that it
  takes no vegan products, as text for assistive technology and as a tooltip.
- In each row where both buyers take the resource, the cell of the buyer that pays more per unit
  right now SHALL be marked as paying more. When both pay the same, neither SHALL be marked.
- The rows SHALL be grouped by production chain, in the chain order of the Produktion tab (soy,
  oats, wheat), with a thin separator carrying the chain's name in the selected language, and
  SHALL list each chain's resources in production order: raw ingredient, intermediate, product. A
  resource SHALL have a row while it is shown in the game and at least one buyer takes it, whether
  or not there is stock to sell; a group SHALL be shown only while at least one of its rows is.
- On a viewport narrower than 768 px, each row SHALL show the resource and stock on one line and
  the buyer cells side by side below it, and the share choice SHALL stay visible while the player
  scrolls through the rows.
- Demand, income and the sold amounts SHALL use the fixed-decimal form of the number format. The
  stock and the units on the bulk sell buttons SHALL use the whole-count form, and prices the
  fixed-decimal form.

#### Scenario: Sales content
- **WHEN** the player opens the Verkauf tab while the bulk buyers are unlocked
- **THEN** it shows customers, open orders, demand, income, the sold amounts, the share choice and
  both bulk buyers

#### Scenario: Income gains a decimal
- **WHEN** the income changes from €37.0 per minute to €37.5 per minute
- **THEN** no other figure, label or button on the Verkauf tab moves or changes size

#### Scenario: Sold amount changes
- **WHEN** Tofu-Wurst's sold amount changes from 3.0 to 12.5 per minute
- **THEN** the product names and the other sold amounts stay where they are

#### Scenario: Bulk price grows
- **WHEN** 100% is chosen and the soybean stock grows so MegaMeat's soybean button changes from
  €61.0 to €121
- **THEN** every button keeps its size and no row moves

#### Scenario: Share becomes available
- **WHEN** 10% is chosen and the soybean stock grows from 190 to 200, so MegaMeat's soybean button
  turns from a dash into 20 soybeans for €61.0
- **THEN** no button, line or row on the Verkauf tab moves or changes size

#### Scenario: Switching the share
- **WHEN** the player has 500 soybeans and switches the share choice from 100% to 10%
- **THEN** every sell button shows the sale at 10% and no row moves or changes size

#### Scenario: Compare in one row
- **WHEN** the soy chain is unlocked, the player has 340 tofu, and the biogas plant pays more per
  unit of tofu than MegaMeat right now
- **THEN** the tofu row shows both buyers' price per unit and sell button side by side, and the
  biogas plant's cell is marked as paying more

#### Scenario: MegaMeat takes no products
- **WHEN** the player has Tofu-Wurst
- **THEN** the Tofu-Wurst row shows the biogas plant's price and button, a dash in MegaMeat's
  column, and no "pays more" mark

#### Scenario: Empty stock keeps its row
- **WHEN** the player sells all tofu at 100%
- **THEN** the tofu row stays where it was with both buttons unavailable, and no other row moves

#### Scenario: Far fewer buttons
- **WHEN** the soy, oat and wheat chains are unlocked and all their goods are shown
- **THEN** the bulk buyers show one sell button per buyer and resource it takes, three share
  choices, and no other sell buttons

#### Scenario: Phone width
- **WHEN** the viewport is 375 px wide and the player opens the Verkauf tab
- **THEN** the figure grid, the sold table, the share choice and both buyer cells of each row fit
  without horizontal scrolling, each button at least 44 px tall

#### Scenario: Share choice on a phone
- **WHEN** the viewport is 375 px wide and the player scrolls down to the wheat rows
- **THEN** the share choice is still visible

#### Scenario: Buyers line up
- **WHEN** MegaMeat's line in the header wraps onto two lines
- **THEN** both buyers' cells for soybeans, tofu and every other resource still sit in the same
  row, side by side

#### Scenario: Offers grouped by chain
- **WHEN** the soy and oat chains are unlocked and the player has some of every soy and oat good
- **THEN** the Soy separator comes before the Oats separator, and the soy rows are soybeans, tofu
  and Tofu-Wurst in that order

#### Scenario: Groups line up
- **WHEN** the Soy and Oats groups are shown
- **THEN** each chain separator spans every buyer column, and the Tofu-Wurst row shows the biogas
  plant's offer next to MegaMeat's dash with the note that it takes no vegan products

#### Scenario: Locked chain has no group
- **WHEN** only the soy chain is unlocked
- **THEN** there is no Oats or Wheat separator and no oat or wheat row
