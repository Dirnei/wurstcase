# Spec Delta

## Purpose

Shows resource amounts of any size, from fractions up to far beyond 10^308, in a short, readable,
language-appropriate form, and never displays more than the player actually has.

## ADDED Requirements

### Requirement: Small numbers
Numbers with an absolute value below 1,000 SHALL be shown with at most one decimal place, rounded
toward zero, and without a trailing `.0` / `,0`.

#### Scenario: Whole number
- **WHEN** the value 12 is formatted in English
- **THEN** the result is `12`

#### Scenario: Fraction is truncated, not rounded up
- **WHEN** the value 12.59 is formatted in English
- **THEN** the result is `12.5`

#### Scenario: German decimal separator
- **WHEN** the value 12.5 is formatted in German
- **THEN** the result is `12,5`

### Requirement: Suffix notation from thousands to trillions
Numbers with an absolute value from 1,000 up to but excluding 10^15 SHALL be shown with three
significant digits, rounded toward zero, followed by a language-specific suffix:

| Magnitude | English | German |
|---|---|---|
| 10^3 | `K` | ` Tsd.` |
| 10^6 | `M` | ` Mio.` |
| 10^9 | `B` | ` Mrd.` |
| 10^12 | `T` | ` Bio.` |

Trailing zeros after the decimal separator are dropped. English suffixes follow the number
directly; German suffixes are separated by a space.

#### Scenario: English thousands
- **WHEN** the value 1,234 is formatted in English
- **THEN** the result is `1.23K`

#### Scenario: German millions
- **WHEN** the value 12,345,678 is formatted in German
- **THEN** the result is `12,3 Mio.`

#### Scenario: German billion is a Milliarde
- **WHEN** the value 2,000,000,000 is formatted in German
- **THEN** the result is `2 Mrd.`

#### Scenario: Never rounds up across a boundary
- **WHEN** the value 999,999 is formatted in English
- **THEN** the result is `999K`

### Requirement: Scientific notation for huge numbers
Numbers with an absolute value of 10^15 or more SHALL be shown in scientific notation with three
significant digits, rounded toward zero, using the language's decimal separator and dropping trailing
zeros after it, including values beyond 10^308.

#### Scenario: Just past the suffix range
- **WHEN** the value 1.5 × 10^15 is formatted in English
- **THEN** the result is `1.5e15`

#### Scenario: Beyond regular floating-point range
- **WHEN** the value 4.567 × 10^400 is formatted in German
- **THEN** the result is `4,56e400`

### Requirement: Negative numbers
Negative numbers SHALL be formatted like their absolute value with a leading minus sign.

#### Scenario: Negative rate
- **WHEN** the value −2,500 is formatted in English
- **THEN** the result is `-2.5K`

### Requirement: Play-time display
Durations SHALL be shown as `h:mm:ss`, with hours growing beyond two digits as needed.

#### Scenario: Ninety seconds
- **WHEN** a duration of 90 seconds is formatted
- **THEN** the result is `0:01:30`

#### Scenario: Long session
- **WHEN** a duration of 100 hours, 5 minutes and 7 seconds is formatted
- **THEN** the result is `100:05:07`
