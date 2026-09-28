# bulk-sales Specification

## Purpose

Gives surplus production an outlet when customers cannot take more: MegaMeat Corp buys raw
ingredients and intermediates as animal feed, and a biogas plant buys them, and unsold finished
products too, for even less without feeding the industry. Both pay far less than customers do for vegan food.

## Requirements

### Requirement: Bulk buyers
The game SHALL offer two bulk buyers: MegaMeat Corp (animal feed) and a biogas plant. Both SHALL
buy raw ingredients (soybeans, wheat, oats) and intermediates (tofu, seitan, oat drink). The
biogas plant SHALL also buy finished products (Tofu-Wurst, Leverkas, Hafer-Cappuccino); MegaMeat
SHALL NOT. Each buyer SHALL buy a resource only in fixed lots of a fixed number of units, and every
sale SHALL pay a whole number of euros. A buyer SHALL be offered for a resource only while that
resource is shown in the stock panel.

MegaMeat's full price SHALL be tied to the finished product of the resource's chain, at that
product's current price including upgrades:

| Resource | MegaMeat's full price per unit |
|---|---|
| Raw ingredient (soybeans, oats, wheat) | the chain product's price × 1.05 |
| Intermediate (tofu, oat drink, seitan) | half of the chain's raw ingredient price |

MegaMeat SHALL buy every resource in lots of 20 units. What a MegaMeat sale actually pays SHALL
follow the flooded market, as the flooded-market requirement says; at a fresh market it is close to
the full price. The lot size and both factors SHALL be content data.

What the biogas plant pays per unit SHALL be measured against the resource's market value. A
product's market value SHALL be its base price. An earlier stage's market value SHALL be the market
value of what one unit of it becomes in the next stage of its chain (by the base recipe), divided
by one plus the step markup, the value one processing step adds (starting value 25%, within
10–25%). The step markup SHALL be content data. The biogas plant SHALL pay 62–72% (about 67%) of
the market value for everything it buys. For raw ingredients, it SHALL pay less per unit than
MegaMeat's full price. For intermediates, MegaMeat's full price MAY be below the biogas plant's,
since it is only half of the raw ingredient's. For the biogas plant, selling a resource SHALL pay
less than turning it into the next stage and selling that to the biogas plant.

#### Scenario: Lots
- **WHEN** Tofu-Wurst sells for its base price of €3 and MegaMeat's market is fresh
- **THEN** MegaMeat's full price is €3.15 per soybean and €1.575 per tofu, and a first lot of 20
  soybeans pays €61

#### Scenario: Every chain
- **WHEN** the products sell for their base prices (Hafer-Cappuccino €12, Leverkas €25)
- **THEN** MegaMeat's full price is €12.60 per oat, €6.30 per oat drink, €26.25 per wheat and
  €13.125 per seitan

#### Scenario: Upgrades feed MegaMeat too
- **WHEN** the player owns "mustard on the side", so Tofu-Wurst sells for €4
- **THEN** MegaMeat's full price is €4.20 per soybean, and a first lot of 20 at a fresh market pays
  €82

#### Scenario: Beans beat Tofu-Wurst
- **WHEN** MegaMeat's soybean market is fresh and 20 soybeans could instead become about 6.7
  Tofu-Wurst that sell to customers for €3 each
- **THEN** selling the 20 soybeans to MegaMeat pays €61, three times the €20 from the Tofu-Wurst

#### Scenario: Processing does not pay at MegaMeat
- **WHEN** the player could press 3 soybeans into 1 tofu before selling to MegaMeat
- **THEN** the tofu's full price is about €1.58 instead of €9.45 for the beans

#### Scenario: Intermediates below the biogas plant
- **WHEN** both buyers are offered tofu and oat drink at a fresh market
- **THEN** MegaMeat's full price (€1.575 per tofu, €6.30 per oat drink) is below the biogas plant's
  (€1.60, €6.50)

#### Scenario: Worth less than vegan food
- **WHEN** 3 soybeans become 1 tofu, 1 Tofu-Wurst sells to a customer for €3, and the biogas plant
  buys soybeans in lots of 7 for €3
- **THEN** tofu has a market value of €2.40, soybeans of €0.64, and the biogas plant pays about
  €0.43 per soybean (67%), less than the market value

#### Scenario: Processing pays
- **WHEN** the biogas plant buys soybeans in lots of 7 for €3 and tofu in lots of 5 for €8
- **THEN** pressing 3 soybeans into 1 tofu before selling to the biogas plant earns €1.60 instead
  of about €1.29

