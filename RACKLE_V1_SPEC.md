# Rackle v1 Spec
_Working reference — updated as decisions are made_

---

## Product Positioning

**Wordle for American Mahjong.**

One rack. One Charleston. One score to chase. Same rack for every player, every day.

---

## Platform

- **Web app** — React, same stack as current
- **PWA-ready** — installable on mobile home screen
- **No native app for v1**
- **Database** — Supabase (already connected)

---

## Architecture

### Directory structure

```
src/
├── engine/
│   ├── scoring.js        — IQ calc, reveal frames, style names, trust read
│   ├── storage.js        — ST get/set, history, streak, profile, club code
│   ├── leaderboard.js    — fetch functions, rank utilities, merge/sort
│   ├── game.js           — Charleston pass logic, tile evaluation, day/seed
│   └── supabase.js       — Supabase client init, shared query helpers
│
├── design/
│   ├── tokens.css        — All CSS custom properties (colours, type, spacing, radius, shadow)
│   └── components.css    — Component-level styles (Button, Card, Pill, Tile, Header, etc.)
│
├── components/
│   ├── shared/
│   │   ├── RackleHeader.jsx
│   │   ├── Footer.jsx
│   │   ├── ScoreHeroCard.jsx
│   │   ├── Tile.jsx          — Skinnable tile atom
│   │   ├── TileTheme.jsx     — Context provider for tile skins
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Pill.jsx
│   └── screens/
│       ├── Home.jsx
│       ├── Game.jsx
│       ├── DailyScorecard.jsx
│       ├── PracticeScorecard.jsx
│       ├── Leaderboard.jsx
│       ├── ClubRoom.jsx
│       ├── ClubDirectory.jsx
│       ├── HandBrowser.jsx
│       ├── Tutorial.jsx
│       ├── Profile.jsx
│       └── Settings.jsx
│
└── App.jsx               — Routing shell only (~100 lines)
```

### Key principles

- **Engine is pure JS** — no React, no JSX, fully testable in isolation
- **No hardcoded values** — all colours, sizes, spacing from tokens only
- **No `!important`** — specificity managed by structure, not overrides
- **No inline styles** — all styling via CSS classes and tokens
- **Components are small** — one file, one job, one clear name

---

## Design System

### Colour tokens

```css
:root {
  /* Page */
  --color-bg-page:     #F5F2EC;
  --color-surface:     #FFFFFF;
  --color-surface-2:   #EDE7DA;

  /* Text */
  --color-ink:         #1A1410;
  --color-ink-muted:   #6B6157;
  --color-ink-subtle:  #9A8F85;

  /* Brand accents */
  --color-jade:        #176B42;
  --color-jade-light:  rgba(23, 107, 66, 0.06);
  --color-gold:        #A07828;
  --color-cinn:        #B02A2A;

  /* Borders */
  --color-border:      #DDD6C8;
  --color-border-soft: rgba(26, 20, 16, 0.08);

  /* Tagline */
  --color-tagline:     #7a8c6e;
}
```

### Typography tokens

```css
:root {
  --font-display: 'Fraunces', Georgia, serif;   /* Wordmark, headings, scores */
  --font-body:    'Nunito', 'Segoe UI', sans-serif; /* UI, labels, copy */

  /* Scale */
  --text-xs:   10px;
  --text-sm:   12px;
  --text-base: 14px;
  --text-md:   16px;
  --text-lg:   20px;
  --text-xl:   24px;
  --text-2xl:  32px;
  --text-3xl:  48px;
}
```

### Google Fonts import

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,900&family=Nunito:wght@400;700;900&display=swap" rel="stylesheet"/>
```

### Spacing scale

Base unit: 4px

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

### Radius and shadow

```css
:root {
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  18px;
  --radius-xl:  24px;
  --radius-full: 999px;

  --shadow-sm:  0 1px 4px rgba(26,20,16,0.06);
  --shadow-md:  0 4px 14px rgba(26,20,16,0.08);
  --shadow-lg:  0 8px 24px rgba(26,20,16,0.10);
}
```

---

## Component Library

### Button variants

| Variant   | Use case                        |
|-----------|--------------------------------|
| `primary` | Main CTA — Play, Share, Submit  |
| `secondary` | Secondary action               |
| `ghost`   | Tertiary, nav, back             |
| `icon`    | 36×36px square icon buttons     |

Icon button spec:
- Size: 36×36px
- Border-radius: 10px
- Background: `rgba(26,46,26,0.06)`
- No border

### Tile component — skinnable

The `<Tile>` component reads from `TileTheme` context. A skin is a plain JS object:

```js
const defaultSkin = {
  background:   '#FFFDF8',
  border:       '#DDD6C8',
  numberColor:  '#1A1410',
  suitColor:    '#176B42',
  fontFamily:   'Fraunces, serif',
  logo:          null,   // Optional: sponsor logo URL overlaid on tile back
};

