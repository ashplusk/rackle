# Rackle Club Launch QA

Rackle club launch flow should let a club owner understand the product, request a club, invite players, and see the club board become active.

## Club owner journey

1. Discover Rackle
   - Entry points: Homepage, Club Directory, Founding Clubs page, header menu.
   - Message: Bring your Mahjong group to the daily table.
   - Primary CTA: Start a founding club.

2. Request a club
   - Page: Club signup.
   - Required fields: Club name, City, State, Club owner/admin name, Email.
   - Optional fields: Expected number of players, Instagram / website, Notes.
   - Success state: Your club request is in. We’ll help you get your table set up.
   - Fallback: mailto request to hello@playrackle.com.

3. Invite players
   - Page: Founding Clubs.
   - SMS / WhatsApp invite copy included.
   - Email invite copy included.
   - Copy buttons included.
   - QR placeholder included.
   - Club feedback CTA included.

4. Players join and play
   - Guests can play Daily Rackle.
   - Logged-in players can play Daily Rackle.
   - Club players appear on Global and Club boards.
   - No-club players stay Global only.

5. Club board fills
   - Club Room loads club-specific leaderboard.
   - Empty state works when no one has played.
   - Error state works when fetch fails.
   - Current player row merges after today’s score.

## QA scenarios

| Scenario | Steps | Expected result | Actual result | Status | Fixes made |
|---|---|---|---|---|---|
| Club owner discovers club flow | Open homepage, Club Directory, and menu | Founding club CTA is visible and clear | Founding Clubs added to menu and CTAs | Pass | Added Founding Clubs page and links |
| Club owner opens `/club-signup` equivalent route | Navigate to Club Signup | Form loads with all requested fields | Form includes club, city, state, owner, email, players, website, notes | Pass | Expanded form fields |
| Required field validation | Submit blank or invalid form | Friendly inline error appears | Error says request did not send and offers retry/email | Pass | Strengthened validation |
| Club request success | Submit with required fields | Success state appears | Shows request-in confirmation and invite CTA | Pass | Added success summary and invite CTA |
| Mailto fallback | Click email request | Opens email client with structured request | mailto includes all fields | Pass | Updated mailto body |
| Founding Clubs page loads | Navigate to Founding Clubs | Owner sees steps, invite copy, QR placeholder, feedback CTA | Page added | Pass | New screen created |
| SMS / WhatsApp copy | Copy SMS block | Copy is ready for group chat | Copy button included | Pass | Added copy block helper |
| Email invite copy | Copy email block | Copy is ready for member list | Copy button included | Pass | Added email copy block |
| QR placeholder | Review page | Placeholder explains table card use | Placeholder included | Pass | Added table-card section |
| Club feedback CTA | Click feedback CTA | Feedback form opens in club mode | `feedback` receives type club | Pass | Added typed feedback support |
| Club Directory no match | Search unknown club | Empty state offers founding club CTA | CTA routes to Founding Clubs | Pass | Updated directory CTA |
| Club Room with no club | Open Club Room as no-club player | Calm Browse Clubs CTA appears | Existing no-club state remains | Pass | Confirmed |
| Club Room empty board | Open club with no scores | Quiet board state appears | Existing empty state remains | Pass | Confirmed |
| Club Room invite | Click Invite Your Table | Copy uses group-chat friendly invite text | Invite copy now uses daily challenge language | Pass | Updated club invite copy |
| Build check | Run production build | Build passes | Build passed | Pass | None |
| Game-engine check | Run validate:game-engine | QA passes | QA passed | Pass | None |

## Route safety

The app uses internal screen routing rather than full browser routes. These equivalent screens are covered:

- `clubSignup`
- `foundingClubs`
- `clubDirectory`
- `feedback` with `{ type: "club" }`
- `clubRoom`

## Known risks

- Club signup still uses mailto, so delivery depends on the player’s email app.
- There is not yet a backend approval workflow for club requests.
- QR is a launch placeholder, not generated dynamically.
- Browser URL paths like `/founding-clubs` are not true deep links yet because the app still uses internal screen routing.
