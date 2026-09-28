# Vegan Idle Game — Concept & Design

- **Date:** 2026-09-25
- **Status:** Approved concept, pre-implementation
- **Title:** **"Wurst Case"** (chosen 2026-09-25). "Leverkas" is the Act 1 flagship product; the
  domain leberkas.org can point to the game.

## 1. Vision

A browser idle game where the player builds a plant-based food empire and uses the profits to buy
animals out of the evil food industry and give them a home in their **Lebenshof** (animal
sanctuary). It is a hobby project that will be published so people have fun and, along the way,
think about veganism.

**Inspirations:** Universal Paperclips (story, phases, dark turn, bottleneck management),
Swarm Simulator (tiers, big numbers, prestige), Idle Revolution (movement growth fantasy).

**Success criteria for v1:**
- Act 1 plus the first prestige is playable end to end in roughly 30–60 minutes.
- Fully playable in German and English.
- Published on itch.io and leberkas.org.
- Players come away amused, and have met a handful of real, sourced facts without feeling lectured.

**Out of scope for v1:** accounts, cloud saves, monetization, achievements, sound, statistics
screen, illustrated Lebenshof view, Acts 2+.

## 2. Tone

- **Funny satire first.** Cartoon villain (MegaMeat Corp), goofy upgrades, satirical news ticker.
- **German flavour.** German food parodies (Leverkas, Currywurst ohne Wurst, Hafer-Cappuccino),
  the Lebenshof concept, German humour, with English equivalents rather than literal translations.
- **Real facts as flavour.** Short, sourced, never forced.
- **Dark turn later.** Starts silly; in Act 4 the real scale of the industry is revealed
  (Paperclips-style). Earned after hours of lightness, never preachy.

## 3. Core loop

```
sell food ──▶ € ──▶ rescue animals ──▶ Lebenshof creates awareness
    ▲                                              │
    └──────── more customers ◀── people go vegan ◀─┘
```

### 3.1 Resources (Act 1)

| Resource | Meaning |
|---|---|
| € Euro | Money earned by selling products |
| Raw ingredients | Soybeans, wheat, oats — produced by fields |
| Intermediates | Tofu, seitan, oat drink — produced by processing buildings |
| Products | Tofu-Wurst, Leverkas, Hafer-Cappuccino — sold to customers |
| 👥 Customers | Townspeople who buy vegan; they determine demand |
| 📣 Awareness | Produced by animals; spent on Aktionen, which win townspeople as customers |
| 🐔🐷🐄 Animals | Individually named residents of the Lebenshof |
| 🏠 Space | Lebenshof capacity (barns, pastures); limits how many animals you can house |

### 3.2 Production chain

```
FIELDS (raw)        PROCESSING (intermediate)        PRODUCTS (sold)
Soybean field ───▶  Tofu press     ─▶ Tofu      ──▶  Tofu-Wurst
Oat field     ───▶  Oat mill       ─▶ Oat drink ──▶  Hafer-Cappuccino
Wheat field   ───▶  Seitan kitchen ─▶ Seitan    ──▶  LEVERKAS ⭐
```

