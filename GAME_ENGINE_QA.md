# Rackle Game Engine QA

Rackle’s game engine QA protects the parts of the daily Charleston experience that must feel fair, believable, and repeatable before club launch.

## One-command Game Engine QA

Fast launch check:

```bash
npm run validate:game-engine
```

Deep launch check:

```bash
npm run validate:game-engine:deep
```

### Why this exists

This parent runner gives Rackle one launch-safety command for the scoring and game engine.

The fast command is designed for regular pre-deploy checks. It keeps the heavy distribution work in a smoke-test range so the command finishes reliably.

The deep command is for larger checks before major releases, founding club pushes, or scoring changes.

### Checks covered

1. Rack State QA
2. Daily Determinism QA
3. Incoming Tile QA
4. Pass Recommendation QA
5. Card-Line Database QA
6. Scoring Trust QA
7. Practice Variety QA
8. Score Distribution QA

The parent runner stops on the first failed check and exits non-zero.

If a validation script is missing, the runner skips it with a clear message instead of crashing.

### Runtime settings

The parent runner supports these environment overrides:

```bash
RACKLE_INCOMING_SEEDS=500
RACKLE_PRACTICE_VARIETY_GAMES=500
RACKLE_SCORE_DISTRIBUTION_GAMES=500
```

Fast defaults:

```text
Incoming seeds: 250
Practice racks: 100
Score distribution games per mode: 25
```

Deep defaults:

```text
Incoming seeds: 500
Practice racks: 500
Score distribution games per mode: 1000
```

### Latest parent-run result

```text
npm run validate:game-engine
Game Engine QA: PASSED
Skipped checks: none
Runtime: about 28 seconds in local container verification
```

Latest fast-run summary:

```text
Rack State QA: PASSED
Daily Determinism QA: PASSED
Incoming Tile QA: PASSED
Pass Recommendation QA: PASSED
Card-Line Database QA: PASSED
Scoring Trust QA: 55 / 55 passing
Practice Variety QA: PASSED
Score Distribution QA: PASSED
```

The production build passed after the harness update.

### Available individual commands

```bash
npm run validate:rack-state
npm run validate:daily-determinism
npm run validate:incoming
npm run validate:passes
npm run validate:card-lines
npm run validate:scoring
npm run validate:scoring:verbose
npm run validate:practice-variety
npm run validate:score-distribution
npm run validate:score-distribution:deep
```

Use the individual commands when working on one layer. Use the parent command before deploy.

### Known limits

The fast parent command intentionally uses smaller distribution samples so it can run during normal launch checks. Use the deep command when scoring, practice generation, or card-line logic changes.

## Rack State QA

Command:

```bash
npm run validate:rack-state
```

### Why this exists

Rackle should never create an impossible Charleston state.

This validation checks the basic game accounting before launch:

- the starting rack has 13 tiles
- the final rack has 13 tiles
- each Charleston pass sends 3 tiles
- each Charleston pass receives 3 tiles
- Jokers are never passed out or received in Charleston
- tile counts never exceed legal deck limits
- the final rack equals the starting rack minus outgoing tiles plus incoming tiles

### Legal tile limits

The validator uses multiset counts, not object reference equality.

Legal maximums:

- suited tile: 4 copies
- wind: 4 copies
- dragon: 4 copies
- flower: 8 copies
- joker: 8 copies

### Simulation

The command simulates:

- 500 Daily Rackle games
- 500 Practice Room games
- 3 Charleston passes per game

It validates each completed rack state after the simulated Charleston.

### Latest result

```text
Rack State QA
Daily games tested: 500
Practice games tested: 500
Failures: 0
Warnings: 0

Checks:
- Starting rack count: pass
- Final rack count: pass
- Pass sizes: pass
- Joker outgoing: pass
- Joker incoming: pass
- Legal duplicate limits: pass
- Rack accounting: pass

Rack State QA: PASSED
```

### Engine safety patch