const sponsorSkin = {
  background:   '#FFFFFF',
  border:       '#C8A800',
  numberColor:  '#1A1410',
  suitColor:    '#C8A800',
  fontFamily:   'Fraunces, serif',
  logo:          '/skins/sponsor-logo.svg',
};
```

`TileTheme` wraps the whole app. Switching skins is one state change. New skins are one file with no component changes.

---

## Screen List (v1)

### Core game loop
1. **Homepage** — adaptive (see below)
2. **Charleston gameplay** — tile passing mechanic
3. **Daily scorecard** — score, IQ, rank
4. **Practice / free play** — same gameplay, no daily board impact
5. **Practice scorecard**

### Reference & onboarding
6. **Hand browser** — 2026 National Mah Jongg League card
7. **Tutorial / how to play** — onboarding for new players

### Social & identity
8. **Leaderboard** — Rackle Global + club room tabs
9. **Club room** — club-specific leaderboard and activity
10. **Club directory** — browse and join clubs
11. **Profile** — nickname, club, stats

### Utility
12. **Settings**

### Deferred to v2
- Stats / history screen

---

## Adaptive Homepage

Detects player state and shows the appropriate view. Three states:

### State 1 — New player (no profile, first visit)
- Welcome message, one-line pitch: "Wordle for American Mahjong"
- Today's rack teaser (visible but not playable until nickname set)
- Two-step onboarding: set nickname → find your club (or skip → Rackle Global)
- CTA: Play today's Rackle

### State 2 — Returning player, hasn't played today
- Today's rack front and centre, day number and date
- Streak on the line (if active) — prominent visual pressure
- Club/Global leaderboard showing who's already posted
- CTA: Play today's Rackle

### State 3 — Returning player, already played today
- Their score and rank front and centre (IQ score hero card)
- Leaderboard with their position highlighted
- Tomorrow's reset timer
- Share score button (prominent)
- Practice mode as secondary CTA

### Social surface — which room shows first
- **No club → Rackle Global** is the default room. Everyone has a home from day one.
- **Has club → Club room** is primary. Rackle Global accessible but secondary.

---

## Club Model

### Access
- Every player is in **Rackle Global** by default
- Enter a club code to affiliate with a specific club
- One club per player in v1
- Club affiliation stored in profile, persists across sessions

### Score posting
- Play the daily → score posts to **Rackle Global automatically**
- If club-affiliated → score also posts to **club room automatically**
- One score, two leaderboards. No extra player action required.

### Club directory
- Browsable list of all clubs
- Search by name
- Each club shows: name, member count, today's activity
- Enter code to join

### Club URLs
```
playrackle.com/clubs/apex-mahjong-club
playrackle.com/clubs/charleston-table
```
- Shareable direct link — pre-fills club code on landing
- "Join this club →" one-tap flow
- Indexed by search engines (SEO)
- Club captains share link in group chat → instant onboarding

### Club page content
- Today's leaderboard
- Top score, streak leaders, most active player
- "Invite your table" share button with pre-filled message
- Club stats over time (v2)

---

## Score Sharing

Sharing is the primary growth mechanic. Pre-filled via Web Share API (native share sheet on mobile) with clipboard copy fallback.

### Share message format
```
Rackle #42 🀄
IQ Score: 847
Global: #12  ·  Apex: #3
3-day streak 🔥

Can you beat it?
playrackle.com/daily/42
```

- Short enough to read in a group chat preview
- Hook is the rank (social pressure)
- Link drives new players directly to that day's puzzle

### Share surfaces
- **Scorecard** — primary, prominent button
- **Homepage completed state** — secondary share nudge
- **Club page** — "Invite your table" with pre-filled club link
- **Streak milestones** — auto-prompt on 7d, 14d, 30d streaks

### Club invite message format
```
I'm playing Rackle with Apex Mahjong Club 🀄
Same rack for everyone, daily score to chase.

