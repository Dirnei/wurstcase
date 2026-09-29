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
Every unit sold to MegaMeat SHALL flood MegaMeat's market for that resource, and every finished
product (Tofu-Wurst, Hafer-Cappuccino, Leverkas) sold to the biogas plant SHALL flood the biogas
plant's market for that product; the biogas plant's raw ingredients and intermediates SHALL NOT
flood. Each flooded market SHALL have its own flood level, measured in euros of full price (a
sale of n units at a full price of p adds n × p), starting at 0 in a new game. At flood level F,
the buyer SHALL pay the full price × K ÷ (K + F) per unit, where K is the half-price flood
(€1,575: 500 soybeans at €3.15, 125 oats, 60 wheat, 1,000 tofu, 250 oat drink or 120 seitan at
MegaMeat's base full prices; about 93 Leverkas at €17, 197 Hafer-Cappuccino at €8 or 788
Tofu-Wurst at €2 at the biogas plant's lot prices): at a flood of K the price is half the full
price. A sale of n units at full price p and flood F SHALL pay K × ln((K + F + n × p) ÷ (K + F)),
rounded down to whole euros, so every unit sold lowers the price of the next, and SHALL then
raise the flood by n × p. Because K is the same in euros for every market, each market pays at
most about €55 per second however much the player dumps.

The flood SHALL fall with passing game time, halving every H seconds of game time (20 s), and
SHALL fall the same whether time passes in one tick or many. Player actions other than sales to
that buyer SHALL NOT change it. K and H SHALL be content data, the same for both buyers; K =
€1,575 and H = 20 s are the values the balancing page settled on.

Each offer of a flooded market SHALL show the market's current level as a percentage of the full
price, a meter of that level, and while it is below 95% the game time until it is back at 95%.
These figures SHALL sit in slots that are reserved whether or not they show, in digits of equal
width, so the recovering market never moves or resizes anything on the Verkauf tab.

#### Scenario: Fresh market
- **WHEN** nothing has been sold to MegaMeat and the player sells 20 soybeans at a full price of
  €3.15
- **THEN** the sale pays €61, and the soybean flood is €63

#### Scenario: Flooded to half
- **WHEN** the soybean flood is €1,575 and the player sells 20 soybeans at a full price of €3.15
- **THEN** the market shows 50% before the sale, and the sale pays €31

#### Scenario: Big dump
- **WHEN** the market is fresh and the player sells 1,000 soybeans at once
- **THEN** the sale pays €1,730 instead of the €3,150 the full price would give

#### Scenario: Wheat floods as fast in euros
- **WHEN** the wheat market is fresh and the player sells 60 wheat at a full price of €26.25
- **THEN** the sale pays €1,091 instead of €1,575, and the market shows 50% afterwards

#### Scenario: Recovery
- **WHEN** the soybean flood is €1,575 and 20 seconds of game time pass
- **THEN** the flood is €787.50, the market shows 67%, and the offer shows about 1:05 until 95%

#### Scenario: Split ticks
- **WHEN** the same flood falls once for 20 seconds and once in 200 ticks of 0.1 seconds
- **THEN** both end at €787.50, within a rounding error

#### Scenario: Markets are separate
- **WHEN** the player floods soybeans with 1,000 units sold
- **THEN** MegaMeat's tofu, oat and wheat markets stay fresh, and so does the biogas plant's
  Tofu-Wurst market

#### Scenario: Income is capped
- **WHEN** a player sells any one resource to MegaMeat, or any one finished product to the biogas
  plant, as fast as any production allows
- **THEN** the buyer pays at most about €55 per second for it on average (K × ln 2 ÷ H), for
  wheat at €26.25 as much as for soybeans at €3.15 or Leverkas at €17

#### Scenario: Biogas is not flooded
- **WHEN** the player sells 1,000 soybeans to the biogas plant
- **THEN** its lot stays 7 soybeans for €3, and neither MegaMeat's soybean flood nor any biogas
  product market changes: the biogas plant's raw ingredients and intermediates never flood

#### Scenario: Biogas products flood
- **WHEN** the biogas plant's Leverkas market is fresh and the player sells 100 Leverkas at its
  lot price of €17
- **THEN** the sale pays €1,152 instead of €1,700, and the Leverkas offer shows 48% afterwards

### Requirement: Market flood is saved
Each flooded market's level (MegaMeat's per resource, the biogas plant's per finished product),
in euros of full price, SHALL be part of the save and SHALL be restored exactly. A save from
before the flooded market, from before the flood was measured in euros, or from before the
biogas plant's products flooded SHALL load with every missing flood at 0.

#### Scenario: Reload
- **WHEN** the soybean flood is €400 and the page is reloaded
- **THEN** the soybean flood is still €400 and the market shows the same level

#### Scenario: Older save
- **WHEN** a save from before the flooded market is loaded
- **THEN** every MegaMeat market is fresh and everything else is unchanged

#### Scenario: Save with floods in units
- **WHEN** a save with a soybean flood of 500 units from before the euro flood is loaded
- **THEN** every MegaMeat market is fresh and everything else is unchanged

#### Scenario: Save from before biogas floods
- **WHEN** a save with a MegaMeat soybean flood of €400 from before this change is loaded
- **THEN** the soybean flood is €400, every biogas product market is fresh, and everything else
  is unchanged

### Requirement: MegaMeat scandal
The game SHALL keep one MegaMeat scandal level, in euros, starting at 0 in a new game. Every
MegaMeat sale SHALL add the euros it pays to the level. While the level is S, the scandal factor
SHALL be K ÷ (K + S), where K is the half scandal (€10,000): campaigns SHALL win the factor times
the customers they would otherwise win, and customers SHALL place the factor times the orders they
would otherwise place (the sales spec's Open orders requirement), so at a scandal of K campaigns
win half and the town orders half. The level SHALL fall with passing game time, halving every H
seconds of game time (600 s), and SHALL fall the same whether time passes in one tick or many.
Nothing but MegaMeat sales SHALL raise it. K and H SHALL be content data; K = €10,000 and H =
600 s are the values the balancing page settled on.
The balancing page MAY settle on a separate K for orders if one K cannot satisfy its checks; then
both SHALL be content data and listed here.

While the scandal costs at least 1% of the factor, the Verkauf tab and the Aktionen panel SHALL
show a scandal line with how many percent fewer customers campaigns win and how many percent
less the customers order right now, and the game time until the scandal is below 5%; the line
SHALL disappear below 1%.

#### Scenario: Half reach
- **WHEN** the scandal is €10,000, the flyers have not been run yet, there are 10 customers and
  the player runs the flyers
- **THEN** there are 19 customers

#### Scenario: Scandal and study add up
- **WHEN** the scandal is €10,000, MegaMeat's study is active, the flyers have not been run yet,
  there are 10 customers and the player runs the flyers
- **THEN** there are 14 customers (20 × ½ × ½, less the converted share, rounded down)

#### Scenario: Sales add up
- **WHEN** the scandal is €4,000 and the player sells to MegaMeat for €1,091
- **THEN** the scandal is €5,091 and campaigns win 66% of their customers

#### Scenario: Orders drop too
- **WHEN** the scandal is €10,000, there are 1,000 customers with no loyalty card, and 10 seconds
  pass without selling
- **THEN** there are 250 open orders, not 500

#### Scenario: Recovery
- **WHEN** the scandal is €10,000 and 600 seconds of game time pass
- **THEN** the scandal is €5,000, campaigns win 67% of their customers and the town orders 67% of
  its usual orders, and the scandal line says 33% and about 32 minutes until it is below 5%

#### Scenario: Split ticks
- **WHEN** the same scandal falls once for 600 seconds and once in 6,000 ticks of 0.1 seconds
- **THEN** both end at €5,000, within a rounding error

#### Scenario: Line disappears
- **WHEN** the scandal is €90 (the factor is 99.1%)
- **THEN** neither the Verkauf tab nor the Aktionen panel shows a scandal line

#### Scenario: Biogas raises nothing
- **WHEN** the player sells 1,000 soybeans to the biogas plant
- **THEN** the scandal is unchanged

### Requirement: Scandal is saved
The scandal level SHALL be part of the save and SHALL be restored exactly. A save from before
this change SHALL load with the scandal at 0 and everything else unchanged; customers that older
sales took away are not restored.

#### Scenario: Reload
- **WHEN** the scandal is €4,000 and the page is reloaded
- **THEN** the scandal is still €4,000 and campaigns win 71% of their customers

#### Scenario: Older save
- **WHEN** a save from before this change is loaded
- **THEN** the scandal is 0 and everything else is unchanged
