# Rackle Scoring Calibration Notes

## Validation result

- Validation suite: `npm run validate:scoring`
- Test cases: 39
- Passing: 39
- Failing: 0
- Pass rate: 100%

## What changed

### Fake flexibility tightened

- Lowered value for scattered odd-number tiles across multiple suits.
- Lowered value for Like Numbers when the rack only has one loose duplicate.
- Added ambiguity handling in the validation runner so low-confidence racks do not pretend there is one obvious answer when several weak sections are clustered together.

### Wrong direction scoring tightened

- Existing hard caps now work with the new calibration layer.
- Unsupported chosen directions remain capped in the mixed/weak bands.
- Correct but weak directions can still receive a fair floor, so the app does not over-punish a playable but thin read.

### Joker inflation tightened

- Jokers now help Quints only when there are natural duplicate anchors.
- Quints are capped unless natural group structure is present.
- Singles & Pairs with Jokers receives a stronger penalty.
- Loose Joker racks stay in the low/mixed bands.

### Section logic improved

- Winds-heavy racks with no dragons continue to label as `Winds` instead of `Winds & Dragons`.
- Like Numbers now outranks 2468 when repeated same-number density is the real signal.
- Quints now outranks Like Numbers only when Joker support is paired with real natural anchors.
- Consecutive Run now avoids over-rewarding split-suit visual sequences.

### Score rarity improved

- 90+ remains rare.
- Strong but imperfect structures are capped in the low-to-mid 80s when they lack exactness.
- Many-pair racks no longer get treated as automatically elite.
- Year hands, Winds & Dragons, Single Suit, and Quints now have realism caps unless the rack is truly exceptional.

### Confidence improved

- High confidence now requires more than raw hand strength. The rack needs strong decision quality, low deadness risk, clear enough exact support, no major pass mistake, and no lucky rescue dependency.
- Medium confidence is now used for strong but ambiguous reads, Joker-supported Quints without perfect natural structure, many-pair racks, lucky receives after mixed passes, and section overlaps such as 369 / Consecutive / Like Numbers.
- Low confidence is preserved for wrong selected directions, fake flexibility, scattered racks, high-risk dead tile burden, and reads that conflict with the rack’s actual table signal.
- The validation runner now treats confidence as part of pass/fail, so the 39-case score trust library verifies score range, best section, and expert confidence behavior together.

## Known tradeoffs

- Low-confidence racks may validate on score and ambiguity rather than exact best-section match, because the engine should not pretend every rack has a clear section winner.
- The engine remains section-level rather than exact NMJL card-line solving.
- Exact hand-line scoring can be improved later with a full card-line model.

## Current calibration standard

A score now reflects:

- pass quality
- direction accuracy
- final rack quality
- convergence
- dead tile burden
- Joker realism
- luck versus controlled decision quality

The key regression case now stays mixed:

- Consecutive Run selected
- honor-heavy final rack
- strongest signal elsewhere
- expected score: low-to-mid 50s

## Score distribution validation

Added score distribution QA to protect Rackle IQ from score inflation.

Command:

```bash
npm run validate:score-distribution
```

Latest 1,000-game-per-mode result:

- Random legal pass: 90+ = 0%, 80+ = 1.2%, average score = 56.2
- Expert-ish pass: 90+ = 0.9%, 80+ = 34.3%, average score = 68.6
- Mixed pass: 90+ = 0.2%, 80+ = 9%, average score = 61.8

Current read:

- 90+ scores remain rare.
- Expert-ish passing improves results without making elite scores common.
- Mixed passing sits between random and expert-ish behavior.
- High confidence does not dominate random play.

No score calibration changes were required for this pass.


## Virtual Charleston pass realism

Virtual Charleston players now use line-shape-aware keep profiles instead of broad section support only.

For each virtual rack, Rackle scores the rack, identifies the top two reads, then protects realistic anchors inside those reads before selecting pass tiles.

Protected structures include 2026 cores, same-suit Consecutive windows, Like Number clusters, Quints natural anchors, paired Winds & Dragons, 3-6-9 cores, even/odd lanes, Singles & Pairs natural pairs, and dominant Single Suit lanes.

This improves incoming tile realism while keeping the model lightweight enough for daily and practice play.

## Section-specific scoring tightening

Added a precision calibration pass for the sections most likely to create expert pushback:

- Singles & Pairs
- Quints
- Winds & Dragons
- 2026

What changed:

- Singles & Pairs now rewards natural pair density but caps broad unrelated pair piles below elite territory.
- Joker-dependent Singles & Pairs reads are capped more aggressively because Jokers do not complete concealed pair shapes.
- Quints now requires a real natural anchor before Joker support can create a strong read.
- Honor-heavy duplicate racks no longer default to Quints when Winds & Dragons is the more natural table read.
- Winds-only racks stay capped when dragon support is missing.
- Winds & Dragons now rewards paired honors and dragon balance more than isolated honor clutter.
- 2026 now requires better balance across 2s, 6s, Soap, and Flowers.
- Missing Soap, missing 2s, or missing 6s now lowers the 2026 ceiling.
- Confidence stays stricter for fragile year hands, broad many-pair racks, and Joker-supported Quints without enough natural structure.

Validation added:

- 16 new section-specific scoring scenarios
- Score trust library expanded from 39 to 55 scenarios

Latest result:

```text
npm run validate:scoring
55 / 55 passing
```

No Supabase schema changes were made.
No UI changes were made.

2026 card-line database update:

Rackle now includes a structured 2026 card-line database layer based on the 2026 card images provided for this build. The engine uses line IDs, section mapping, tile requirements, concealed flags, Joker eligibility, and keep weights rather than broad section labels alone.

The card-line layer now supports:

- score section fit
- pass recommendation keep weights
- virtual Charleston player pass behavior
- missing-needs language
- card-line QA validation

Validation added:

```bash
npm run validate:card-lines
```

Latest result:

```text
Card-Line Database QA: PASSED
Total card-line specs: 127
```

Before launch, verify the manually structured line specs against the physical 2026 card one final time.


## Score distribution command note

`npm run validate:score-distribution` now runs the practical card-line-aware smoke sample.

Use this for the larger launch QA sample:

```bash
npm run validate:score-distribution:deep
```
