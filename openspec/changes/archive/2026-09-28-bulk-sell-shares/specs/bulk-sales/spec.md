## MODIFIED Requirements

### Requirement: Selling in bulk
The player SHALL be able to sell a resource to a buyer with one click, choosing one of three
shares of the current stock: 10%, 50% or 100%. A sale SHALL take as many whole lots as fit in the
chosen share of the stock (share × stock, rounded down to whole units and then to whole lots),
leave the remainder in stock, and add what the sale pays (for MegaMeat, at the flooded market) to
both the money and the total money earned. Each of the three buttons SHALL show how many units its
sale takes and what it pays. A share SHALL be unavailable while it is smaller than one lot. The
shares SHALL be content data.

#### Scenario: Whole lots only
- **WHEN** MegaMeat's soybean market is fresh at a full price of €3.15, the player has 47 soybeans
  and sells 100% to MegaMeat
- **THEN** 40 soybeans are sold, 7 remain, and money and total money earned grow by €121

#### Scenario: Less than one lot
- **WHEN** the player has 19 soybeans and MegaMeat's lot is 20
- **THEN** all three soybean buttons at MegaMeat are unavailable and nothing changes

#### Scenario: Counts towards unlocks
- **WHEN** total money earned is €29,950 and the player sells 20 soybeans to MegaMeat for €61
- **THEN** the oat chain unlocks at its €30,000 threshold

#### Scenario: Half the stock
- **WHEN** MegaMeat's soybean market is fresh at a full price of €3.15, the player has 130
  soybeans and sells 50%
- **THEN** 60 soybeans are sold (65 rounded down to whole lots), 70 remain, and money grows by €178

#### Scenario: A tenth
- **WHEN** the player has 500 soybeans and sells 10% to MegaMeat in lots of 20
- **THEN** 40 soybeans are sold and 460 remain

#### Scenario: Share smaller than a lot
- **WHEN** the player has 150 soybeans and MegaMeat's lot is 20
- **THEN** the 10% button is unavailable (15 is less than one lot), and 50% and 100% sell 60 and 140

#### Scenario: Buttons show their sale
- **WHEN** the player has 500 soybeans and MegaMeat's soybean market is fresh at a full price of
  €3.15
- **THEN** the buttons read 10% with 40 for €121, 50% with 240 for €617, and 100% with 500 for
  €1,091, each paid along the flooded market as if it were the only sale

### Requirement: Price of feeding MegaMeat
Every sale to MegaMeat SHALL cost the player customers and awareness. The customers lost SHALL be
the current customers times the sale's euros divided by what the customers spend in the feed
horizon (the customer income per second times the horizon, 8 minutes), rounded
up to a whole number. While the customer income is 0, a sale SHALL cost every customer above the
starting neighbours. The awareness lost SHALL be 1 point per €10 the sale pays, rounded up.
Customers SHALL NOT drop below the 10 starting neighbours, and awareness SHALL NOT drop below 0.
Sales to the biogas plant SHALL cost nothing. Before the sale, each of MegaMeat's three sell
buttons SHALL show what its own sale would cost in customers and awareness. The horizon and the
euros per awareness point SHALL be content data.

#### Scenario: Feed sale
- **WHEN** the player has 1,000 customers, a customer income of €10 per second and 100 awareness,
  and sells 200 soybeans to MegaMeat at a fresh market for €529
- **THEN** money grows by €529, customers drop to 889 (the sale is about 11% of eight minutes of
  customer spending) and awareness to 47

#### Scenario: Small sale still costs
- **WHEN** the player has 1,000 customers and a customer income of €10 per second, and sells
  20 soybeans to MegaMeat for €61
- **THEN** customers drop to 987 and awareness by 7

#### Scenario: Starting neighbours stay
- **WHEN** the player has 12 customers and 5 awareness and sells to MegaMeat for €1,000
- **THEN** customers drop to 10 and awareness to 0

#### Scenario: No customer income yet
- **WHEN** the player has 30 customers and a customer income of 0, and sells to MegaMeat
- **THEN** customers drop to 10

#### Scenario: Biogas costs nothing
- **WHEN** the player sells Tofu-Wurst to the biogas plant for €60
- **THEN** customers and awareness are unchanged

#### Scenario: Cost shown before the sale
- **WHEN** the player has 1,000 customers and a customer income of €10 per second, and a MegaMeat
  sale would pay €600
- **THEN** its button shows that it costs 125 customers and 60 awareness

#### Scenario: Cost per share
- **WHEN** the player has 1,000 customers, a customer income of €10 per second and 500 soybeans,
  and MegaMeat's soybean market is fresh at a full price of €3.15
- **THEN** the 10% button (€121) shows a cost of 26 customers and 13 awareness, and the 100%
  button (€1,091) 228 customers and 110 awareness
