# Spec Delta

## ADDED Requirements

### Requirement: Customer income
The game SHALL keep the customer income: the euros per second customers pay for the products they
buy, smoothed over about 5 minutes of game time, so that it follows lasting changes but not a
single sale. Bulk sales SHALL NOT count towards it. It SHALL start at 0 in a new game, be saved and
restored, and a save from before this change SHALL load with it at 0.

#### Scenario: Steady sales
- **WHEN** customers pay a steady €10 per second for 30 minutes of game time
- **THEN** the customer income is €10 per second, within 1%

#### Scenario: Bulk sales do not count
- **WHEN** the player sells to the biogas plant for €500 and customers buy nothing
- **THEN** the customer income does not rise

#### Scenario: Older save
- **WHEN** a save from before this change is loaded
- **THEN** the customer income is 0 and everything else is unchanged

## MODIFIED Requirements

### Requirement: Bulk buyers
The game SHALL offer two bulk buyers: MegaMeat Corp (animal feed) and a biogas plant. Both SHALL
buy raw ingredients (soybeans, wheat, oats) and intermediates (tofu, seitan, oat drink). The
biogas plant SHALL also buy finished products (Tofu-Wurst, Leverkas, Hafer-Cappuccino); MegaMeat
SHALL NOT. Each buyer SHALL buy a resource only in fixed lots, each lot a fixed
number of units for a whole number of euros. A buyer SHALL be offered for a resource only while
that resource is shown in the stock panel.

What a buyer pays per unit SHALL be measured against the resource's market value. A product's
market value SHALL be its base price. An earlier stage's market value SHALL be the market value of
what one unit of it becomes in the next stage of its chain (by the base recipe), divided by one
plus the step markup, the value one processing step adds (starting value 25%, within 10–25%). The
step markup SHALL be content data.

| Buyer | Share of the market value |
|---|---|
| MegaMeat Corp | 85–95% (about 90%) for everything it buys |
| Biogas plant | 62–72% (about 67%) for everything it buys |

The biogas plant SHALL pay less per unit than MegaMeat for every resource both buy. For each
buyer, selling a resource SHALL pay less than turning it into the next stage and selling that to
the same buyer. Both buyers SHALL pay less than the market value.

#### Scenario: Lots
- **WHEN** MegaMeat buys soybeans in lots of 7 for €4 and the biogas plant in lots of 7 for €3
- **THEN** MegaMeat pays about €0.57 per soybean (89% of the €0.64 market value) and the biogas
  plant about €0.43 (67%)

#### Scenario: Worth less than vegan food
- **WHEN** 3 soybeans become 1 tofu and 1 Tofu-Wurst sells to a customer for €3
- **THEN** tofu has a market value of €2.40, soybeans of €0.64, and each buyer pays less than
  that per soybean

#### Scenario: Processing pays
- **WHEN** MegaMeat buys soybeans in lots of 7 for €4 and tofu in lots of 6 for €13
- **THEN** pressing 3 soybeans into 1 tofu before selling earns about €2.17 instead of about €1.71

#### Scenario: Products only at the biogas plant
- **WHEN** the player has Tofu-Wurst in stock
- **THEN** the biogas plant offers to buy it for less than a customer pays, and MegaMeat does not

### Requirement: Selling in bulk
The player SHALL be able to sell a resource to a buyer with one click. The sale SHALL take as many
whole lots as the stock allows, leave the remainder in stock, and add the lots' price to both the
money and the total money earned. Each button SHALL show how many units the sale takes and what it
pays. A sale SHALL be unavailable while the stock is smaller than one lot.

#### Scenario: Whole lots only
- **WHEN** MegaMeat buys soybeans in lots of 7 for €4, the player has 37 soybeans and sells them
  to MegaMeat
- **THEN** 35 soybeans are sold, 2 remain, and money and total money earned grow by €20

#### Scenario: Less than one lot
- **WHEN** the player has 6 soybeans and MegaMeat's lot is 7
- **THEN** selling soybeans to MegaMeat is unavailable and nothing changes

#### Scenario: Counts towards unlocks
- **WHEN** total money earned is €29,995 and the player sells 14 soybeans to MegaMeat for €8
- **THEN** the oat chain unlocks at its €30,000 threshold

### Requirement: Price of feeding MegaMeat
Every sale to MegaMeat SHALL cost the player customers and awareness. The customers lost SHALL be
the current customers times the sale's euros divided by what the customers spend in the feed
horizon (the customer income per second times the horizon, starting value 10 minutes), rounded
up to a whole number. While the customer income is 0, a sale SHALL cost every customer above the
starting neighbours. The awareness lost SHALL be 1 point per €10 the sale pays, rounded up.
Customers SHALL NOT drop below the 10 starting neighbours, and awareness SHALL NOT drop below 0.
Sales to the biogas plant SHALL cost nothing. Before the sale, MegaMeat's sell button SHALL show
what the sale would cost in customers and awareness. The horizon and the euros per awareness point
SHALL be content data.

#### Scenario: Feed sale
- **WHEN** the player has 1,000 customers, a customer income of €10 per second and 100 awareness,
  and sells 1,050 soybeans to MegaMeat for €600
- **THEN** money grows by €600, customers drop to 900 (a tenth: the sale equals one minute of
  customer spending) and awareness to 40

#### Scenario: Small sale still costs
- **WHEN** the player has 1,000 customers and a customer income of €10 per second, and sells
  7 soybeans to MegaMeat for €4
- **THEN** customers drop to 999 and awareness by 1

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
- **THEN** its button shows that it costs 100 customers and 60 awareness
