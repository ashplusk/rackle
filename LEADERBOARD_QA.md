# Rackle Leaderboard Integrity QA

Launch goal:
Rackle’s leaderboard should feel reliable enough for founding clubs to compete daily.

The leaderboard is the daily table board, not a stats dashboard.

## Rules

### Global board

Every completed Daily Rackle score posts to Global.

Included:
- guest players
- logged-in players
- players with a club
- players without a club

Excluded:
- Practice Room scores

Practice scores stay local to the scorecard and coaching flow.

### Club board

Club boards only show players affiliated with that club.

If a player has no club:
- their Daily score appears on Global
- their score does not appear on any Club board
- Rackle shows a calm club CTA where relevant

No-club CTA copy:
- Title: No club joined yet.
- Body: Join a club to compare daily reads with your Mahjong group.
- CTA: Browse clubs

### Dedupe keys

Logged-in dedupe key:
- user_id / player_id + daily_rackle_id / day_seed

Guest dedupe key:
- guest_id / device player_id + daily_rackle_id / day_seed

Board scope:
- Global rows use `club_code = __global__`
- Club rows use the player’s real club code

Save behavior:
- fetch existing row first
- PATCH existing row when possible
- fallback to delete and insert if PATCH is blocked
- insert only when no matching row exists

This avoids blind inserts.

### Name resolution

Display name priority:
1. profile displayName
2. profile name
3. local saved player name
4. Guest Rackler

Never show:
- Rackler
- Player701
- Guest 123
- anonymous_user
- undefined
- null
- NaN
- test user
- email address as leaderboard name

Shared helper:
- `resolveLeaderboardName()`
- `safeLeaderboardName()`

### Sorting and ties

Sorting is consistent across Global, Club, homepage preview, and scorecard ranks.

Order:
1. Higher score first
2. Earlier completed_at / played_at / created_at wins tie
3. Lower time_secs only if no usable completed time exists
4. Name fallback for stable render order

### Players on board count

“Players on board” counts final deduped rows.

Flow:
1. fetch rows
2. normalize and dedupe rows
3. merge current local player score if needed
4. dedupe again
5. count final rows

Do not count raw database rows.

### Current player merge

If Supabase has not refreshed yet, the current player’s local Daily score merges into the visible board.

Merge identity priority:
1. logged-in player_id
2. guest player_id
3. day_seed
4. board scope

The player should appear immediately after playing and should not duplicate after the Supabase fetch catches up.

### Empty states

Global no scores:
- Title: No scores yet today.
- Body: Be the first to wake the room.
- CTA: Play today’s Rackle

Club no scores:
- Title: Your club board is quiet.
- Body: Play today’s rack or invite your table.
- CTA: Play today’s Rackle

No club:
- Title: No club joined yet.
- Body: Join a club to compare daily reads with your Mahjong group.
- CTA: Browse clubs

### Error state

Fetch failure copy:
- Title: The board is warming up.
- Body: Try again in a moment.
- CTA: Refresh board

The UI should never show a broken blank leaderboard.

### Development debug helper

Development only:

`window.__rackleLeaderboardDebug`

May expose:
- rawRows
- dedupedRows
- mergedRows
- currentPlayerRow
- globalCount
- clubCount
- activeDailyRackleId
- activeGuestId
- activeUserId
- activeClubId

No production UI.
No service keys.

## QA scenarios

### A. Guest plays once

Expected:
- appears once on Global
- name = Guest Rackler
- count = 1

Status:
- Ready for browser QA

### B. Guest refreshes

Expected:
- no duplicate
- score remains

Status:
- Ready for browser QA

### C. Guest replays or recalculates

Expected:
- updates existing score
- no duplicate

Status:
- Ready for browser QA

### D. Logged-in user plays once

Expected:
- appears once on Global
- profile display name appears

Status:
- Ready for browser QA

### E. Logged-in user changes display name

Expected:
- leaderboard shows updated name where possible after next save or refresh

Status:
- Ready for browser QA

### F. Club user plays once

Expected:
- appears on Global
- appears on Club
- club rank correct

Status:
- Ready for browser QA

### G. No-club logged-in user plays

Expected:
- appears on Global
- does not appear on Club
- sees club CTA where relevant

Status:
- Ready for browser QA

### H. Two users tie

Expected:
- higher score first
- tied score ordered by earlier completed_at / created_at

Status:
- Ready for browser QA

### I. Player joins club after playing

Expected:
- global score remains
- today’s score can backfill to the new club board
- no duplicate Global score
- no duplicate Club score

Status:
- Ready for browser QA

### J. Leaderboard fetch failure

Expected:
- friendly error state
- no broken blank board
- Refresh board retries fetch

Status:
- Ready for browser QA

### K. Practice game completed

Expected:
- scorecard appears
- coaching appears
- no Global row
- no Club row

Status:
- Ready for browser QA

### L. Local score before Supabase refresh

Expected:
- player appears immediately
- no duplicate after Supabase returns

Status:
- Ready for browser QA

## Files touched in this pass

- `src/engine/leaderboard.js`
- `src/engine/supabase.js`
- `src/engine/storage.js`
- `src/components/screens/Leaderboard.jsx`
- `src/components/screens/ClubRoom.jsx`
- `src/components/screens/Home.jsx`
- `src/components/screens/DailyScorecard.jsx`
- `src/components/screens/ClubDirectory.jsx`
- `LEADERBOARD_QA.md`

## Verification performed

Build:
- `node node_modules/vite/bin/vite.js build`
- Passed

Focused lint on touched leaderboard files:
- `node node_modules/eslint/bin/eslint.js src/engine/leaderboard.js src/engine/supabase.js src/engine/storage.js src/components/screens/Leaderboard.jsx src/components/screens/ClubRoom.jsx src/components/screens/ClubDirectory.jsx`
- Passed

Scoring trust validation:
- `node src/engine/charleston-scoring-validation.js`
- Passed 39 / 39

Leaderboard helper sanity check:
- Verified dedupe, bad-name fallback, tie ordering, current-player merge, and rank lookup with a local Node import.
- Passed

Full repo lint:
- Still reports pre-existing issues outside this leaderboard pass, mostly in App, DailyScorecard, Game, Home, HandBrowser, TileTheme, and scoring validation files.
- These were not fixed in this pass to avoid widening scope.

## Known limitations

- Real Supabase QA still needs browser/device testing with actual guest, logged-in, and club accounts.
- Tie order depends on an available completed/created timestamp from the leaderboard table. If the table does not expose one, Rackle falls back to time_secs and name for stable ordering.
- No schema change was made.
