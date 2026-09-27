## ADDED Requirements

### Requirement: Sales figures
The sales panel SHALL show, per minute and in the selected language's number format:

- **Demand:** the orders all customers place per minute (customers × orders per customer per
  second × 60).
- **Sold:** for each product shown in the stock panel, the units sold to customers per minute.
- **Income:** the euros earned from customer sales per minute.

Sold and income SHALL be averaged over the last 60 seconds of game time. Sales by hand and by the
shop assistant SHALL count; bulk sales SHALL NOT. A product that is shown but sold nothing in the
window SHALL show 0. The figures SHALL NOT be saved: after loading a game or starting a new one,
sold and income SHALL show 0 until sales happen.

#### Scenario: Demand from customers
- **WHEN** there are 10 customers
- **THEN** the demand shows 30 orders per minute

#### Scenario: Cheap product not selling
- **WHEN** 10 customers order, the assistant is hired, Leverkas and Hafer-Cappuccino together are
  made faster than 0.5 per second, Tofu-Wurst is in stock, and 60 seconds of game time pass
- **THEN** Tofu-Wurst shows 0 sold per minute while the demand shows 30 per minute

#### Scenario: Steady selling
- **WHEN** the assistant sells 1 Leverkas every 4 seconds for 60 seconds of game time
- **THEN** Leverkas shows 15 sold per minute and income shows €375 per minute

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

### Requirement: Demand-limit hint
While the overproduction message is shown, the sales panel SHALL also show a plain hint that
customers are buying all they order, that cheaper products wait until there are more customers,
and that more customers come from awareness in the Lebenshof. The hint SHALL disappear together
with the overproduction message.

#### Scenario: Full storeroom
- **WHEN** 10 customers order 0.05 units per second each and there are 61 products in stock
- **THEN** the demand-limit hint is shown below the overproduction message

#### Scenario: Normal stock
- **WHEN** there are 60 products in stock or fewer under the same demand
- **THEN** no demand-limit hint is shown
