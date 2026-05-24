# Rackle v1 Launch QA Checklist

Purpose: confirm Rackle is ready for founding club testing.

Use this checklist before each launch push, major scoring change, leaderboard change, or club rollout.

Recommended status values:
- Not started
- In progress
- Passed
- Failed
- Blocked
- Not applicable

Recommended launch commands:

```bash
npm run validate:game-engine
npm run build
```

Run this before a larger release or any scoring/card-line change:

```bash
npm run validate:game-engine:deep
```

---

## Launch decision

| Decision option | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|
| Ready for founding clubs | Not started | Ash | Use when all critical checks pass and only minor known issues remain. |  |
| Ready with minor known issues | Not started | Ash | Use when gameplay, scoring, leaderboard, share, and mobile are stable, but non-blocking items remain. |  |
| Not ready | Not started | Ash | Use if gameplay, score saving, leaderboard, auth, mobile, or launch routing is broken. |  |

### Recommended launch blockers

| Blocker | Why it matters | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|
| App does not load in production | Players cannot start. | Not started | Engineering | Test after deployment on mobile and desktop. |  |
| Daily Rackle cannot be completed | Core product broken. | Not started | Engineering | Must complete 3 passes and reach scorecard. |  |
| Jokers can be passed | Breaks American Mahjong trust. | Not started | Engineering | Covered by game-engine QA and manual test. |  |
| Scorecard fails to load after completion | Player loses payoff moment. | Not started | Engineering | Test refresh and direct revisit. |  |
| Daily score does not post to Global | Social proof and leaderboard trust break. | Not started | Engineering | Test guest and logged-in flows. |  |
| Duplicate leaderboard rows appear | Club competition feels untrustworthy. | Not started | Engineering | Test replay, refresh, and signup after play. |  |
| Practice score posts to leaderboard | Breaks leaderboard integrity. | Not started | Engineering | Practice must stay local/coaching-first. |  |
| Mobile layout has horizontal scroll or cut-off tiles | First club testers will mostly be mobile. | Not started | Design / Engineering | Test iPhone SE width. |  |
| Share flow fails on mobile | Growth loop breaks. | Not started | Engineering | Test native share and copy fallback. |  |
| Club signup cannot be submitted | Founding club activation breaks. | Not started | Engineering | Mailto fallback must work. |  |
| Privacy / terms / trust links missing | Club owners may hesitate to share. | Not started | Product | Footer and menu should link correctly. |  |

---

## 1. Game engine

### Commands

| Check | Command | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|
| Fast engine QA | `npm run validate:game-engine` | Not started | Engineering | Run before every launch push. |  |
| Deep engine QA | `npm run validate:game-engine:deep` | Not started | Engineering | Run before scoring, practice, or card-line releases. |  |
| Production build | `npm run build` | Not started | Engineering | Must pass before deploy. |  |

### Engine checks

| Check | What to verify | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|
| Rack state validation | Starting rack has 13 tiles, final rack has 13 tiles, passes are legal. | Not started | Engineering | `validate:rack-state` |  |
| Daily determinism | Same date produces same Daily Rackle and stable incoming tiles. | Not started | Engineering | `validate:daily-determinism` |  |
| Incoming tile distribution | Jokers are never incoming, honors do not dominate. | Not started | Engineering | `validate:incoming` |  |
| Pass recommendations | Expert rules hold for Jokers, pairs, Soap, honors, Flowers, and ambiguity. | Not started | Engineering | `validate:passes` |  |
| Card-line database | 2026 physical card specs validate and scenario tests pass. | Not started | Product / Engineering | `validate:card-lines` |  |
| Score trust tests | Calibration library passes. | Not started | Engineering | `validate:scoring` |  |
| Score distribution | 90+ scores stay rare and 80s stay strong. | Not started | Engineering | `validate:score-distribution` |  |
| Practice variety | Practice racks are legal, varied, and realistic. | Not started | Engineering | `validate:practice-variety` |  |

---

## 2. Daily gameplay

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| First-time intro | Open Rackle in a clean browser profile. | First-time explainer appears once. | Not started | QA |  |  |
| Opening rack loads | Tap Play Today. | Daily rack appears with 13 tiles. | Not started | QA |  |  |
| Three passes work | Complete all Charleston passes. | Each pass sends 3 tiles and receives 3 tiles. | Not started | QA |  |  |
| Jokers cannot be passed | Start with or simulate rack with Joker. | Joker cannot be selected as outgoing pass. | Not started | QA |  |  |
| Incoming tiles contain no Jokers | Complete Daily Rackle. | Incoming tiles never include Jokers. | Not started | QA |  |  |
| Final rack has 13 tiles | Complete Daily Rackle. | Final rack has exactly 13 tiles. | Not started | QA |  |  |
| Scorecard loads | Finish Daily Rackle. | Scorecard opens with hero score. | Not started | QA |  |  |
| Share section works | Use Share score and Copy result. | Native share or copy fallback works. | Not started | QA |  |  |
| Score posts to Global | Finish Daily as guest and logged-in user. | Score appears once on Global board. | Not started | QA |  |  |

