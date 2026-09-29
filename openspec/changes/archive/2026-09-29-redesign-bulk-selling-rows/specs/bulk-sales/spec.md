# Spec Delta

## MODIFIED Requirements

### Requirement: Selling in bulk
The player SHALL be able to sell a resource to a buyer with one click. One share choice for the
whole bulk buyers panel SHALL decide how much of the current stock a sale takes: 10%, 50% or
100%. It SHALL start at 100% each time the game is loaded, SHALL stay while the player switches
tabs, and SHALL NOT be saved. A sale SHALL take as many whole lots as fit in the chosen share of
the stock (share × stock, rounded down to whole units and then to whole lots), leave the remainder
in stock, and add what the sale pays (for MegaMeat, at the flooded market) to both the money and
the total money earned. For every resource a buyer takes there SHALL be one sell button, and it
SHALL show how many units its sale at the chosen share takes and what it pays. A button SHALL be
unavailable while the chosen share of the stock is smaller than one lot. The shares SHALL be
content data.

#### Scenario: Whole lots only
- **WHEN** MegaMeat's soybean market is fresh at a full price of €3.15, the player has 47 soybeans,
  chooses 100% and sells soybeans to MegaMeat
- **THEN** 40 soybeans are sold, 7 remain, and money and total money earned grow by €121

#### Scenario: Less than one lot
- **WHEN** the player has 19 soybeans and MegaMeat's lot is 20
- **THEN** MegaMeat's soybean button is unavailable at every share and nothing changes

#### Scenario: Counts towards unlocks
- **WHEN** total money earned is €29,950 and the player sells 20 soybeans to MegaMeat for €61
- **THEN** the oat chain unlocks at its €30,000 threshold

#### Scenario: Half the stock
- **WHEN** MegaMeat's soybean market is fresh at a full price of €3.15, the player has 130
  soybeans, chooses 50% and sells soybeans to MegaMeat
- **THEN** 60 soybeans are sold (65 rounded down to whole lots), 70 remain, and money grows by €178

#### Scenario: A tenth
- **WHEN** the player has 500 soybeans, chooses 10% and sells soybeans to MegaMeat in lots of 20
- **THEN** 40 soybeans are sold and 460 remain

#### Scenario: Share smaller than a lot
- **WHEN** the player has 150 soybeans and MegaMeat's lot is 20
- **THEN** at 10% MegaMeat's soybean button is unavailable (15 is less than one lot), and at 50%
  and 100% it sells 60 and 140

#### Scenario: Buttons show their sale
- **WHEN** the player has 500 soybeans and MegaMeat's soybean market is fresh at a full price of
  €3.15
- **THEN** MegaMeat's soybean button reads 40 for €121 at 10%, 240 for €617 at 50%, and 500 for
  €1,091 at 100%, each paid along the flooded market as if it were the only sale

#### Scenario: Share starts at 100%
- **WHEN** the player chose 10%, then reloads the page
- **THEN** the share choice is 100%

#### Scenario: Share stays across tabs
- **WHEN** the player chooses 50%, opens the Produktion tab and returns to Verkauf
- **THEN** the share choice is still 50%

### Requirement: Price of feeding MegaMeat
Every sale to MegaMeat SHALL cost the player awareness and SHALL raise the MegaMeat scandal. The
awareness lost SHALL be 1 point per €10 the sale pays, rounded up, and awareness SHALL NOT drop
below 0. A sale SHALL NOT take customers away: the customers the player has stay, and the price
is paid in the customers campaigns win from then on (the MegaMeat scandal requirement). Sales to
the biogas plant SHALL cost nothing. Before the sale, each of MegaMeat's sell buttons SHALL show
what its sale at the chosen share would cost in awareness and how many percent less campaigns
would win and customers would order right after it (one figure: the scandal factor's loss,
rounded up to a whole percent). The euros per awareness point SHALL be content data.

#### Scenario: Feed sale
- **WHEN** the player has 1,000 customers and 100 awareness, the scandal is 0, and sells 200
  soybeans to MegaMeat at a fresh market for €529
- **THEN** money grows by €529, customers stay 1,000, awareness drops to 47, and the scandal is
  €529 (campaigns win 5.02% fewer customers and customers order 5.02% less; the button rounds
  that up to 6%)

#### Scenario: Small sale still costs
- **WHEN** the player has 1,000 customers and sells 20 soybeans to MegaMeat for €61
- **THEN** customers stay 1,000, awareness drops by 7 and the scandal rises by €61

#### Scenario: Starting neighbours stay
- **WHEN** the player has 12 customers and 5 awareness and sells to MegaMeat for €1,000
- **THEN** customers stay 12 and awareness drops to 0

#### Scenario: No customer income yet
- **WHEN** the player has 30 customers and a customer income of 0, and sells to MegaMeat
- **THEN** customers stay 30

#### Scenario: Biogas costs nothing
- **WHEN** the player sells Tofu-Wurst to the biogas plant for €60
- **THEN** customers, awareness and the scandal are unchanged

#### Scenario: Cost shown before the sale
- **WHEN** the scandal is 0 and a MegaMeat sale at the chosen share would pay €60
- **THEN** its button shows that it costs 6 awareness and 1% of campaigns and orders

#### Scenario: Cost per share
- **WHEN** the player has 500 soybeans, the scandal is 0, and MegaMeat's soybean market is fresh
  at a full price of €3.15
- **THEN** MegaMeat's soybean button shows a cost of 13 awareness and 2% at 10% (€121), and 110
  awareness and 10% at 100% (€1,091)
