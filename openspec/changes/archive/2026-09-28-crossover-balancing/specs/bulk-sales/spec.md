# Spec Delta

## MODIFIED Requirements

### Requirement: Bulk buyers
The game SHALL offer two bulk buyers: MegaMeat Corp (animal feed) and a biogas plant. Both SHALL
buy raw ingredients (soybeans, wheat, oats) and intermediates (tofu, seitan, oat drink). The
biogas plant SHALL also buy finished products (Tofu-Wurst, Leverkas, Hafer-Cappuccino); MegaMeat
SHALL NOT. Each buyer SHALL buy a resource only in fixed lots, each lot a fixed
number of units for a whole number of euros. A buyer SHALL be offered for a resource only while
that resource is shown in the stock panel.

What a buyer pays per unit SHALL depend on how far along its chain the resource is, measured
against its vegan value (what one unit earns once it is turned into its chain's product and
sold to a customer):

| Buyer | Raw ingredients | Intermediates | Finished products |
|---|---|---|---|
| MegaMeat Corp | 35–45% (about 40%) | 60–70% (about 67%) | does not buy |
| Biogas plant | 25–35% (about 30%) | 45–55% (about 50%) | 45–55% (about 50%) |

The biogas plant SHALL pay less per unit than MegaMeat for every resource both buy. For each
buyer, selling an intermediate SHALL pay more than selling the raw ingredients it is made from,
and selling a finished product SHALL pay at least as much as selling the intermediate it is made
from. Both buyers SHALL pay less than the vegan value.

#### Scenario: Lots
- **WHEN** MegaMeat buys soybeans in lots of 5 for €2 and the biogas plant in lots of 10 for €3
- **THEN** MegaMeat pays €0.40 per soybean (40%) and the biogas plant €0.30 (30%)

#### Scenario: Worth less than vegan food
- **WHEN** 3 soybeans become 1 tofu and 1 Tofu-Wurst sells to a customer for €3
- **THEN** each buyer pays less than €1 per soybean

#### Scenario: Processing pays
- **WHEN** MegaMeat pays €0.40 per soybean and €2 per tofu
- **THEN** pressing 3 soybeans into 1 tofu before selling earns €2 instead of €1.20

#### Scenario: Products only at the biogas plant
- **WHEN** the player has Tofu-Wurst in stock
- **THEN** the biogas plant offers to buy it for less than a customer pays, and MegaMeat does not

### Requirement: Selling in bulk
The player SHALL be able to sell a resource to a buyer with one click. The sale SHALL take as many
whole lots as the stock allows, leave the remainder in stock, and add the lots' price to both the
money and the total money earned. Each button SHALL show how many units the sale takes and what it
pays. A sale SHALL be unavailable while the stock is smaller than one lot.

#### Scenario: Whole lots only
- **WHEN** MegaMeat buys soybeans in lots of 5 for €2, the player has 37 soybeans and sells them
  to MegaMeat
- **THEN** 35 soybeans are sold, 2 remain, and money and total money earned grow by €14

#### Scenario: Less than one lot
- **WHEN** the player has 4 soybeans and MegaMeat's lot is 5
- **THEN** selling soybeans to MegaMeat is unavailable and nothing changes

#### Scenario: Counts towards unlocks
- **WHEN** total money earned is €29,995 and the player sells 15 soybeans to MegaMeat for €6
- **THEN** the oat chain unlocks at its €30,000 threshold

## ADDED Requirements

### Requirement: Price of feeding MegaMeat
Every sale to MegaMeat SHALL cost the player customers and awareness: 1 customer per €100 the sale
pays and 1 awareness point per €10, each rounded up to whole numbers. Customers SHALL NOT drop
below the 10 starting neighbours, and awareness SHALL NOT drop below 0. Sales to the biogas plant
SHALL cost nothing. Before the sale, MegaMeat's sell button SHALL show what the sale would cost in
customers and awareness. The euros per customer and per awareness point SHALL be content data.

#### Scenario: Feed sale
- **WHEN** the player has 50 customers and 100 awareness and sells tofu to MegaMeat for €250
- **THEN** money grows by €250, customers drop to 47 and awareness to 75

#### Scenario: Small sale still costs
- **WHEN** the player has 50 customers and sells soybeans to MegaMeat for €14
- **THEN** customers drop to 49 and awareness by 2

#### Scenario: Starting neighbours stay
- **WHEN** the player has 12 customers and 5 awareness and sells to MegaMeat for €1,000
- **THEN** customers drop to 10 and awareness to 0

#### Scenario: Biogas costs nothing
- **WHEN** the player sells Tofu-Wurst to the biogas plant for €60
- **THEN** customers and awareness are unchanged

#### Scenario: Cost shown before the sale
- **WHEN** a MegaMeat sale would pay €250
- **THEN** its button shows that it costs 3 customers and 25 awareness