---

## 3. Practice gameplay

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Practice starts | Open Practice Room. | Practice rack loads. | Not started | QA |  |  |
| Practice racks vary | Start several practice racks. | Racks feel different and realistic. | Not started | QA |  |  |
| Practice receives are realistic | Complete several practice passes. | Honors appear sometimes, but do not dominate. | Not started | QA |  |  |
| Practice scorecard loads | Finish practice hand. | Coaching-first scorecard opens. | Not started | QA |  |  |
| Practice does not post to leaderboard | Complete practice, then open leaderboard. | No practice score appears on Global or Club. | Not started | QA |  |  |

---

## 4. Scorecard

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Hero score clear | Open Daily scorecard. | Score is the visual hero. | Not started | Design / QA |  |  |
| Tile size respected | Change tile size in Settings, then open scorecard. | Tiles follow small, regular, or large setting. | Not started | QA |  |  |
| Starting/final toggle | Tap Starting hand / Final hand. | Toggle works and tiles remain readable. | Not started | QA |  |  |
| Scoring breakdown | Open scoring breakdown. | Breakdown is readable and not duplicated. | Not started | QA |  |  |
| Best realistic paths | Review paths section. | Paths feel specific and useful. | Not started | Product / QA |  |  |
| Pass dropdowns | Open each pass review. | Chevrons stay inline and content expands cleanly. | Not started | QA |  |  |
| Share section | Share and copy from scorecard. | Daily and Practice copy are correct. | Not started | QA |  |  |
| Missing scorecard state | Open invalid scorecard route/state. | Scorecard not found state appears with CTAs. | Not started | QA |  |  |

---

## 5. Leaderboard

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Global board loads | Open Leaderboard. | Global board appears or empty state appears. | Not started | QA |  |  |
| Club board loads | Open Club board as club player. | Only club players appear. | Not started | QA |  |  |
| Guest appears once | Complete Daily as guest. | Guest appears once as Guest Rackler. | Not started | QA |  |  |
| Logged-in user appears once | Complete Daily as logged-in user. | Profile display name appears once. | Not started | QA |  |  |
| Club player appears on Global and Club | Complete Daily as club player. | Same score appears on both boards. | Not started | QA |  |  |
| No-club player only appears on Global | Complete Daily without club. | No Club row is created. | Not started | QA |  |  |
| Names are clean | Review board names. | No Player701, Rackler, undefined, null, or email names. | Not started | QA |  |  |
| Counts are deduped | Replay or refresh score. | Players on board count does not inflate. | Not started | QA |  |  |
| Tie sorting works | Create tied scores if possible. | Higher score first, earlier completion wins tie. | Not started | QA |  |  |
| Error state works | Simulate leaderboard fetch failure. | “The board is warming up.” appears with Refresh board. | Not started | QA |  |  |

---

## 6. Accounts

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Signup | Create account. | Account is created and user can continue. | Not started | QA |  |  |
| Login | Log in with saved account. | User returns to account view. | Not started | QA |  |  |
| Logout | Log out. | User exits account without corrupting guest state. | Not started | QA |  |  |
| Forgot password | Use forgot password screen. | Friendly success state appears. | Not started | QA | Local prototype flow until real auth. |  |
| Display name | Change display name. | Leaderboard uses updated name where possible. | Not started | QA |  |  |
| Settings save | Change tile size, sound, haptics, share tone. | Settings save and toast appears. | Not started | QA |  |  |
| Reset data modal | Open and confirm reset. | Clear warning appears, reset behaves as expected. | Not started | QA |  |  |

---

## 7. Clubs

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Club directory | Open Club Directory. | Club cards or empty state appears. | Not started | QA |  |  |
| Club signup | Submit founding club request. | Success state appears. | Not started | QA | Uses mailto fallback. |  |
| Founding Clubs page | Open Founding Clubs. | Launch checklist, invite copy, QR placeholder, and feedback CTA appear. | Not started | QA |  |  |
| Invite copy | Copy SMS and email invite blocks. | Copy works and text is ready to paste. | Not started | QA |  |  |
| Club feedback link | Click Send club feedback. | Feedback page opens with club context. | Not started | QA |  |  |
| No-club CTA | Open club surfaces without club. | Browse Clubs CTA appears. | Not started | QA |  |  |
| Club leaderboard empty state | Open empty club board. | “Your club board is quiet.” appears. | Not started | QA |  |  |

---

