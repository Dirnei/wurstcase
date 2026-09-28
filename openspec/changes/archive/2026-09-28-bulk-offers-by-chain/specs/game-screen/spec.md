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
- Each bulk offer SHALL be a row that fills the width of its buyer card: the resource (icon and
  name) and the lot size on one line, for MegaMeat the market level line that the flooded market
  requires, and below them three sell buttons (10%, 50%, 100%) in three
  equal columns. Each button SHALL show its share, and the units and price of its sale in digits
  of equal width; for MegaMeat it SHALL also show its cost in customers and awareness, on a line
  that is reserved whether or not the sale costs anything. An unavailable button SHALL keep its
  size and show a dash instead of the units and price.
- In each buyer card, the offers SHALL be grouped by production chain, in the chain order of the
  Produktion tab (soy, oats, wheat). Each group SHALL be labelled with the chain's name in the
  selected language and SHALL list its offers in production order: raw ingredient, intermediate,
  product. A group SHALL be shown in a card only while at least one of its offers is shown there.
- The buyer cards SHALL share one row grid: side by side, their headers take the same height, each
  chain's label sits at the same height in both cards, and the same resource sits at the same
  height in every card that buys it. Where one card has an offer that the other buyer does not
  take, the other card SHALL keep that row, and MegaMeat's card SHALL show a short note there that
  it takes no vegan products.
- Demand, income and the sold amounts SHALL use the fixed-decimal form of the number format. The
  units on the bulk sell buttons SHALL use the whole-count form, and their prices the
  fixed-decimal form.

#### Scenario: Sales content
- **WHEN** the player opens the Verkauf tab while the bulk buyers are unlocked
- **THEN** it shows customers, open orders, demand, income, the sold amounts and both bulk buyers

#### Scenario: Income gains a decimal
- **WHEN** the income changes from €37.0 per minute to €37.5 per minute
- **THEN** no other figure, label or button on the Verkauf tab moves or changes size

#### Scenario: Sold amount changes
- **WHEN** Tofu-Wurst's sold amount changes from 3.0 to 12.5 per minute
- **THEN** the product names and the other sold amounts stay where they are

#### Scenario: Bulk price grows
- **WHEN** the soybean stock grows so the MegaMeat 100% button's price changes from €61.0 to €121
- **THEN** all three buttons keep their size and the lot line above them does not move

#### Scenario: Share becomes available
- **WHEN** the soybean stock grows from 190 to 200, so the 10% button at MegaMeat turns from a dash
  into 20 soybeans for €61.0
- **THEN** no button, line or card on the Verkauf tab moves or changes size

#### Scenario: Buyers line up
- **WHEN** both buyer cards sit side by side and MegaMeat's lot line wraps onto two lines
- **THEN** soybeans, tofu and every other resource both buyers take still start at the same height
  in both cards

#### Scenario: Phone width
- **WHEN** the viewport is 375 px wide and the player opens the Verkauf tab
- **THEN** the figure grid, the sold table and all three bulk buttons of each offer fit without
  horizontal scrolling, each at least 44 px tall

#### Scenario: Offers grouped by chain
- **WHEN** the soy and oat chains are unlocked and the player has some of every soy and oat good
- **THEN** each buyer card shows a Soy group before an Oats group; the biogas plant's Soy group
  lists soybeans, tofu and Tofu-Wurst in that order, and MegaMeat's lists soybeans and tofu

#### Scenario: Groups line up
- **WHEN** both buyer cards sit side by side with the Soy and Oats groups shown
- **THEN** the Oats label and oats start at the same height in both cards, and MegaMeat's card
  shows the note that it takes no vegan products in the row where the biogas plant offers
  Tofu-Wurst

#### Scenario: Locked chain has no group
- **WHEN** only the soy chain is unlocked
- **THEN** neither card shows an Oats or Wheat group
