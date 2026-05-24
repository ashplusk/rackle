# Rackle Account Flow QA

This document covers guest, account, and club-flow hardening for the v1 launch path.

## Scope

Rackle should let real players complete the core journey without losing scores, creating duplicate leaderboard rows, or hitting broken account states.

This pass focused on code-path QA and low-risk hardening. Live production account testing should still be completed before inviting founding clubs.

## Rules verified

- Daily scores post to Global.
- Practice scores do not post to leaderboard.
- Guest players use a stable local `guest-*` player id.
- Logged-in players use a stable account `playerId`.
- Signup after guest play keeps or migrates today's Daily score.
- Login after guest play migrates today's local score to the logged-in profile where possible.
- Guest leaderboard rows are removed after migration when the account id differs.
- Display name changes update the stored account profile and refresh today's leaderboard row.
- Leaving a club removes today's club-board row for that player.
- Reset data clears local play state but preserves local saved account credentials.
- Password reset shows a safe success state without exposing account existence.

## Fixes made

### 1. Guest-to-account score migration

Updated signup and login to call `syncTodayScoreToProfile` after a successful account action.

Expected behavior:

- Guest can finish Daily Rackle.
- Guest can create an account or log in after playing.
- Today's score is reposted under the account identity.
- If the old local identity was a `guest-*` id and differs from the account id, the old guest leaderboard row is removed.
- This avoids duplicate guest/account rows for the same player on the same Daily Rackle.

Files:

- `src/components/screens/Auth.jsx`
- `src/engine/leaderboard.js`

### 2. Stable player id on signup

Signup now prefers the existing guest id when creating a new local account.

Expected behavior:

- A guest who signs up after playing keeps the same player identity when possible.
- The leaderboard row updates instead of duplicating.

File:

- `src/components/screens/Auth.jsx`

### 3. Stored account profile refresh

Profile edits now update the saved local account profile as well as the active profile/session.

Expected behavior:

- User changes display name.
- Leaderboard uses the updated name where possible.
- Logout/login does not restore an old saved name.

File:

- `src/components/screens/Profile.jsx`

### 4. Today's leaderboard name sync

Profile edits now repost today's Daily score with the updated display name when a Daily score exists locally.

Expected behavior:

- Display name changes are reflected on today's board without waiting until tomorrow.

File:

- `src/components/screens/Profile.jsx`

### 5. Club leave cleanup

Leaving a club now removes today's club-board row for the player.

Expected behavior:

- Player no longer appears on today's club board after leaving a club.
- Global score remains untouched.

Files:

- `src/components/screens/Profile.jsx`
- `src/engine/leaderboard.js`

### 6. Safer reset data behavior

Reset data now preserves saved local account credentials while clearing local play state, profile, streak, settings, and practice history.

Expected behavior:

- Reset data does not delete backend leaderboard records.
- Reset data does not erase the local account from the device.
- User can log back in after resetting local play data.

File:

- `src/components/screens/Settings.jsx`

## QA scenarios

| Scenario | Steps | Expected result | Status | Notes |
|---|---|---|---|---|
| First-time guest plays Daily | Clear local state, open home, start Daily, complete 3 passes, score | Intro appears, scorecard loads, score posts Global as Guest Rackler, no Club row | Code-path pass | Requires live Supabase smoke test |
| Returning guest plays Daily | Keep local guest id, refresh, replay/recalculate Daily | Intro does not repeat, guest id stable, same leaderboard row updates | Code-path pass | Dedupe handled by `postScore` upsert path |
| Guest signs up after playing | Complete Daily as guest, create account | Score remains local, account is created, today's score migrates, old guest row removed when needed | Hardened | Signup now preserves guest id where possible |
| Logged-in user plays Daily | Log in, play Daily, refresh scorecard | Score posts Global with profile name, scorecard persists locally | Code-path pass | Requires live smoke test |
| Logged-in user without club | Log in without club, complete Daily | Appears on Global only, sees Browse Clubs CTA | Code-path pass | Club row only posts when club code exists |
| Logged-in club user plays Daily | Join club, play Daily | Appears on Global and Club, club rank can resolve | Code-path pass | Backfill already handled on join |
| User changes display name | Edit profile name after playing | Saved account profile updates, today leaderboard row refreshes | Hardened | `postScore` updates same player/day row |
| User joins club after playing | Play Daily, join club | Global remains, Club row backfills, no duplicate Global | Code-path pass | Existing club-directory backfill retained |
| Logout and return | Log out, log in again | Account profile restores, guest state does not overwrite account id | Hardened | Saved account profile is updated on profile save |
| Reset data | Open settings, reset data | Local play data clears, saved account remains, leaderboard records untouched | Hardened | Preserves `rk-accounts` |
| Password reset | Open forgot password, submit email | Safe success state appears, no raw error | Code-path pass | Local prototype does not send real email |

## Validation run

- `npm run build`: passed
- `npx eslint src/components/screens/Auth.jsx src/components/screens/Profile.jsx src/components/screens/Settings.jsx src/engine/leaderboard.js`: passed
- `npm run validate:scoring`: passed, 55 / 55
- `RACKLE_SCORE_DISTRIBUTION_GAMES=25 npm run validate:score-distribution`: passed

## Manual production QA still required

Before inviting founding clubs, run these with real browser sessions:

1. Guest Daily completion in a clean browser profile.
2. Guest signup after Daily completion.
3. Existing-account login after guest Daily completion.
4. Club join after Daily completion.
5. Display name update after Daily completion.
6. Logout and login from a second browser tab.
7. Password reset page copy and routing.
8. Reset data flow on mobile Safari.

## Known limits

- Auth is still a local prototype, not full Supabase Auth.
- Password reset is a safe UI state, not a real email delivery flow.
- Live leaderboard migration depends on Supabase delete/patch permissions. If RLS blocks delete, deduped UI still protects display, but backend cleanup may not occur.
