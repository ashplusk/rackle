# Rackle Pass Recommendation QA

Rackle’s pass recommendations should feel believable to serious NMJL American Mahjong players.

This QA suite protects the coaching layer. It checks that Rackle recommends Charleston passes according to practical table-read principles, not raw tile cleanup.

## Command

```bash
npm run validate:passes
```

## What this protects

The validation suite checks that Rackle:

- never recommends Jokers as pass tiles
- protects useful natural pairs
- prefers weak singletons before core pairs
- treats winds and dragons by context
- protects Soap only when 2026 is realistic
- treats Flowers by context, not as automatic keeps
- protects meaningful Consecutive, Like Number, 2468, 13579, and 369 shapes
- protects Quints anchors when they are real
- avoids pretending fake flexibility is strong structure
- labels painful recommendations as least-damaging when needed

## Expert rules covered

### 1. Joker rule

Jokers can appear in the starting rack and final rack.

They should never appear in outgoing pass recommendations.

### 2. Pair protection

A natural pair should stay protected when it supports the best line.

A pair can become passable only when it is clearly off-path and better singletons are not available.

### 3. Honor logic

Honors are not automatically good or bad.

- Isolated winds can be passed outside Winds & Dragons.
- Paired winds should be protected when Winds & Dragons is live.
- Isolated dragons can be passed when unsupported.
- Paired dragons should be protected when they match the section logic.

### 4. Flower logic

A single Flower should not always be protected.

Flowers matter more when they support 2026, Singles & Pairs, or honor-heavy shapes.

### 5. Soap and 2026 logic

Soap is protected when the year core is real.

A lone Soap without 2s, 6s, or Flowers should not force a year-hand read.

### 6. Ambiguous racks

When several paths are close, Rackle should recommend tiles that damage the fewest realistic paths.

When every pass hurts, the recommendation should feel like the least damaging option, not an obvious cut.

## Scenario library

Current scenarios: 20

| ID | Scenario | Core expectation |
|---|---|---|
| A | Joker in rack | Joker is never recommended |
| B | Strong Consecutive pair | Pair and run core are protected |
| C | Pair-heavy Like Numbers | Weak singletons leave before same-number pairs |
| D | Isolated wind outside Winds path | Isolated wind can be recommended |
| E | Paired wind with W&D path | Paired wind is protected |
| F | Lone unsupported dragon | Lone dragon can be recommended |
| G | Paired dragon with honor logic | Paired dragon is protected |
| H | Soap plus 2s and 6s | Soap is protected for real 2026 shape |
| I | Lone Soap only | Soap is not overprotected |
| J | Single Flower with no section support | Flower can be recommended |
| K | Flower with 2026 support | Flower is protected |
| L | Consecutive run forming | Connected run tiles are protected |
| M | Like Numbers forming | Same-number core is protected |
| N | 2468 forming | Even lane is protected |
| O | 13579 forming | Odd lane is protected |
| P | 369 overlap | 3-6-9 core is protected where meaningful |
| Q | Quints with Joker and anchor | Natural anchor is protected |
| R | Quints dream without anchor | Jokers alone do not protect everything |
| S | Many pairs, unclear exact line | Weak non-pairs leave first |
| T | Fake flexibility rack | Rackle still makes a cut |

## Latest result

```text
Pass Recommendation QA
Scenarios tested: 20
Passed: 20
Failed: 0

Pass Recommendation QA: PASSED
```

## 2026 card-line database update

Pass recommendations now use Rackle's structured 2026 card-line database layer for keep weights.

The recommendation engine protects tiles tied to:

- real section line shapes
- concealed Singles & Pairs risk
- Joker-eligible Quints structure
- balanced 2026 year cores
- Winds & Dragons balance
- Consecutive, Like Numbers, 2468, 13579, and 369 lanes

Before launch, verify the manually structured specs against the physical 2026 card one final time.
