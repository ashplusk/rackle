# Rackle Codebase Map
_Read-only reference — do not edit_

---

## 1. Global CSS Variables & Design Tokens

### Colour tokens — JavaScript object `C`
**File:** `src/App.jsx`

| Token | Value | Role |
|-------|-------|------|
| `C.bg` | `#F8F4EE` | Default page background |
| `C.bg2` | `#EDE7DA` | Secondary background |
| `C.ink` | `#1A1410` | Body text |
| `C.mut` | `#6B6157` | Muted / secondary text |
| `C.jade` | `#176B42` | Primary green accent |
| `C.gold` | `#A07828` | Gold accent |
| `C.cinn` | `#B02A2A` | Cinnamon / red accent |
| `C.bdr` | `#DDD6C8` | Border colour |

### Typography tokens — JavaScript object `F`
**File:** `src/App.jsx`

| Token | Value | Role |
|-------|-------|------|
| `F.d` | `'Fraunces', Georgia, serif` | Display / headings |
| `F.b` | `'Nunito', 'Segoe UI', sans-serif` | Body / UI |

### CSS custom properties
**File:** `src/rackle.css` (around line 4021)

| Property | Value |
|----------|-------|
| `--rk-paper` | `#F8F4EE` |
| `--rk-ink` | `#1A1410` |

Dark scorecard gradients (used for score-card overlays, not page backgrounds):
- `linear-gradient(150deg, #062B18 0%, #0D4A2E 55%, #051F11 100%)` — `.rk-dash-card-dark`

---

## 2. Page Background Colours by Route

All four routes share the same light background (`#F8F4EE` / `C.bg`). The dark gradient only appears inside individual score-card overlay elements, not at the page level.

| Route | Function in App.jsx | Page-level background | Where it is set |
|-------|--------------------|-----------------------|-----------------|
| **Homepage** `/` | `Home` (≈ line 11454) | `#F8F4EE` | Inline style on outer container; CSS class `.rk-outer { background: #F8F4EE !important }` |
| **Daily scorecard** | `ScorecardScreen` | `#F8F4EE` (page); dark gradient inside score cards | Page wrapper inline style via `C.bg`; card background via `.rk-dash-card-dark` in `rackle.css` line 521 |
| **Practice gameplay** | `Game` (≈ line 12272) | `#F8F4EE` | Inline style on `.rk-game-shell` container |
| **Practice scorecard** | Rendered from `onDone` callback inside `Game` | `#F8F4EE` (page); dark gradient inside summary cards | CSS class `.rk-practice-v9-shell.rk-scorecard-clean-v120`; card background in `rackle.css` ≈ line 5805 |

---

## 3. Hero Card Component

### Primary hero card — Homepage only
**File:** `src/App.jsx`  
**Function:** `TodayRackleHeroCard` (≈ line 11197)

- Large card displaying today's daily puzzle hand and stats.
- Background: `linear-gradient(160deg, ${C.hero1}, ${C.hero2}, ${C.hero3})`.
- CSS classes: `.rk-daily-entry-v6`, `.rk-daily-entry-v11`, `.rk-daily-entry-v21`.
- Stats grid: `.rk-daily-hero-stats` (`display: grid; grid-template-columns: repeat(3, 1fr)`).
- **Not shared.** This component is unique to the homepage.

### Practice-page clone
**File:** `src/App.jsx` (inside `Game` / practice scorecard flow)  
**CSS class:** `.rk-practice-homeclone-v45`

- A visually similar card used on the practice scorecard.
- Duplicated, not imported from `TodayRackleHeroCard`.

---

## 4. Button Components

Buttons are **not extracted into a shared component**. They are defined as inline style objects inside the `S` (styles) object in `src/App.jsx` (≈ lines 42–47) and as CSS utility classes in `src/rackle.css`.

### Inline style objects (`S` object) — `src/App.jsx`

| Key | Appearance |
|-----|-----------|
| `S.greenBtn` | Green gradient `linear-gradient(135deg, ${C.jade}, #0F5432)` |
| `S.passBtn` | Red/cinnamon gradient `linear-gradient(135deg, ${C.cinn}, #8A2020)` |
| `S.oBtn` | Neutral beige |
| `S.back` | Jade-tinted back button `rgba(23,107,66,.06)` |
| `S.sortBtn` | Small light-gradient sort button |

### CSS button classes — `src/rackle.css`

| Class | Line | Role |
|-------|------|------|
| `.rk-dash-cta-primary` | ≈ 534 | Primary call-to-action button |
| `.rk-dash-text-link` | ≈ 537 | Text-style link button |
| `.rk-score-clean-action-v120` | ≈ 7687 | Action buttons on score screens |

---

## 5. Tile Grid Component

### Tile atom — `Ti`
**File:** `src/App.jsx`  
**Function:** `Ti` (≈ line 5898)  
**CSS class:** `.rk-mahjong-tile`

Individual letter tile. Sizing, selection, and state styling:

| CSS class | File | Line | Effect |
|-----------|------|------|--------|
| `.rk-mahjong-tile` | `rackle.css` | ≈ 4681 | Base tile: `48 × 68 px` |
| `.rk-tile-selected` | `rackle.css` | ≈ 4685 | Selected state: jade border |
| `.rk-tile-received` | `rackle.css` | ≈ 4688 | New/received state: gold border |
| `.rk-tile-locked` | `rackle.css` | ≈ 4692 | Locked state: `cursor: not-allowed` |

Mobile overrides (smaller dimensions `30 × 42 px`) at `rackle.css` ≈ line 2484.

### Rack surface — `RackSurface`
**File:** `src/App.jsx`  
**Function:** `RackSurface` (≈ line 5942)  
**CSS class:** `.rk-rack-surface`

Flex container that lays out tiles in rows. Used as the interactive play area during gameplay.

### Received-tiles row
**CSS class:** `.rk-received-tiles-row`  
**File:** `rackle.css` (≈ lines 2471–2480, 5673–5690)

Horizontal row displaying tiles dealt to the player during a game round.

---

## File Index

```
src/
├── App.jsx          — All page functions, all component definitions,
│                      colour/font token objects (C, F), button style object (S)
│                      Key functions:
│                        Home                    (homepage)
│                        TodayRackleHeroCard     (homepage hero card)
│                        ScorecardScreen         (daily scorecard)
│                        Game                    (practice gameplay + practice scorecard)
│                        Ti                      (tile atom)
│                        RackSurface             (tile grid container)
│
└── rackle.css       — All CSS: custom properties, layout, tile sizing,
                       button classes, card gradients, responsive overrides
```