Practice Room now requests incoming Charleston tiles against the rack after the player’s outgoing pass.

That prevents an edge case where practice could combine a random starting rack with unrelated incoming tiles and accidentally exceed legal duplicate limits.

Daily Rackle remains stable because it already uses deterministic seeded racks and receives.

## Daily Determinism QA

Command:

```bash
npm run validate:daily-determinism
```

### Why this exists

Daily Rackle has to feel fair.

Every player should receive the same Daily Rackle for the same date. The starting rack, incoming Charleston receives, and seeded pass behavior must stay stable for that date. Practice Room should stay varied and should never affect the Daily rack.

### What it tests

The validation checks 100 test dates.

For each date, it verifies:

- the same date creates the same starting rack every time
- the same date creates the same 3 Charleston incoming passes every time
- adjacent dates create different racks
- Practice Room generation does not change Daily Rackle
- Daily rack objects are not mutated by pass or incoming-tile logic

It also generates 100 Practice Room racks and checks that practice has enough variety.

### Stability checks

The script reports:

- same-date rack stability
- same-date incoming stability
- different-date variety
- practice independence
- practice variety
- mutation safety

### Latest result

```text
Daily Determinism QA
Dates tested: 100
Same-date rack stability: pass
Same-date incoming stability: pass
Different-date variety: pass
Practice independence: pass
Practice variety: pass
Mutation safety: pass

Details:
- Duplicate daily rack count across dates: 0
- Unique practice rack count: 100 / 100

Daily Determinism QA: PASSED
```

### Launch expectation

- Daily Rackle should be stable for the same date and seed.
- Incoming Charleston tiles should be stable for the same date and seed.
- Practice Room should remain varied.
- Practice Room should not affect Daily Rackle state.
- Pass and incoming logic should not mutate the original Daily rack.


## Incoming Tile Distribution QA

Command:

```bash
npm run validate:incoming
```

### Why this exists

Rackle previously risked giving players too many winds and dragons in incoming Charleston passes, especially in Practice Room.

This validation prevents that regression.

The test checks that virtual players pass believable low-value tiles, not a constant stream of honors.

### What it tests

The script simulates 500 deterministic daily seeds.

For each seed, it:

1. Deals the Daily Rackle starting rack.
2. Runs 3 Charleston receives using `getIncomingTiles`.
3. Tracks all 9 incoming tiles for the player.
4. Counts tile type distribution.
5. Checks risk patterns that would make receives feel fake.

### Distribution tracked

The report includes:

- suited tile count and percentage
- wind count and percentage
- dragon count and percentage
- total honor count and percentage
- flower count and percentage
- Joker count and percentage

Definitions:

- suited tile: bam, crak, or dot numbered tile
- wind: N, E, W, or S
- dragon: Red, Green, or Soap
- flower: flower tile
- Joker: joker tile
- honor: wind or dragon

### Risk checks tracked

The report also checks:

- Joker incoming count
- honor-heavy receives
- all-honor receives
- duplicate-heavy receives
- repeated wind / dragon dominance
- impossible tile count games
- missing received tile passes
- wrong-size receive passes
- max honors in one game
- max dragons in one game
- max winds in one game

### Launch thresholds

The current launch thresholds are intentionally broad.

They catch obvious regression without forcing every Charleston to feel too clean.

Expected ranges:

- suited tiles: 60% to 85%
- honors total: 10% to 30%
- winds: 5% to 22%
- dragons: 3% to 14%
- flowers: 1% to 8%
- Jokers: 0%
- max honors in one game: no more than 6 of 9 incoming tiles

Expected behavior:

- Jokers must never be incoming.
- Suited tiles should make up most incoming tiles.
- Honors can appear, but should not dominate.
- Flowers should appear occasionally.
- Dragons should appear sometimes, not constantly.
- All-honor receives should be rare or 0.
- No game should receive 7 or more honors across 9 incoming tiles.

### Latest result

