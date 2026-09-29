## MODIFIED Requirements

### Requirement: Open orders
Customers SHALL place orders at a rate that grows more slowly the more customers there are: up to
the demand knee (200 customers), each customer SHALL place 0.05 orders per second; beyond the
knee, every doubling of the customer count SHALL add as many orders per second as the knee's
customers place (10 per second), so the rate is 0.05 × 200 × (1 + log₂(customers ÷ 200)). That
rate SHALL then be multiplied by the MegaMeat scandal factor (K ÷ (K + scandal), as the
bulk-sales MegaMeat scandal requirement defines it) and by the orders upgrade factor: the curve
is applied to the customer count first, the factors to its result. Orders SHALL be counted in
whole orders only. Open orders SHALL be capped at 30 seconds of orders from all customers at
that final rate, so the cap follows the scandal and the upgrades; while the cap is reached, no
further orders build up. The sales panel SHALL show the open orders and the cap.

#### Scenario: Orders build up
- **WHEN** 10 customers each order 0.05 units per second and 10 seconds pass without selling
- **THEN** there are 5 open orders

#### Scenario: Cap
- **WHEN** 10 customers each order 0.05 units per second and 5 minutes pass without selling
- **THEN** there are 15 open orders, not more

#### Scenario: Whole orders only
- **WHEN** 10 customers each order 0.05 units per second and 1 second passes
- **THEN** there are 0 open orders

#### Scenario: Scandal halves orders
- **WHEN** the MegaMeat scandal is €10,000 (K = €10,000), there are 1,600 customers and 10 seconds
  pass without selling
- **THEN** there are 200 open orders (the curve's 40 per second, halved) and the cap is 600

#### Scenario: At the knee
- **WHEN** there are 200 customers and 10 seconds pass without selling
- **THEN** there are 100 open orders

#### Scenario: Twice the knee
- **WHEN** there are 400 customers, no scandal, and 10 seconds pass without selling
- **THEN** there are 200 open orders, as at the flat rate (one doubling adds exactly the knee's
  orders), and the cap is 600

#### Scenario: Four times the knee
- **WHEN** there are 800 customers, no scandal, and 10 seconds pass without selling
- **THEN** there are 300 open orders, not the flat rate's 400, and the cap is 900

#### Scenario: Each doubling adds the same
- **WHEN** there are 6,400 customers and 10 seconds pass without selling
- **THEN** there are 600 open orders (60 per second: 10 for the first 200 and 10 for each of the
  five doublings)

#### Scenario: The whole town
- **WHEN** all 20,000 townspeople are customers
- **THEN** they place about 76 orders per second

#### Scenario: Loyalty card beyond the knee
- **WHEN** there are 800 customers and the loyalty card (orders ×1.5) is owned
- **THEN** they place 45 orders per second (30 × 1.5)

#### Scenario: Scandal and loyalty card together
- **WHEN** there are 6,400 customers, the loyalty card is owned and the scandal is €10,000
- **THEN** they place 45 orders per second (60 × 1.5 × ½) and the cap is 1,350

### Requirement: Sales figures
The sales panel SHALL show, per minute and in the selected language's number format:

- **Demand:** the orders all customers place per minute (the customers' order rate per second,
  following the demand knee and doubling rule, × the MegaMeat scandal factor × the orders
  upgrade factor × 60).
- **Sold:** for each product shown in the stock panel, the units sold to customers per minute.
- **Income:** the euros earned from customer sales per minute.

Sold and income SHALL be averaged over the last 60 seconds of game time. While less than 60
seconds of game time have passed since loading a game or starting a new one, they SHALL be
averaged over the game time that has passed, counted as at least 10 seconds. Sales by hand and by
the shop assistant SHALL count; bulk sales SHALL NOT. A product that is shown but sold nothing in
the window SHALL show 0. The figures SHALL NOT be saved: after loading a game or starting a new
one, sold and income SHALL show 0 until sales happen.

#### Scenario: Demand from customers
- **WHEN** there are 10 customers
- **THEN** the demand shows 30 orders per minute

#### Scenario: Demand under a scandal
- **WHEN** there are 1,600 customers and the MegaMeat scandal is €10,000
- **THEN** the demand shows 1,200 orders per minute, not 2,400

#### Scenario: Demand beyond the knee
- **WHEN** there are 800 customers and no scandal
- **THEN** the demand shows 1,800 orders per minute, not the flat rate's 2,400

#### Scenario: Cheap product not selling
- **WHEN** 10 customers order, the assistant is hired, Leverkas and Hafer-Cappuccino together are
  made faster than 0.5 per second, Tofu-Wurst is in stock, and 60 seconds of game time pass
- **THEN** Tofu-Wurst shows 0 sold per minute while the demand shows 30 per minute

#### Scenario: Steady selling
- **WHEN** the assistant sells 1 Leverkas every 4 seconds for 60 seconds of game time
- **THEN** Leverkas shows 15 sold per minute and income shows €375 per minute

#### Scenario: Steady selling right after loading
- **WHEN** a game is loaded and the assistant sells 1 Leverkas every 2 seconds for the first 20
  seconds of game time
- **THEN** Leverkas shows 30 sold per minute and income shows €750 per minute

#### Scenario: Single sale right after loading
- **WHEN** a game is loaded and the player sells 3 Tofu-Wurst by hand within the first second of
  game time
- **THEN** Tofu-Wurst shows 18 sold per minute and income €54 per minute, not 180 per minute

#### Scenario: Hand sales count
- **WHEN** the player sells 3 Tofu-Wurst by hand and 60 seconds of game time pass without other
  sales, measured just before those 60 seconds are over
- **THEN** Tofu-Wurst shows 3 sold per minute and income €9 per minute

#### Scenario: Old sales drop out
- **WHEN** 3 Tofu-Wurst were sold and then a little over 60 seconds of game time (61 s) pass
  without sales
- **THEN** Tofu-Wurst shows 0 sold per minute and income €0 per minute

#### Scenario: Bulk sales do not count
- **WHEN** the player sells 100 soybeans to MegaMeat
- **THEN** the income per minute does not change

#### Scenario: Locked product
- **WHEN** the café bar is locked and nobody has made Hafer-Cappuccino
- **THEN** no sold figure for Hafer-Cappuccino is shown

#### Scenario: After loading
- **WHEN** the player loads a saved game
- **THEN** every sold figure and the income show 0 until something is sold
