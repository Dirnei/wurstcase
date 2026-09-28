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
- Each bulk offer SHALL be a sell button that fills the width of its buyer card. The resource
  SHALL be on the left, and the units and price right-aligned on the right. The lot size and any
  cost of the sale SHALL be shown on a separate line below the button.
- The buyer cards SHALL share one row grid: side by side, their headers take the same height and
  the same resource sits at the same height in every card that buys it.
- Demand, income, the sold amounts, and the units and price on the bulk sell buttons SHALL use
  the fixed-decimal form of the number format.

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
- **WHEN** the soybean stock grows so the MegaMeat button's price changes from €9.0 to €14.0
- **THEN** the button keeps its size and the lot line below it does not move

#### Scenario: Buyers line up
- **WHEN** both buyer cards sit side by side and MegaMeat's lot line wraps onto two lines
- **THEN** soybeans, tofu and every other resource both buyers take still start at the same height
  in both cards

#### Scenario: Phone width
- **WHEN** the viewport is 375 px wide and the player opens the Verkauf tab
- **THEN** the figure grid, the sold table and the bulk buttons fit without horizontal scrolling