Latest command run:

```bash
npm run validate:incoming
```

Result:

```text
Incoming Tile Distribution QA
Seeds tested: 500
Total incoming tiles: 4500

Distribution:
- Suited: 3484 / 77.4%
- Winds: 748 / 16.6%
- Dragons: 155 / 3.4%
- Honors total: 903 / 20.1%
- Flowers: 113 / 2.5%
- Jokers: 0 / 0%

Risk checks:
- Joker incoming count: 0
- Honor-heavy receives: 0
- All-honor receives: 0
- Duplicate-heavy receives: 4
- Repeated wind/dragon dominance: 0
- Impossible tile count games: 0
- Missing received tile passes: 0
- Wrong-size receive passes: 0
- Max honors in one game: 3 of 9
- Max dragons in one game: 2 of 9
- Max winds in one game: 3 of 9

Incoming Tile Distribution QA: PASSED
```

### Virtual player pass model

Virtual players now use a line-shape-aware keep profile before choosing Charleston passes.

For each virtual rack, Rackle:

1. Scores the rack by section.
2. Takes the best 2 section reads.
3. Builds line-shape keep weights inside those sections.
4. Protects realistic anchors before choosing pass tiles.
5. Passes the 3 lowest-value legal tiles.

The keep profile protects tiles tied to realistic rack shapes, including:

- 2026 year cores: 2s, 6s, Soap, and Flowers when balanced
- Consecutive Run same-suit windows
- Like Number same-number clusters
- Quints natural pair / triple anchors with Joker support
- Winds & Dragons paired honors and real dragon balance
- 3-6-9 same-suit cores and matching support
- 2-4-6-8 and 1-3-5-7-9 suit/number lanes
- Singles & Pairs natural pair structure
- Single Suit dominant-suit lanes

This now uses Rackle's structured 2026 card-line database layer so virtual players protect real line-shape anchors before choosing Charleston pass tiles.

The thresholds are not meant to prove perfect Mahjong AI.

They are meant to catch distribution regressions, especially:

- Jokers being passed
- honors dominating receives
- winds and dragons appearing constantly
- missing or wrong-size incoming passes
- impossible tile count states

## 2026 Card-Line Database QA

Command:

```bash
npm run validate:card-lines
```

Purpose:

Confirm Rackle has structured 2026 card-line coverage across the sections used by the game engine.

The database stores:

- line IDs
- section mapping
- tile requirements
- concealed flags
- Joker eligibility
- exactness level
- internal keep weights

It does not render the full card text in the UI.

Latest result:

```text
Card-Line Database QA
Total card-line specs: 127
Section coverage: 2026: 4 | evens: 10 | like: 18 | quints: 16 | consec: 21 | odds: 14 | wd: 4 | threeSixNine: 6 | pairs: 31 | suited: 3
Scenario tests: 9
Passed: 9
Failed: 0

Card-Line Database QA: PASSED
```

Launch check:

Verify the manually structured specs against the physical 2026 card before public release.

## Score Distribution QA

Command:

```bash
npm run validate:score-distribution
```

Deep run:

```bash
npm run validate:score-distribution:deep
```

### Why this exists

Rackle IQ should not drift into inflated score bands as the game engine improves.

This validation protects the scoring curve so:

- 90+ remains rare
- 80 to 89 feels strong
- 70 to 79 feels like solid good play
- 60 to 69 stays a common playable range
- 50 to 59 reflects mixed play
- under 50 reflects weak or scattered play

### What it tests

The script simulates 1,000 generated Daily Rackle games per play style:

1. Random legal pass
2. Expert-ish pass
3. Mixed pass

Each simulated game:

- deals a deterministic Daily Rackle rack
- runs 3 Charleston passes
- never passes Jokers
- receives incoming tiles through `getIncomingTiles`
- calculates Rackle IQ through the same core scoring model
- records confidence, receive luck, pass quality, score cap, and score band

