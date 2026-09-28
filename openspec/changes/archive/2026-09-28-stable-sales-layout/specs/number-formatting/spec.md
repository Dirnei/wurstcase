## ADDED Requirements

### Requirement: Fixed-decimal form for live figures
The number format SHALL offer a fixed-decimal form for figures that change while the player
watches. It SHALL follow the same ranges, suffixes, separators, sign and rounding toward zero as
the regular format, but SHALL keep trailing zeros:

- below 1,000: exactly one decimal place
- from 1,000 up to but excluding 10^15: exactly three significant digits before the suffix
- from 10^15: exactly two decimal places in the mantissa

The regular format SHALL stay unchanged wherever the fixed-decimal form is not asked for.

#### Scenario: Whole number keeps its decimal
- **WHEN** the value 37 is formatted in English in the fixed-decimal form
- **THEN** the result is `37.0`

#### Scenario: Fraction is truncated, not rounded up
- **WHEN** the value 37.59 is formatted in English in the fixed-decimal form
- **THEN** the result is `37.5`

#### Scenario: Zero
- **WHEN** the value 0 is formatted in German in the fixed-decimal form
- **THEN** the result is `0,0`

#### Scenario: Thousands keep three significant digits
- **WHEN** the values 1,200 and 1,000 are formatted in English in the fixed-decimal form
- **THEN** the results are `1.20K` and `1.00K`

#### Scenario: German suffix
- **WHEN** the value 12,000,000 is formatted in German in the fixed-decimal form
- **THEN** the result is `12,0 Mio.`

#### Scenario: Three digits before the suffix
- **WHEN** the value 250,000 is formatted in English in the fixed-decimal form
- **THEN** the result is `250K`

#### Scenario: Scientific notation
- **WHEN** the value 1.5 × 10^15 is formatted in English in the fixed-decimal form
- **THEN** the result is `1.50e15`

#### Scenario: Negative value
- **WHEN** the value −2.5 is formatted in English in the fixed-decimal form
- **THEN** the result is `-2.5`

#### Scenario: Regular format unchanged
- **WHEN** the value 37 is formatted in English in the regular form
- **THEN** the result is `37`
