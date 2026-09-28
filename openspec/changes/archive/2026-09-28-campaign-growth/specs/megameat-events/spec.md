## MODIFIED Requirements

### Requirement: Act 1 counter-events
Counter-events SHALL start in this order, starting again from the top after the last:

| Counter-event | Effect | Duration |
|---|---|---|
| Ad campaign "Echte Männer essen Fleisch" | awareness counts half | 120 s |
| A MegaMeat-funded "study" | campaigns win half as many customers | 60 s |
| MegaMeat books every billboard in town | Aktionen cost double | 90 s |

An event SHALL end by itself when its duration has passed.

#### Scenario: Order
- **WHEN** three counter-events have started
- **THEN** they were the ad campaign, the study and the billboards, in that order, and the fourth
  is the ad campaign again

#### Scenario: Billboards
- **WHEN** the flyers have been run once and the billboards event is active
- **THEN** the flyers cost 250 awareness and the fact check costs 600

#### Scenario: Study halves campaigns
- **WHEN** the study is active, the flyers have not been run yet, there are 10 customers and the
  player runs the flyers
- **THEN** there are 19 customers

#### Scenario: Runs out
- **WHEN** the study started 60 seconds ago
- **THEN** it has ended and campaigns win their full number of customers again
