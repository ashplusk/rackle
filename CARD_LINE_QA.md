# Rackle 2026 Card-Line QA

## Purpose

This document tracks the final manual QA pass for Rackle's structured 2026 NMJL card-line database.

The goal is to make sure Rackle's internal card-line layer reflects the 2026 card images supplied by the product owner and supports:

- section fit
- best realistic paths
- pass recommendation protection
- missing-needs language
- virtual Charleston pass behavior

This is an internal QA document. It does not render card text in the product UI.

## Review status

Review date: 2026-05-23

Source reviewed:

- owner-provided 2026 card images
- `src/engine/nmjl-2026-card-lines.js`
- `src/engine/card-line-validation.js`
- `src/engine/game.js`
- `SCORE_TRUST_TEST_LIBRARY.md`
- `SCORING_CALIBRATION_NOTES.md`
- `PASS_RECOMMENDATION_QA.md`

## Coverage reviewed

Rackle now has 57 total card-line specs:

- 54 physical 2026 card line specs from the supplied images
- 3 internal Single Suit support lanes used only for Charleston read protection

Section coverage:

| Section | Specs |
|---|---:|
| 2026 | 4 |
| 2468 | 8 |
| Like Numbers | 3 |
| Quints | 3 |
| Consecutive Run | 8 |
| 13579 | 8 |
| Winds & Dragons | 8 |
| 369 | 6 |
| Singles & Pairs | 6 |
| Single Suit support | 3 |

## Fixes made

### 1. Replaced broad generated specs

The previous card-line database generated broad pattern families.

That made Rackle more line-aware than section-only logic, but it did not directly mirror the physical card image structure.

This pass replaced that broad generated database with a tighter structured database:

- one internal spec per printed physical line where possible
- variant-aware specs where a printed line has an `or` variation
- internal tags for physical vs support-only lines
- exact section counts validated by script

### 2. Added family-aware matching

Some NMJL lines are flexible, such as:

- any like number
- any suit
- any consecutive run
- any matching dragon

The engine now supports family-aware matching for flexible line shapes instead of counting all suited tiles too broadly.

Added support for:

- best like-number family matching
- best same-suit number family matching
- better support-key selection for pass protection

### 3. Tightened Joker handling for concealed lines

Singles & Pairs and concealed-style lines now apply stronger card-line fit penalties when Jokers appear.

This protects Rackle from treating Joker-supported concealed shapes as too ready.

### 4. Tightened year-hand Soap handling

2026 year lines now treat Soap as a critical zero requirement where relevant.

This protects year hands from over-scoring when a rack has 2s and 6s but no Soap.

### 5. Tightened broad even-line matching

The broad 2468 stacked-even line no longer beats more specific dragon/even structures just because a rack has many even tiles.

This helps the engine protect dragons where the card line calls for dragon structure.

## QA scenarios added

`npm run validate:card-lines` now checks 18 scenarios:

- exact 2026 year core
- near 2026 shape missing Soap
- exact 2468 shape
- 2468 dragon-supported shape
- Like Numbers flower-supported line
- Like Numbers dragon-supported line
- Quints with Joker fuel and natural anchor
- Quints without Joker fuel
- Consecutive Run exact shape
- Consecutive Run dragon-middle shape
- 13579 exact shape
- 13579 concealed dragon-supported shape
- wind-heavy Winds & Dragons shape
- Winds & Dragons year/Soap shape
- exact 369 shape
- 369 flower/dragon-supported shape
- Singles & Pairs exact concealed shape
- Singles & Pairs with Joker penalty

## Commands

Run card-line QA:

```bash
npm run validate:card-lines
```

Run the full fast game-engine QA:

```bash
npm run validate:game-engine
```

Run scoring trust QA:

```bash
npm run validate:scoring
```

Run pass recommendation QA:

```bash
npm run validate:passes
```

Run score distribution QA:

```bash
npm run validate:score-distribution
```

## Latest validation result

Card-line QA:

```text
Card-Line Database QA: PASSED
Total card-line specs: 57
Physical card specs: 54
Internal support specs: 3
Scenario tests: 18
Passed: 18
Failed: 0
```

Scoring trust QA:

```text
55 / 55 passing
```

Pass recommendation QA:

```text
20 / 20 passing
```

Score distribution QA:

```text
PASSED
```

Production build:

```text
PASSED
```

## Remaining manual review items

No blocking card-line QA issues remain from this pass.

Before a broad public launch, one final human review against the physical card is still recommended for:

- printed-line transcription accuracy
- any subtle suit-color constraints not visible from the images
- dragon matching vs opposite-dragon interpretation
- concealed/exposed assumptions
- values shown on the physical card

The current engine is launch-safe for founding club testing.
