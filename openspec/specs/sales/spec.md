# sales Specification

## Purpose

Turns the products the player makes into money, which pays for buildings and later for rescuing
animals.

## Requirements

### Requirement: Customers
The game SHALL track the number of customers as a whole number. A new game SHALL start with 10
customers (the curious neighbours). The number of customers SHALL be shown in the sales panel.

#### Scenario: New game
- **WHEN** a new game starts
- **THEN** there are 10 customers

### Requirement: Open orders
Each customer SHALL place orders at a fixed rate per second, and orders SHALL be counted in whole
orders only. Open orders SHALL be capped at 30 seconds of orders from all customers; while the cap
is reached, no further orders build up. The sales panel SHALL show the open orders and the cap.

#### Scenario: Orders build up
- **WHEN** 10 customers each order 0.05 units per second and 10 seconds pass without selling
- **THEN** there are 5 open orders

#### Scenario: Cap
- **WHEN** 10 customers each order 0.05 units per second and 5 minutes pass without selling
- **THEN** there are 15 open orders, not more

#### Scenario: Whole orders only
- **WHEN** 10 customers each order 0.05 units per second and 1 second passes
- **THEN** there are 0 open orders

### Requirement: Selling by hand
The player SHALL be able to sell with one click. A sale SHALL fill as many open orders as there
are products in stock, one unit per order, and SHALL take the most expensive products first. Each
unit SHALL earn its product's base price, added to both the money and the total money earned.
Filled orders SHALL be removed. The sell button SHALL show what the sale would earn, and SHALL be
unavailable while there are no open orders or no products in stock.

#### Scenario: Most expensive first
- **WHEN** there are 5 open orders, 10 Tofu-Wurst at €3 and 2 Leverkas at €25, and the player sells
- **THEN** 2 Leverkas and 3 Tofu-Wurst are sold, money grows by €59, 7 Tofu-Wurst remain, and
  there are no open orders

#### Scenario: Less stock than orders
- **WHEN** there are 8 open orders and 3 Tofu-Wurst in stock, and the player sells
- **THEN** 3 Tofu-Wurst are sold for €9 and 5 open orders remain

#### Scenario: Nothing to sell
- **WHEN** there are open orders but no products in stock, or products but no open orders
- **THEN** the sell button is disabled

### Requirement: Automatic selling
The player SHALL be able to buy a one-time shop assistant once the total money earned reaches its
unlock threshold (€50) and they can pay its price (€150). After that, open orders SHALL be filled
automatically, in the same way as a sale by hand, every time the game advances. The purchase
SHALL be permanent for this game; the manual sell button SHALL no longer be shown.

#### Scenario: Unlock
- **WHEN** the total money earned is below €50
- **THEN** the shop assistant is not offered

#### Scenario: Buying the assistant
- **WHEN** the total money earned is at least €50, the player has €160 and buys the assistant
- **THEN** money is €10 and the sell button is replaced by a note that the assistant is selling

#### Scenario: Selling on its own
- **WHEN** the assistant is hired, there are 2 open orders and 1 Leverkas and 5 Tofu-Wurst in stock,
  and the game advances
- **THEN** 1 Leverkas and 1 Tofu-Wurst are sold and there are no open orders

### Requirement: Overproduction message
While the products in stock exceed 2 minutes of orders from all customers, the sales panel SHALL
show a joke message about the full storeroom. The message SHALL disappear once stock falls back
below that amount.

#### Scenario: Full storeroom
- **WHEN** 10 customers order 0.05 units per second each and there are 61 products in stock
- **THEN** the overproduction message is shown

#### Scenario: Normal stock
- **WHEN** there are 60 products in stock or fewer under the same demand
- **THEN** no overproduction message is shown

### Requirement: Sales progress is saved
Customers, open orders, progress towards the next order and whether the assistant is hired SHALL
be part of the save. A save from before this change SHALL load with 10 customers, no open orders
and no assistant, and keep everything else.

#### Scenario: Reload
- **WHEN** the player has 12 open orders and the assistant, and reloads the page
- **THEN** there are still 12 open orders and the assistant keeps selling

#### Scenario: Older save
- **WHEN** a save from before this change with 3 tofu presses is loaded
- **THEN** the game continues with 3 tofu presses, 10 customers, no open orders and no assistant

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
