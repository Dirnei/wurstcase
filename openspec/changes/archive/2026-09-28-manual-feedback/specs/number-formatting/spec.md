## ADDED Requirements

### Requirement: Whole-count form for live stock
The number format SHALL offer a whole-count form for stock amounts that change while the player
watches. Below 1,000 it SHALL show the whole number without decimals. From 1,000 it SHALL be the
same as the fixed-decimal form: three significant digits before the suffix up to but excluding
10^15, and two decimal places in the mantissa from 10^15, keeping trailing zeros. It SHALL follow
the same separators, suffixes, sign and rounding toward zero as the regular format.

#### Scenario: Small stock
- **WHEN** the values 7 and 37 are formatted in English in the whole-count form
- **THEN** the results are `7` and `37`

#### Scenario: Thousands keep three digits
- **WHEN** the values 1,000 and 1,234 are formatted in English in the whole-count form
- **THEN** the results are `1.00K` and `1.23K`

#### Scenario: German millions
- **WHEN** the value 2,500,000 is formatted in German in the whole-count form
- **THEN** the result is `2,50 Mio.`

#### Scenario: Scientific notation
- **WHEN** the value 1.5 × 10^15 is formatted in English in the whole-count form
- **THEN** the result is `1.50e15`
