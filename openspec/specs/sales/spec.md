# sales Specification

## Purpose

Turns the products the player makes into money, which pays for buildings and later for rescuing
animals.

## Requirements

### Requirement: Sell everything
The player SHALL be able to sell the entire stock of every product at once. Each product SHALL
earn its base price per unit. The earnings SHALL be added to both the money and the total money
earned. While no product is in stock, selling SHALL be unavailable.

#### Scenario: Selling a mixed stock
- **WHEN** Tofu-Wurst sells for €3 and Leverkas for €25, the player has 4 Tofu-Wurst and 2
  Leverkas, and clicks "sell everything"
- **THEN** money has grown by €62, total money earned has grown by €62, and both stocks are 0

#### Scenario: Nothing to sell
- **WHEN** every product stock is 0
- **THEN** the sell button is disabled