- **Fields** produce raw ingredients per second. More fields and hired **farmers** raise output.
- **Processing buildings** convert inputs to outputs at a fixed ratio (e.g. 3 soybeans → 1 tofu).
  If an input is missing they **stall**, and the UI shows it (e.g. "Tofu press is waiting for
  soybeans").
- **Products** consume intermediates and go to stock for sale.
- **Leverkas** is the Act 1 premium product: unlocked mid-act, highest price, the "business takes
  off" moment.
- A balanced line needs more of its early steps than of its late ones (soy 1.5 fields : 1 press :
  1 kitchen; oat and wheat 2 : 1.5 : 1), and early steps cost less. Prices grow per balanced set,
  not per copy: owning one more whole set of a chain makes every building in it more expensive by
  the chain's set growth, and later chains grow more slowly: soy 13%, oat 7%, wheat 6% per set
  (idle games use 7–15%). Each new chain starts as a worse deal and overtakes the one before, as in
  AdVenture Capitalist. (Changed by `chain-proportions`; before, prices grew per copy.) Animals follow the same idea (chicken 25%, pig 18%,
  cow 12%).
- A chain grows as a whole: once every building of a chain is owned 25, 50 and 100 times, a chain
  milestone upgrade comes on offer that doubles the whole chain. Owning more of one building alone
  gives no bonus.
- **Efficiency upgrades** make a processing building or kitchen get more out of the same input:
  each run makes one more unit ("3 Sojabohnen → 2 Tofu"). The next stage then becomes the
  bottleneck, so the player grows the line further down.
- **Manual start:** the player clicks "Sojabohnen ernten" (harvest soybeans) and "Tofu pressen"
  (press tofu) until they can afford the first field and press.

### 3.3 Sales

- Customers create a **total demand** in units per second.
- **Sales per second = min(stock available, demand).** Overproduction piles up unsold (with a
  joke message); a lack of stock leaves demand unserved. This bottleneck is the central tension
  between the business half and the rescue half of the game.
- Stock is sold **most expensive product first**, so moving up to Leverkas is directly rewarding.
- Customers come slowly ("vegan words spread slowly"), so Act 1 lives in **overproduction**, like
  the real food system. Surplus goes to bulk buyers. The **biogas plant** pays about 67% of the
  market value (the product's price, less 25% for each processing step still to come) and costs
  nothing. **MegaMeat** openly outbids vegan food: a raw ingredient pays the chain product's price
  +5% (one soybean beats one Tofu-Wurst), an intermediate half of that, so processing first loses
  money there. Its market floods, though: every sale lowers the price of the next (half price
  after €1,575 of full-price sales in that market, e.g. 500 soybeans or 60 wheat), and the flood
  halves every 20 seconds, so MegaMeat pays at most about €55 per second for any one resource
  however much the player dumps. Every sale also drives away the share of customers that it is of
  what they spend with you in one minute, plus awareness. Feeding the industry wins the first
  minutes; a player who only feeds MegaMeat ends an hour far behind the fair player, with the
  customers the industry took. (Changed by `megameat-outbids`; flood in euros and the one-minute
  feed cost by `chain-proportions`.)

### 3.4 Lebenshof and rescue

- Animals are bought from **MegaMeat Corp**. Prices rise with each purchase ("MegaMeat notices
  demand").
- Species in Act 1: chicken (cheap), pig (mid), cow (expensive).
- Each animal needs **space**; space is bought separately (barns, pastures), giving a second money
  sink.
- Every animal gets a **random name** (e.g. "Rosi", "Günther", "Frau Huhn") from a localized name
  pool and appears in the Lebenshof list (emoji in v1, illustrations later).
- Animals are **never lost** — not by neglect, not by prestige.

### 3.5 Awareness

- Each animal produces awareness per second, larger animals more. Starting values:
  chicken 1, pig 5, cow 20 (tuned in play).
- **No passive conversion:** awareness only fills a pool. Townspeople become customers only when
  the player spends awareness on **Aktionen (campaigns)** — e.g. "Flyer am Wochenmarkt" (market
  flyers), "Tag der offenen Hoftür" (open farm day), "Viral reel: pig on a slide" — so every new
  customer is the result of a choice. (Changed by `campaign-growth`; the earlier design converted
  passively and let campaigns only speed it up.)
- **Campaigns grow with each run:** every run makes a campaign's next run cost more (×1.25) and
  reach more people (×1.1). Cost outgrows reach, so a campaign wins fewer customers per awareness
  point run by run and the bigger campaigns take over. Reach slows as the town saturates (it is
  proportional to the unconverted share of the population). The flyers unlock with the Lebenshof.
- **Idle play:** customers do not grow while the player is away. A way to automate campaigns (for
  example a hireable campaign manager) is planned for a later change, after playtesting.
- Act 1 population: one small town (Kleinstadt) of **20,000** people.

### 3.6 MegaMeat Corp (villain)

- Speaks mainly through the **news ticker** — satirical headlines, the main joke delivery.
- As the player grows, MegaMeat triggers timed **counter-events** (e.g. "'Echte Männer essen
  Fleisch' ad campaign: awareness −50% for 2 minutes"). The player can counter with Aktionen.
- The ticker doubles as the **tutorial**: early headlines hint at the next step ("Local farmer
  wonders whether a press would make tofu faster…").

### 3.7 Facts (Faktenbuch)

- Milestones unlock **fact cards** (e.g. first pig rescued → fact about pig intelligence).
- A fact appears once in the ticker, then lives in the **Faktenbuch** menu.
- **Every fact must carry a real source** (title plus URL), shown in the Faktenbuch. Facts are
  written and verified by the author in DE and EN; the game provides only the system. No fact ships
  without a source.

### 3.8 One-time upgrades

Act 1 has about 15–20 one-time upgrades, e.g. "Better seeds" (fields ×2), "Second farmer",
"Leverkas secret recipe" (+50% Leverkas price), "Instagram account" (Aktionen cheaper).

## 4. Prestige and story

### 4.1 Neustart (prestige)

- **Resets:** money, fields, processing, products, stock, customers, one-time upgrades.
- **Kept:** all animals (they keep producing awareness in every run), the Faktenbuch, story
  progress, and the prestige currency.
- **Prestige currency: 📜 Rezepte (recipes).** Earned from total customers converted in the run,
  with diminishing returns (square-root curve as a starting point).
- Rezepte are spent in a **permanent upgrade tree** (faster fields, cheaper animals, head starts
  such as "start with 1 tofu press", etc.).

### 4.2 Story rules

- Each act has a **goal**. Completing it triggers the act's story event, and the first time, it
  unlocks prestige.
- After prestige is unlocked, the player may prestige at any time to farm Rezepte.
- **The story advances only when an act goal is completed**, never just by resetting.

### 4.3 Acts (v1 builds Act 1 only; the rest is roadmap)

| Act | Setting | Ends with |
|---|---|---|
| 1 | Kleinstadt — your farm and Imbiss | MegaMeat's lawyers sue over the name "Leverkas" (a nod to real food-naming disputes) → first Neustart. Goal: about 80% of the town converted. |
| 2 | Großstadt — restaurant chain, supermarket shelves | MegaMeat buys your supplier |
| 3 | Germany — industry, lobbying, Bundestag | A law passed against you |
| 4 | **The dark turn** — global scale. A live counter of animals killed worldwide (real, sourced statistics) races next to your rescued count. | The realization: you can't rescue your way out, only change demand |
| 5 | Finale — the last MegaMeat slaughterhouse becomes a Lebenshof | 🎬 The ending |
| 6+ | **New worlds** — take the Lebenshof idea to other planets, each with its own crops, alien creatures to befriend and a local MegaMeat branch | Endless / prestige mode; each world adds content |

## 5. Act 1 pacing (target shape)

Exact numbers are tuned in play; the spec fixes the order of unlocks and the target times.

| Time | Events | New mechanic |
|---|---|---|
| 0–2 min | Manual harvest and pressing; sell Tofu-Wurst to 10 curious neighbours (starting customers) | Clicking, selling |
| 2–10 min | First soybean field and tofu press; demand can't keep up → first chicken rescued | Automation, rescue, awareness |
| 10–20 min | Oat chain and Hafer-Cappuccino; pigs; first Aktion (flyers); first MegaMeat counter-event | Second chain, campaigns, villain |
| 18–35 min (Leverkas up to 55) | Wheat field and seitan kitchen; ⭐ Leverkas unlocked (the simulation buys the first oven at about 52 min, a guideline the user playtests); cows from about 18 min; barn expansions | Premium product, space |
| 35–60 min | Push toward 80% town conversion; lawyer's letter arrives; Neustart | Prestige, Rezepte tree |

## 6. Presentation

- **Text-first UI with emoji/icons** in v1 (Paperclips / Swarm Sim style): panels for fields,
  processing, products and sales, Lebenshof, Aktionen, upgrades, a news ticker, and the Faktenbuch.
- Every visual has an emoji fallback, so art never blocks progress.
- **Later:** an illustrated Lebenshof view that fills with the player's actual animals. Free
  asset sources to evaluate: Kenney.nl (CC0), OpenMoji / Twemoji (open emoji sets), itch.io
  free asset packs. Record each asset's licence in a `CREDITS` file.
- **Settings:** language toggle (DE/EN), number format (1.5M vs 1.5e6), manual save, export/import
  of save strings, reset.

## 7. Technical architecture

### 7.1 Stack

- **TypeScript**, **Vite** (build), **Svelte 5** (UI), **break_eternity.js** (big numbers, so
  endless mode can go past 10^308), **Vitest** (tests).
- Output is static files. The same build is deployed to itch.io and leberkas.org.

### 7.2 Structure

The key rule: **game logic knows nothing about the UI.**

```
src/
  game/                  pure TypeScript, no Svelte, fully testable
    state.ts             GameState: one plain, serializable object
    content/             all game content as data, no logic:
      crops.ts processors.ts products.ts animals.ts
      upgrades.ts aktionen.ts events.ts facts.ts acts.ts
    systems/             one file per mechanic:
      production.ts      fields → processing → products, with stalls
      sales.ts           demand, most-expensive-first selling
      awareness.ts       awareness production, Aktionen
      rescue.ts          buying animals, space, names
      villain.ts         MegaMeat counter-events
      prestige.ts        Neustart, Rezepte, act progression
    tick.ts              tick(state, seconds): runs the systems in a fixed order
    save.ts              localStorage, export/import, versioned migrations
    offline.ts           simulates time away (capped at 12h) using tick()
  i18n/
    de.json  en.json     all player-facing text by key, e.g. t('product.leverkas.name')
  ui/                    Svelte components: read state, call actions; no game rules
  main.ts                game loop (10 ticks/s), autosave every 30 s
```

### 7.3 Principles

- **Content is data.** A new crop, product, animal, upgrade or fact is a new entry in a content
  file, not new code. Later acts are mainly content work.
- **One simulation path.** The live loop, offline progress and tests all use the same `tick()`,
  so offline progress cannot drift from live play.
- **No hard-coded text.** Every player-facing string goes through i18n from the first commit.
- **Dev-only debug panel:** game speed ×10 / ×100 and resource cheats, for tuning the pacing.
  Stripped from production builds.

### 7.4 Saving and error handling

- Saves carry a **version number**. Older saves are migrated step by step on load.
- The **two most recent autosaves** are kept. If the latest is corrupted, the game loads the
  previous one and tells the player. It never silently wipes progress.
- Export/import as a text string (lets players back up and move saves between devices).

### 7.5 Testing

Vitest unit tests for the game logic, at minimum:
- cost scaling
- production chains, including stalls on missing input
- sales order (most expensive first) and the min(stock, demand) rule
- conversion saturation
- the prestige formula, and exactly what resets and what is kept
- save → load round-trip, and migration of an older save version
- offline progress for N seconds gives the same result as N seconds of live ticks

The UI is verified by playing.

### 7.6 Deployment

`npm run build` → zip upload to itch.io. For leberkas.org the game ships as a Docker image
(the build, served by a small static web server); the same image runs locally with
`docker compose up` to check the real production build. CI automation comes later.

## 8. Development workflow — OpenSpec

The project uses **OpenSpec** (`@fission-ai/openspec`) for spec-driven development. This
document is the product vision; OpenSpec holds the detailed, living specs per capability and
drives the implementation, one change at a time.

**Setup (once):**
1. `npm install -g @fission-ai/openspec@latest`
2. `openspec init` in the repo, selecting Claude Code (installs the `/opsx:*` commands)
3. Fill `openspec/config.yaml` with the project context: this document's vision, tone, stack
   and principles (section 7.3).

**Per change:** `/opsx:propose <change-name>` → review proposal, design, tasks and delta specs →
`/opsx:apply` → verify (tests pass, play it) → `/opsx:archive` (merges the delta specs into
`openspec/specs/`).

**Planned change sequence for v1** (each one ends in a runnable game):

| # | Change | Delivers |
|---|---|---|
| 1 | `project-scaffold` | Vite + Svelte + TS + Vitest, break_eternity, i18n skeleton (DE/EN), empty game loop |
| 2 | `docker-container` | Production Docker image (build + static web server) and compose file for local runs; later deploys leberkas.org |
| 3 | `game-state-and-save` | GameState, `tick()`, autosave with versioning and backup, export/import |
| 4 | `production-chain` | Manual actions, fields, processing with stalls, products, cost scaling |
| 5 | `sales-and-customers` | Demand, min(stock, demand), most-expensive-first, starting neighbours |
| 6 | `lebenshof-rescue` | Animals, space, names, awareness production, passive conversion |
| 7 | `aktionen-and-megameat` | Campaigns, counter-events, news ticker with tutorial hints |
| 8 | `upgrades` | Act 1 one-time upgrades |
| 9 | `faktenbuch` | Fact cards, milestone unlocks, sources display |
| 10 | `prestige-and-act-1` | Act goal, lawsuit event, Neustart, Rezepte tree |
| 11 | `offline-progress` | Offline simulation with cap and "while you were away" summary |
| 12 | `settings-and-debug` | Settings screen, dev debug panel |
| 13 | `release-v1` | Pacing tuning pass, build, itch.io and leberkas.org deployment |

## 9. Open items for the author (content, not design)

- Writing and verifying the Act 1 fact cards with sources, in DE and EN.
- Ticker headlines and Aktion/upgrade names in DE and EN.
- Checking the legal side of parody names (e.g. "MegaMeat Corp" must not resemble a real company).
