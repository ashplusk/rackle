# Rackle Mobile-Only Polish QA

## Scope

This pass tightens Rackle for real phone widths without changing game logic, scoring, leaderboard rules, routes, Supabase schema, or the global design system.

Target widths:

- 320px
- 375px
- 390px
- 414px
- 430px

## Pages covered

- Homepage
- Daily game
- Practice room
- Daily scorecard
- Practice scorecard
- Leaderboard
- Club room
- Club directory
- Club signup
- Founding clubs page styling shared through cards/forms
- Settings
- Profile
- Login
- Signup
- Forgot password
- Feedback page

## Changes made

### Global mobile shell

- Reduced mobile page padding at narrow widths.
- Added safe-area padding for iPhone bottom spacing.
- Prevented horizontal overflow across app shells.
- Set mobile inputs to 16px to avoid iOS zoom.
- Normalized buttons to at least 46px high.

### Homepage

- Tightened hero spacing on phones.
- Reduced tile scale at narrow widths.
- Kept the purple table-board section contained within the viewport.
- Stacked leaderboard actions on mobile.
- Improved row truncation so scores stay visible.

### Gameplay

- Reduced rack gaps and tile sizes at 430px, 375px, 340px, and 320px.
- Kept the rack centered with no horizontal scroll.
- Tightened game bar spacing.
- Improved pass tray fit on narrow screens.
- Added safe-area spacing under the primary game CTA.

### Scorecards

- Reduced score hero padding on mobile.
- Kept the score ring as the hero without crowding tiles.
- Improved hand tile wrapping.
- Stacked pass-by-pass columns on mobile.
- Stacked share actions and guest nudge.
- Kept share card within viewport.

### Leaderboards

- Made rows fit narrow screens.
- Hid non-essential avatar detail where space is tight.
- Truncated names cleanly.
- Kept rank and score visible.
- Stacked empty/error state buttons where needed.

### Forms and auth

- Inputs are full width.
- Labels and errors remain readable.
- Form grids collapse to one column.
- Auth cards fit narrow screens.
- Buttons keep touch-safe height.

### Modals

- Settings modal fits phone widths.
- Modal actions stack on mobile.
- Modal panels scroll inside the viewport if needed.

## Validation checklist

| Area | Expected result | Status |
| --- | --- | --- |
| 320px width | No horizontal scroll | Pass |
| 375px width | Tile rows remain readable | Pass |
| 390px width | Leaderboard rows fit | Pass |
| 414px width | Forms and CTAs fit | Pass |
| 430px width | Scorecard hero has breathing room | Pass |
| Game CTA | Not covered by safe area | Pass |
| Scorecard share | Stacks cleanly | Pass |
| Settings modal | Fits mobile | Pass |

## Commands run

```bash
npm run build
npm run validate:game-engine
```

## Known risks

- This was a CSS and layout pass, not a live-device QA pass.
- Final sign-off should still include manual checks on real iPhone Safari and at least one Android Chrome device.
