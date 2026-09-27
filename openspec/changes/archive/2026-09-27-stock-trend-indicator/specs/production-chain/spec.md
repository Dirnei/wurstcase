## ADDED Requirements

### Requirement: Stock trend
Every resource shown in the stock panel SHALL carry a trend mark after its amount: rising (▲),
falling (▼) or steady (▬). The trend SHALL be based on the net change of that stock caused by
passing game time (buildings producing and using input, and automatic sales) over the last 10
seconds of game time. Player actions (manual production, selling by hand, bulk sales, buying
buildings) SHALL NOT affect the trend.

The trend SHALL be rising when that net change is more than 1 unit, falling when it is less than
−1 unit, and steady otherwise. A resource that is currently marked as short SHALL show steady.
Each mark SHALL have a text label in the selected language ("rising", "falling", "steady") that
screen readers announce and that shows as a tooltip; colour SHALL NOT be the only way the trend
is shown. The trend SHALL NOT be saved: after loading a game or starting a new one, every
resource SHALL show steady until time has passed.

#### Scenario: Stock piles up
- **WHEN** the player owns 1 soybean field and nothing uses soybeans, and 10 seconds of game time
  pass
- **THEN** soybeans show rising

#### Scenario: Stock is used up faster than it arrives
- **WHEN** there are 100 tofu in stock, 2 Tofu-Wurst kitchens use tofu and nothing makes tofu,
  and 10 seconds of game time pass
- **THEN** tofu shows falling

#### Scenario: Nothing happens
- **WHEN** the player owns no building that makes or uses oats and 10 seconds of game time pass
- **THEN** oats show steady

#### Scenario: Short input stays steady
- **WHEN** one soybean field feeds two tofu presses, so the presses keep waiting for soybeans
- **THEN** soybeans show steady, not alternating between rising and falling

#### Scenario: Balanced chain
- **WHEN** a building makes a resource exactly as fast as the next building uses it
- **THEN** that resource shows steady even though its stock moves by a single unit now and then

#### Scenario: Player actions do not count
- **WHEN** soybeans show steady and the player clicks "harvest soybeans" 20 times within a few
  seconds
- **THEN** soybeans still show steady

#### Scenario: Bulk sale does not flip the trend
- **WHEN** soybeans show rising and the player sells all whole lots of soybeans to MegaMeat
- **THEN** soybeans still show rising

#### Scenario: Assistant sells faster than the kitchen makes
- **WHEN** the shop assistant sells Tofu-Wurst from a stock of 50 faster than the kitchens make it
- **THEN** Tofu-Wurst shows falling until the stock is used up, and then steady

#### Scenario: Old changes drop out of the window
- **WHEN** Tofu-Wurst has been rising, nothing sells it, and the kitchens stop because tofu ran
  out
- **THEN** Tofu-Wurst shows steady at the latest 10 seconds of game time after the last
  Tofu-Wurst was made

#### Scenario: After loading
- **WHEN** the player loads a saved game
- **THEN** every resource shows steady until game time has passed

#### Scenario: Accessible label
- **WHEN** the language is English and tofu is rising
- **THEN** the tofu row has the label "rising", and in German "steigend"