The validation uses worker chunks so the 3,000-game run stays practical for launch QA.

### Guardrails

Random legal pass:

- 90+ should stay under 2%
- 80+ should stay under 15%

Expert-ish pass:

- 90+ should stay under 5%
- 80+ should stay under 35%

Mixed pass:

- 90+ should stay under 3%
- 80+ should stay under 25%

Confidence guardrail:

- High confidence should not dominate random mode

These thresholds are intentionally broad.

They are meant to catch obvious score inflation, not force a perfect statistical distribution.

### Latest result

Latest command run:

```bash
npm run validate:score-distribution
```

Result:

```text
Score Distribution QA
Games per mode: 1000

Random legal pass:
- 90+: 0 / 0%
- 80 to 89: 12 / 1.2%
- 70 to 79: 72 / 7.2%
- 60 to 69: 229 / 22.9%
- 50 to 59: 538 / 53.8%
- under 50: 149 / 14.9%
- average score: 56.2
- median score: 53
- high confidence: 6 / 0.6%
- medium confidence: 171 / 17.1%
- low confidence: 823 / 82.3%

Expert-ish pass:
- 90+: 9 / 0.9%
- 80 to 89: 334 / 33.4%
- 70 to 79: 88 / 8.8%
- 60 to 69: 308 / 30.8%
- 50 to 59: 255 / 25.5%
- under 50: 6 / 0.6%
- average score: 68.6
- median score: 62
- high confidence: 136 / 13.6%
- medium confidence: 298 / 29.8%
- low confidence: 566 / 56.6%

Mixed pass:
- 90+: 2 / 0.2%
- 80 to 89: 88 / 8.8%
- 70 to 79: 143 / 14.3%
- 60 to 69: 302 / 30.2%
- 50 to 59: 440 / 44%
- under 50: 25 / 2.5%
- average score: 61.8
- median score: 62
- high confidence: 36 / 3.6%
- medium confidence: 247 / 24.7%
- low confidence: 717 / 71.7%

Inflation checks:
- Random 90+ rate: 0% / max 2% pass
- Expert 90+ rate: 0.9% / max 5% pass
- Mixed 90+ rate: 0.2% / max 3% pass
- Random 80+ rate: 1.2% / max 15% pass
- Expert 80+ rate: 34.3% / max 35% pass
- Mixed 80+ rate: 9% / max 25% pass

Score Distribution QA: PASSED
```

Latest card-line-aware smoke result:

```text
Games per mode: 200
Random 90+: 0%
Expert-ish 90+: 1.5%
Mixed 90+: 0%
Random 80+: 1%
Expert-ish 80+: 27%
Mixed 80+: 11%
Score Distribution QA: PASSED
```

### Scoring model note

The expert-ish simulator now benefits from the same line-shape-aware incoming logic used by virtual Charleston players.

The simulator now uses the structured 2026 card-line database layer through the same scoring and recommendation paths used by the game engine.

The standard command uses a practical launch smoke sample so it can run quickly after code changes. The deep command runs the larger 1,000-game-per-mode sample.

The command uses `calculateIQCore`, a lightweight scoring-only path that follows the same score formulas as the full scorecard engine while skipping UI narrative fields.

## Expert Pass Recommendation QA

Command:

```bash
npm run validate:passes
```

Purpose:

Protect Rackle’s Charleston coaching layer from recommending passes that serious NMJL American Mahjong players would not trust.

This validation checks that Rackle:

- never recommends Jokers
- protects natural pairs when they support the best line
- cuts weak singletons before core pairs
- treats winds, dragons, Flowers, and Soap by rack context
- protects real 2026, Consecutive, Like Numbers, 2468, 13579, 369, Quints, and Singles & Pairs shapes
- avoids protecting every tile in fake-flexibility racks

Latest result:

```text
Pass Recommendation QA
Scenarios tested: 20
Passed: 20
Failed: 0

Pass Recommendation QA: PASSED
```

