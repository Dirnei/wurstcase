# Spec Delta

## MODIFIED Requirements

### Requirement: Demand ceiling chart
The page SHALL plot, against the number of customers from 10 up to the town size on a logarithmic
axis, the most income per second the customers can pay for when every order is filled with each
product, following the demand knee and doubling rule of the sales spec. The chart's title SHALL
say that the lines differ only by product price. It SHALL also show as a table how many kitchens
of each product that demand keeps busy.

#### Scenario: Starting neighbours
- **WHEN** the chart is read at 10 customers
- **THEN** it shows €1.50 per second for Tofu-Wurst and €12.50 per second for Leverkas

#### Scenario: Beyond the knee
- **WHEN** the chart is read at 3,000 customers
- **THEN** it shows €337.50 per second for Tofu-Wurst (112.5 orders per second × €3), not €450
