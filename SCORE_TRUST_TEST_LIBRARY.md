# Rackle Score Trust Test Library

This internal test library lives at:

`src/engine/charleston-scoring-validation.js`

Run it with:

```bash
npm run validate:scoring
```

The library covers 55 NMJL American Mahjong Charleston scenarios across:

- strong and fake Consecutive Run reads
- strong and fake 2468 reads
- 13579, Like Numbers, 369, Year, Winds, Dragons, Quints, Singles & Pairs
- Joker traps
- wrong direction caps
- lucky receives after bad passes
- bad receives after good passes
- pair-passing penalties
- dead tile burden
- concealed risk and exposure realism
- exact card-line fit and rare elite score calibration
- section-specific tightening for Singles & Pairs, Quints, Winds & Dragons, and 2026

Each scenario includes:

- starting rack
- pass sequence
- received tiles
- final rack
- selected direction
- expected best section
- expected score range
- expected confidence
- coach themes

This is not a player-facing feature. It is a launch quality tool for score trust.


## Latest section-specific expansion

Added 16 scenarios to reduce expert pushback in fragile sections:

- clean natural Singles & Pairs
- many unrelated pairs capped below elite
- Joker-dependent Singles & Pairs
- Like Numbers beating broad pair density
- Quints with natural anchors
- Quints without enough natural structure
- true Winds & Dragons
- winds-only capped without dragons
- scattered single honor clutter
- paired dragon with wind support
- balanced 2026
- missing Soap 2026 cap
- lone Soap overfit prevention
- 2-heavy but no 6s
- flowers plus weak year core

Latest result:

```text
npm run validate:scoring
55 / 55 passing
```