## 8. Mobile

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| iPhone SE width | Test at 320px. | No horizontal scroll or cut-off tiles. | Not started | Design / QA |  |  |
| iPhone 13/14/15 width | Test at 390px and 430px. | Layout feels balanced. | Not started | Design / QA |  |  |
| Android narrow width | Test at 360px to 414px. | Buttons and forms are usable. | Not started | Design / QA |  |  |
| No horizontal scroll | Review all core pages. | Body does not scroll sideways. | Not started | QA |  |  |
| Tile rows wrap | Daily, Practice, Scorecard. | Tiles wrap cleanly and labels remain readable. | Not started | QA |  |  |
| Footer buttons safe | Review bottom CTAs. | Buttons do not overlap safe area. | Not started | QA |  |  |
| Forms usable | Signup, login, club signup, feedback. | Inputs are readable and full width. | Not started | QA |  |  |
| Modals fit | Settings reset modal and confirmations. | Modal fits 320px width. | Not started | QA |  |  |

---

## 9. Empty and error states

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Scorecard not found | Load missing scorecard state. | Friendly state with Back home and Send feedback. | Not started | QA |  |  |
| Leaderboard fetch fail | Simulate fetch error. | Friendly warming-up state appears. | Not started | QA |  |  |
| Daily load fail | Simulate Daily rack failure. | “The room is still setting up.” appears. | Not started | QA |  |  |
| Practice load fail | Simulate Practice rack failure. | “Practice room needs a reset.” appears. | Not started | QA |  |  |
| Club signup fail | Simulate failed submit/mailto. | Friendly error and email fallback appear. | Not started | QA |  |  |
| Feedback fail | Simulate feedback failure. | Friendly retry state appears. | Not started | QA |  |  |
| Auth fail | Enter invalid credentials. | Friendly login/signup error appears. | Not started | QA |  |  |

---

## 10. Share

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Native mobile share | Tap Share score on mobile. | Native share sheet opens. | Not started | QA |  |  |
| Copy fallback | Tap Copy result on desktop. | Result copies to clipboard. | Not started | QA |  |  |
| Daily copy | Share Daily score. | Copy includes score, read, rank if available, and play link. | Not started | QA |  |  |
| Practice copy | Share Practice score. | Copy does not imply leaderboard ranking. | Not started | QA |  |  |
| Club-aware copy | Share as club player. | Copy includes club context and club rank if available. | Not started | QA |  |  |
| Guest share | Share as guest. | Guest can share without signup. | Not started | QA |  |  |
| Share link landing path | Open shared link. | Link lands on playable page, not broken scorecard. | Not started | QA |  |  |

---

## 11. Privacy and trust

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Privacy page | Open `/privacy`. | Page loads and explains data use. | Not started | QA | Product copy, not legal advice. |  |
| Terms page | Open `/terms`. | Page loads with simple terms. | Not started | QA |  |  |
| Trust page | Open `/trust`. | Page loads with game/scoring trust explanation. | Not started | QA |  |  |
| Footer/menu links | Click footer and menu links. | Links open correct pages. | Not started | QA |  |  |
| Contact path | Open Contact or Feedback. | Player can contact Rackle. | Not started | QA |  |  |

---

## 12. Analytics-lite

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Key events fire | Use core flows in development. | Dev logs or local events appear. | Not started | Engineering | Production should stay quiet. |  |
| No personal data leakage | Inspect payloads. | No email, full name, full rack, feedback body, or raw IDs. | Not started | Engineering |  |  |
| Analytics failure does not block play | Disable analytics provider. | App still works. | Not started | Engineering |  |  |

---

## 13. Deployment

| Check | Steps | Expected result | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|---|
| Environment variables | Check production environment. | Supabase and app config are set. | Not started | Engineering |  |  |
| Supabase connection | Load production app and leaderboard. | Reads/writes work. | Not started | Engineering |  |  |
| Production build | Run `npm run build`. | Build passes. | Not started | Engineering |  |  |
| Dev-only QA not exposed | Check UI and console. | QA helpers are not visible in production UI. | Not started | Engineering |  |  |
| Console debug helpers dev-only | Inspect production console. | No private debug payload exposed. | Not started | Engineering |  |  |
| Routes work after refresh | Refresh `/privacy`, `/terms`, `/trust`, `/club-directory`, scorecard routes if supported. | Routes do not 404 unexpectedly. | Not started | QA | SPA hosting fallback may be needed. |  |

---

## Final pre-club launch run

| Step | Command / Action | Status | Owner | Notes | Pass / Fail |
|---|---|---|---|---|---|
| Fast engine QA | `npm run validate:game-engine` | Not started | Engineering | Required before push. |  |
| Build | `npm run build` | Not started | Engineering | Required before deploy. |  |
| Deploy preview | Deploy to preview URL. | Not started | Engineering | Test before production. |  |
| Mobile smoke test | Test on real iPhone and Android. | Not started | QA | Required before club invite. |  |
| Guest Daily smoke test | Complete Daily as guest. | Not started | QA | Required before club invite. |  |
| Logged-in Daily smoke test | Complete Daily as logged-in user. | Not started | QA | Required before club invite. |  |
| Club board smoke test | Complete Daily as club user. | Not started | QA | Required before club invite. |  |
| Share smoke test | Share Daily score from phone. | Not started | QA | Required before club invite. |  |
| Club signup smoke test | Submit founding club request. | Not started | QA | Required before club owner outreach. |  |