Join our club → playrackle.com/clubs/apex-mahjong-club
```

---

## SEO

Baked in from day one — not retrofitted.

### Per-screen metadata

| Screen | Title | Description |
|--------|-------|-------------|
| Homepage | Rackle — The Daily American Mahjong Game | One rack. One Charleston. One score to chase. Daily American Mahjong for your whole table. |
| Daily puzzle | Rackle #42 — Daily American Mahjong | Play today's rack, get your IQ score, and see how you rank on the global board. |
| Club page | Apex Mahjong Club on Rackle | Apex Mahjong Club's daily leaderboard and scores on Rackle. |
| Hand browser | 2026 Mah Jongg Card — Hand Browser | Browse every hand on the 2026 National Mah Jongg League card. |

### Open Graph (social sharing previews)
- `og:title`, `og:description`, `og:image` on every screen
- Score share pages get dynamic OG image with score, rank, day number
- Club pages get club-specific OG image

### Technical SEO
- Semantic HTML throughout (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`)
- Canonical URLs per screen
- Sitemap.xml
- robots.txt
- JSON-LD structured data for the game
- Fast load — clean CSS, no legacy stylesheet weight

### URL structure
```
playrackle.com/                          — Homepage
playrackle.com/daily/42                  — Day 42 puzzle (shareable)
playrackle.com/clubs/                    — Club directory
playrackle.com/clubs/apex-mahjong-club  — Club page
playrackle.com/hands/                    — Hand browser
playrackle.com/how-to-play              — Tutorial
```

---

## Tile Skin System

Designed for sponsors and seasonal variants.

### How it works
- `TileThemeProvider` wraps the app at root level
- Active skin passed as context — any component that renders tiles reads it automatically
- Skin = a plain JS object (token overrides map)
- Adding a new skin = one new file, zero component changes

### Skin spec
```js
{
  background:     string,   // Tile face background
  border:         string,   // Tile border colour
  numberColor:    string,   // Number/character colour
  suitColor:      string,   // Suit symbol colour
  fontFamily:     string,   // Tile typography
  logo:           string|null, // Optional sponsor logo overlaid on tile
  tileBack:       string,   // Tile back face (colour or image URL)
}
```

### Sponsor skin application
- Sponsor colours and logo applied to tile face and/or back
- "Today's game presented by [Sponsor]" header treatment
- All tile renders across gameplay, scorecard, and hand browser update simultaneously

### Built-in skins for v1
- `default` — current warm mahjong aesthetic
- Slot ready for first sponsor skin

---

## Build Order

1. **Design tokens** — `tokens.css`, Google Fonts, colour/type/spacing system
2. **Component library** — Button, Card, Pill, Tile (with skin system), RackleHeader, Footer
3. **Engine extraction** — move all pure logic to `engine/` files, verify nothing breaks
4. **Routing shell** — strip `App.jsx` to ~100 lines
5. **Screens (in order):**
   - Homepage (all three adaptive states)
   - Charleston gameplay
   - Daily scorecard
   - Practice / free play
   - Practice scorecard
   - Leaderboard + club room
   - Club directory + club pages
   - Profile
   - Hand browser
   - Tutorial / onboarding
   - Settings
6. **SEO layer** — metadata, OG tags, sitemap, JSON-LD
7. **Sharing** — Web Share API, clipboard fallback, pre-filled messages
8. **QA** — full player loop, engine behaviour verification
9. **Deploy**

---

## Deferred to v2

- Stats / score history screen
- Multiple club memberships
- Seasonal tile skins
- Premium / club captain features
- Native app

---

## Supabase

Already connected. Key responsibilities in v1:

- **Score posting** — daily and practice scores written on completion
- **Leaderboard reads** — global and club boards pulled from Supabase in real time
- **Club data** — club directory, membership, activity counts
- **Profile** — nickname, club code, stored server-side (local storage as cache)
- **Streak** — server-side source of truth, local storage as fallback

### Engine integration
All Supabase calls live in `engine/supabase.js` (client init) and `engine/leaderboard.js` (queries). No Supabase imports in screen components — screens call engine functions only. This keeps the data layer swappable and testable.

### Club URL → Supabase lookup
`playrackle.com/clubs/apex-mahjong-club` — the slug maps to a Supabase club record. Club page loads data server-side for SEO indexing.

---

_Last updated: May 2026_
