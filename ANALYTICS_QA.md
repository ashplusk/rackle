# Rackle Analytics-Lite QA

## Goal

Rackle uses analytics-lite events to understand launch behavior without creating a dashboard, blocking gameplay, or collecting sensitive data.

The tracking helper is intentionally small:

- `src/engine/analytics.js`
- `trackRackleEvent(eventName, payload)`

If tracking fails, gameplay continues.

## Privacy rules

Allowed payloads are limited to safe launch context:

- `mode`: `daily` or `practice`
- `scoreBand`: `90+`, `80-89`, `70-79`, `60-69`, `50-59`, `under-50`
- `hasClub`: true / false
- `isGuest`: true / false
- `shareMethod`: `native`, `copy`, or fallback state
- `source`: page or component source
- `clubState`: `joined`, `none`, or `pending`
- `hasGlobalRank`: true / false
- `hasClubRank`: true / false
- `activeTab`: `global` or `club`
- `dailyState`: `open` or `completed`
- `copyType`: `sms_whatsapp`, `email`, or `club_invite`

Payloads must not include:

- email addresses
- full names
- full rack tile data
- feedback message body
- raw Supabase IDs
- account IDs
- club owner notes

The helper strips unknown keys and redacts email-like strings if they are passed by mistake.

## Events added

### Core

| Event | Where it fires | Payload notes |
| --- | --- | --- |
| `homepage_viewed` | Home screen render | daily state, guest state, club state |
| `daily_started` | Daily game screen starts | mode, guest state, club state |
| `daily_completed` | Daily score is calculated | score band, guest state, club state |
| `practice_started` | Practice game screen starts | mode, guest state, club state |
| `practice_completed` | Practice score is calculated | score band, guest state, club state |
| `scorecard_viewed` | Daily or Practice scorecard opens | mode, score band, guest state, club state |
| `score_shared` | Score share succeeds through native share or copy | mode, score band, share method, rank context |
| `share_copy_clicked` | Copy result is selected or used as fallback | mode, score band, share method |

### Leaderboard

| Event | Where it fires | Payload notes |
| --- | --- | --- |
| `leaderboard_opened` | Global/leaderboard screen opens | active tab, guest state, club state |
| `club_leaderboard_opened` | Club board or club tab opens | active tab, guest state, club state |
| `leaderboard_refresh_clicked` | Refresh board CTA clicked | active tab, club state |

### Clubs

| Event | Where it fires | Payload notes |
| --- | --- | --- |
| `club_directory_opened` | Club Directory opens | guest state, club state |
| `club_signup_started` | Club Signup page opens | pending club state |
| `club_signup_submitted` | Club Signup mailto is launched | pending club state |
| `club_invite_copy_clicked` | Club invite copy/share action succeeds | source and copy type |
| `browse_clubs_clicked` | Browse/Find Club CTA clicked | source and club state |

### Account

| Event | Where it fires | Payload notes |
| --- | --- | --- |
| `signup_started` | Signup screen opens | guest state |
| `signup_completed` | Local prototype signup succeeds | club state |
| `login_completed` | Local prototype login succeeds | club state |
| `logout_clicked` | Settings logout clicked | club state |
| `settings_saved` | Any setting saves successfully | guest state, club state |

### Feedback

| Event | Where it fires | Payload notes |
| --- | --- | --- |
| `feedback_started` | Feedback screen opens | feedback source, score band if present |
| `feedback_submitted` | Feedback mailto launches | feedback source, score band if present |

## QA checklist

- [x] `trackRackleEvent` safely no-ops if tracking fails.
- [x] Development logs only appear in dev builds.
- [x] Production does not show analytics console logs.
- [x] Unknown payload keys are dropped.
- [x] Email-like strings are redacted.
- [x] No full rack state is sent.
- [x] Feedback message body is not sent.
- [x] Club signup notes are not sent.
- [x] Score sharing remains usable if analytics fails.
- [x] Gameplay remains usable if analytics fails.
- [x] `npm run build` passes.
- [x] `npm run validate:game-engine` passes.

## Known limits

- This is analytics-lite, not a reporting dashboard.
- Analytics-lite is dependency-free. It uses `window.va` when a provider is present, otherwise it dispatches a local `rackle:analytics` event and never blocks the app.
- Local development logs are for QA only.
- Auth is still a local prototype, so account events represent prototype flows until real auth is connected.
