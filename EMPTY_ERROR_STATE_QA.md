# Rackle Empty & Error State QA

Purpose: make sure no player sees a blank page, raw error, or confusing dead end during v1 launch.

## States covered

| Area | State | Copy | CTA |
| --- | --- | --- | --- |
| Scorecard | Missing scorecard | Scorecard not found. That table read may have expired or failed to save. | Back home, Send feedback |
| Daily game | Rack load failure | The room is still setting up. Try opening today’s Rackle again. | Reload Rackle, Back home |
| Practice game | Rack load failure | Practice room needs a reset. Start a fresh rack and try again. | New practice rack, Back home |
| Leaderboard | Fetch failure | The board is warming up. Try again in a moment. | Refresh board |
| Leaderboard | No Global scores | No scores yet today. Be the first to wake the room. | Play today’s Rackle |
| Club board | No Club scores | Your club board is quiet. Play today’s rack or invite your table. | Play today’s Rackle |
| Club | No club joined | No club joined yet. Join a club to compare daily reads with your Mahjong group. | Browse clubs |
| Club signup | Request failure / validation | Your club request did not send. Try again, or email us directly and we’ll help set up your table. | Try again, Email Rackle |
| Feedback | Send failure | Your note did not send. Try again in a moment. | Try again |
| Settings | Save failure | Settings did not save. Try again in a moment. | Retry |
| Login | Login failure | That login did not work. Check your email and password, then try again. | Try again by editing fields |
| Signup | Signup failure | Your account was not created. Try again, or use a different email. | Try again by editing fields |
| Forgot password | Success | Check your inbox. We sent a reset link if that email has a Rackle account. | Back to login |
| Routing fallback | Unknown app state | The room is still setting up. Try opening today’s Rackle again. | Back home |
| Club directory | Fetch failure | The room is still setting up. Try opening the club directory again. | Reload clubs, Back home |

## Design rules

- Use ivory cards, emerald CTAs, jade accents, and soft rounded corners.
- Do not show raw Supabase, localStorage, or JavaScript errors in the UI.
- Development-only console warnings are allowed for debugging.
- CTAs must use existing Rackle button styling.
- Error states should give the player one clear next action.

## Latest validation

- `npm run build`: passed
- `npm run validate:game-engine`: passed

## Known gaps

- Club signup and feedback still use mailto. The UI now has friendly recovery states, but real delivery confirmation depends on the player’s email app.
- Auth remains a local prototype until Supabase Auth is connected.