#### Scenario: Products only at the biogas plant
- **WHEN** the player has Tofu-Wurst in stock
- **THEN** the biogas plant offers to buy it for less than a customer pays, and MegaMeat does not

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

### Requirement: Buyer flavour
Each buyer SHALL be shown with its name and a short satirical line in the selected language.

#### Scenario: Panel
- **WHEN** the bulk buyers panel is shown
- **THEN** MegaMeat Corp and the biogas plant each appear with their name and their line

### Requirement: Units sold per buyer
The game SHALL count, per buyer, the total units sold to it in this game, as a whole number. The
counts SHALL be saved and restored. A save from before this change SHALL load with both counts at
0 and keep everything else.

#### Scenario: Counting
- **WHEN** the player sells 30 soybeans and 8 wheat to MegaMeat and 20 tofu to the biogas plant
- **THEN** MegaMeat's count is 38 and the biogas plant's count is 20

#### Scenario: Reload
- **WHEN** MegaMeat's count is 38 and the player reloads the page
- **THEN** MegaMeat's count is still 38

#### Scenario: Older save
- **WHEN** a save from before this change with 3 tofu presses and the shop assistant is loaded
- **THEN** the game continues with 3 tofu presses, the assistant, and both counts at 0

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

### Requirement: Flooded market
Every unit sold to MegaMeat SHALL flood MegaMeat's market for that resource. Each resource that
MegaMeat buys SHALL have its own flood level, in units, starting at 0 in a new game. At flood level
F, MegaMeat SHALL pay the full price × K ÷ (K + F) per unit, where K is the half-price flood
(500 units): at a flood of K units the price is half the full price. A sale of n
units at flood F SHALL pay full price × K × ln((K + F + n) ÷ (K + F)), rounded down to whole euros,
so every unit sold lowers the price of the next, and SHALL then raise the flood by n.

The flood SHALL fall with passing game time, halving every H seconds of game time (20 s), and
SHALL fall the same whether time passes in one tick or many. Player actions other than MegaMeat
sales SHALL NOT change it. K and H SHALL be content data; K = 500 and H = 20 s are the values the
balancing page settled on.

Each MegaMeat offer SHALL show the market's current level as a percentage of the full price, a
meter of that level, and while it is below 95% the game time until it is back at 95%. These
figures SHALL sit in slots that are reserved whether or not they show, in digits of equal width,
so the recovering market never moves or resizes anything on the Verkauf tab.

#### Scenario: Fresh market
- **WHEN** nothing has been sold to MegaMeat and the player sells 20 soybeans at a full price of
  €3.15
- **THEN** the sale pays €61, and the soybean flood is 20

#### Scenario: Flooded to half
- **WHEN** the soybean flood is 500 and the player sells 20 soybeans at a full price of €3.15
- **THEN** the market shows 50% before the sale, and the sale pays €31

#### Scenario: Big dump
- **WHEN** the market is fresh and the player sells 1,000 soybeans at once
- **THEN** the sale pays €1,730 instead of the €3,150 the full price would give

#### Scenario: Recovery
- **WHEN** the soybean flood is 500 and 20 seconds of game time pass
- **THEN** the flood is 250, the market shows 67%, and the offer shows about 1:05 until 95%

#### Scenario: Split ticks
- **WHEN** the same flood falls once for 20 seconds and once in 200 ticks of 0.1 seconds
- **THEN** both end at 250, within a rounding error

#### Scenario: Markets are separate
- **WHEN** the player floods soybeans with 1,000 units sold
- **THEN** MegaMeat's tofu, oat and wheat markets stay fresh

#### Scenario: Income is capped
- **WHEN** a player sells soybeans to MegaMeat as fast as any production allows, at a full price
  of €3.15
- **THEN** MegaMeat pays at most about €55 per second for soybeans on average (full price × K ×
  ln 2 ÷ H)

#### Scenario: Biogas is not flooded
- **WHEN** the player sells 1,000 soybeans to the biogas plant
- **THEN** its lot stays 7 soybeans for €3, and MegaMeat's soybean flood is unchanged

### Requirement: Market flood is saved
Each resource's MegaMeat flood level SHALL be part of the save and SHALL be restored exactly. A
save from before the flooded market SHALL load with every flood at 0.

#### Scenario: Reload
- **WHEN** the soybean flood is 400 and the page is reloaded
- **THEN** the soybean flood is still 400 and the market shows the same level

#### Scenario: Older save
- **WHEN** a save from before the flooded market is loaded
- **THEN** every MegaMeat market is fresh and everything else is unchanged
