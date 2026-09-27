# Spec Delta

## Purpose

Gives surplus production an outlet when customers cannot take more: MegaMeat Corp buys raw
ingredients and intermediates as animal feed, and a biogas plant buys them, and unsold finished
products too, for even less without feeding the industry. Both pay far less than customers do for vegan food.

## ADDED Requirements

### Requirement: Bulk buyers
The game SHALL offer two bulk buyers: MegaMeat Corp (animal feed) and a biogas plant. Both SHALL
buy raw ingredients (soybeans, wheat, oats) and intermediates (tofu, seitan, oat drink). The
biogas plant SHALL also buy finished products (Tofu-Wurst, Leverkas, Hafer-Cappuccino); MegaMeat
SHALL NOT. Each buyer SHALL buy a resource only in fixed lots, each lot a fixed
number of units for a whole number of euros. The biogas plant SHALL pay less per unit than
MegaMeat for every resource both buy, and both SHALL pay less per unit than the resource is worth
when turned into a product (or, for a product, when sold) to customers. A buyer SHALL be offered for a resource only while
that resource is shown in the stock panel.

#### Scenario: Lots
- **WHEN** MegaMeat buys soybeans in lots of 10 for €1 and the biogas plant in lots of 20 for €1
- **THEN** the biogas plant pays half as much per soybean as MegaMeat

#### Scenario: Worth less than vegan food
- **WHEN** 3 soybeans become 1 tofu and 1 Tofu-Wurst sells to a customer for €3
- **THEN** each buyer pays less than €1 per soybean

#### Scenario: Products only at the biogas plant
- **WHEN** the player has Tofu-Wurst in stock
- **THEN** the biogas plant offers to buy it for less than a customer pays, and MegaMeat does not

### Requirement: Selling in bulk
The player SHALL be able to sell a resource to a buyer with one click. The sale SHALL take as many
whole lots as the stock allows, leave the remainder in stock, and add the lots' price to both the
money and the total money earned. Each button SHALL show how many units the sale takes and what it
pays. A sale SHALL be unavailable while the stock is smaller than one lot.

#### Scenario: Whole lots only
- **WHEN** MegaMeat buys soybeans in lots of 10 for €1, the player has 37 soybeans and sells them
  to MegaMeat
- **THEN** 30 soybeans are sold, 7 remain, and money and total money earned grow by €3

#### Scenario: Less than one lot
- **WHEN** the player has 9 soybeans and MegaMeat's lot is 10
- **THEN** selling soybeans to MegaMeat is unavailable and nothing changes

#### Scenario: Counts towards unlocks
- **WHEN** total money earned is €195 and the player sells soybeans to MegaMeat for €5
- **THEN** the wheat chain unlocks at its €200 threshold

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