2026 card-line note:

Pass recommendations now use the structured 2026 card-line database layer for keep weights and line-shape protection.

## Section-Specific Scoring QA

Command:

```bash
npm run validate:scoring
```

Purpose:

Protect Rackle IQ from expert pushback in fragile NMJL sections where broad heuristics can overstate hand strength.

Sections covered:

- Singles & Pairs
- Quints
- Winds & Dragons
- 2026

Latest result:

```text
Score trust validation summary:
{
  "total": 55,
  "passed": 55,
  "failed": 0,
  "passRate": "100%"
}
```

What this protects:

- Singles & Pairs does not become elite from unrelated pair density alone.
- Joker-dependent Singles & Pairs stays risky.
- Quints needs natural anchors, not just Joker hope.
- Winds-only racks are capped without dragon support.
- Scattered single honors do not create fake Winds & Dragons direction.
- 2026 requires balance across 2s, 6s, Soap, and Flowers.
- Missing Soap or missing 2/6 structure lowers the year-hand ceiling.

2026 card-line note:

Section scoring now sits beside the structured 2026 card-line database layer. The database provides section coverage, line-shape fit, missing-needs language, and pass/virtual-player keep weights.

## Practice Variety QA

Command:

```bash
npm run validate:practice-variety
```

### Why this exists

Practice Room should feel believable and varied.

Players should see a healthy mix of racks over time without turning Practice into a visible mode picker or a rigged puzzle.

This validation protects against:

- repetitive practice racks
- impossible tile counts
- honor-heavy practice bias
- too many high-potential racks
- Practice Room affecting Daily Rackle state
- practice incoming tiles creating illegal final racks

### Hidden practice variety model

Practice Room still appears as one simple mode in the UI.

Behind the scenes, Rackle now rotates through subtle rack archetypes:

- Random realistic rack
- Messy rack
- Consecutive-leaning rack
- Like Numbers-leaning rack
- Pair-heavy rack
- Honors-leaning rack
- Strong but unfinished rack

These archetypes are intentionally subtle.

The goal is variety, not a puzzle mode.

### What it tests

The validation generates 500 Practice Room racks and reports:

- unique rack signatures
- repeated rack count
- average starting potential score
- score band distribution
- leading section distribution
- Joker count distribution
- honor-heavy rack count
- pair-heavy rack count
- impossible duplicate count
- rack-state failures after 3 simulated Charleston passes
- Daily Rackle independence

The script also runs each generated practice rack through `validateRackState` after 3 simulated Charleston passes.

### Latest result

```text
Practice Variety QA
Practice racks tested: 500
Unique racks: 500
Repeated racks: 0
Average score: 65.2

Score bands:
- 90+: 0 / 0%
- 80 to 89: 86 / 17.2%
- 70 to 79: 122 / 24.4%
- 60 to 69: 124 / 24.8%
- 50 to 59: 87 / 17.4%
- under 50: 81 / 16.2%

Leading section distribution:
- 2026: 5
- Like Numbers: 177
- Consecutive: 137
- 2468: 54
- 13579: 45
- 369: 29
- Winds & Dragons: 40
- Quints: 3
- Singles & Pairs: 3
- Single Suit: 7

Joker count distribution:
- 0 Jokers: 275
- 1 Joker: 175
- 2 Jokers: 46
- 3 Jokers: 4

Risk checks:
- impossible duplicates: 0
- rack-state failures: 0
- honor-heavy racks: 22
- pair-heavy racks: 31
- all-honor impossible racks: 0
- 90+ rate: 0%
- repeated signature rate: 0%

Practice Variety QA: PASSED
```

### Launch expectation

- Practice racks should be varied.
- Practice racks should stay legal.
- Practice should include some strong, messy, honor, pair, and run-shaped racks.
- Practice should not flood players with 90+ starting potential.
- Practice should not affect Daily Rackle.
- Practice scores should remain local and should not post to leaderboards.
