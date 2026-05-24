# Scorecard, Account Identity, and iPhone 14 UX Fix QA

## What this pass fixes

- Daily scorecard blank page after completion.
- Logged-in players being treated as Guest Rackler on leaderboard posting.
- Oversized typography and cramped spacing on iPhone 14 / small mobile widths.

## Fixes made

### Scorecard recovery

- Added an app-level screen error boundary so a scorecard render issue no longer white-screens the whole app.
- Recovery state sends the player back home or to feedback.
- Daily result still saves before leaderboard posting, so a failed board request should not block the scorecard.

### Logged-in identity

- Added account identity repair for profiles that still carried a `guest-*` player ID after signup.
- Authenticated players now receive a stable `player-*` ID.
- Daily leaderboard posting now repairs guest identity before save.
- If a previous guest score exists, Rackle attempts to migrate it to the authenticated player row.
- Leaderboard display name is pulled from the latest repaired profile.

### iPhone 14 mobile typography

- Reduced oversized display headings at widths under 430px.
- Tightened scorecard hero size.
- Reduced body copy size and line-height in heavy sections.
- Kept tile rows and scorecard sections within the phone viewport.

## Manual QA checklist

- [ ] Log in as a real account.
- [ ] Play Daily Rackle.
- [ ] Complete all passes.
- [ ] Confirm scorecard does not go blank after reveal phases.
- [ ] Confirm leaderboard row shows the logged-in name, not Guest Rackler.
- [ ] Refresh homepage and leaderboard.
- [ ] Confirm no duplicate current-player rows.
- [ ] Test on iPhone 14 Safari.
- [ ] Confirm headings fit better and do not dominate the screen.

## Validation

- `npm run build`: passed.
- `npm run validate:game-engine`: passed.

## Known notes

- The app still uses local prototype auth. This fix prevents local authenticated profiles from being treated as guest identities.
- Full repo lint still has pre-existing Game.jsx issues unrelated to this pass.
