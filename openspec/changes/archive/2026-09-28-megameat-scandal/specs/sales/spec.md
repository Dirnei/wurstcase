## MODIFIED Requirements

### Requirement: Open orders
Each customer SHALL place orders at a fixed rate per second, multiplied by the MegaMeat scandal
factor (K ÷ (K + scandal), as the bulk-sales MegaMeat scandal requirement defines it), and orders
SHALL be counted in whole orders only. Open orders SHALL be capped at 30 seconds of orders from
all customers; while the cap is reached, no further orders build up. The sales panel SHALL show
the open orders and the cap.

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
- **WHEN** the MegaMeat scandal is €10,000 (K = €10,000), there are 1,000 customers and 10 seconds
  pass without selling
- **THEN** there are 250 open orders and the cap is 750

### Requirement: Sales figures
The sales panel SHALL show, per minute and in the selected language's number format:

- **Demand:** the orders all customers place per minute (customers × orders per customer per
  second × the MegaMeat scandal factor × 60).
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
- **WHEN** there are 1,000 customers and the MegaMeat scandal is €10,000
- **THEN** the demand shows 1,500 orders per minute, not 3,000

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

