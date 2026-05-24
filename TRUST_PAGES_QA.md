# Rackle Privacy, Terms, and Trust Pages QA

## Purpose

Rackle now includes simple, human-readable launch trust pages for real players and club owners.

Pages added:

- `/privacy`
- `/terms`
- `/trust`

These pages are intentionally plain-language and not dense legal documents.

## Pages

### Privacy

Covers:

- account email if a player signs up
- display name
- club affiliation
- Daily Rackle score
- leaderboard rank
- feedback submitted by the player
- local storage for guest play
- guest scores displayed as Guest Rackler
- leaderboard display behavior
- club owner request data
- deletion request path
- statement that Rackle does not sell personal data

### Terms

Covers:

- Rackle is a game and learning tool
- scores are for fun and comparison
- no guarantee of perfect Mahjong advice
- respectful use
- moderation of abusive names or feedback
- gameplay and scoring updates
- contact path for issues

### Trust

Covers:

- Rackle is built for American Mahjong players
- scoring is tested with QA scenarios
- Jokers are never passed in Charleston receives
- Practice scores do not post to leaderboards
- leaderboard dedupes one score per player per day where possible
- club boards only show club-affiliated players
- card-line logic is reviewed and can improve over time
- feedback is welcome

## Routing

Internal screen routes were added for:

- privacy
- terms
- trust

Browser paths were also mapped for:

- `/privacy`
- `/terms`
- `/trust`

The browser back button is supported for these static pages.

## Navigation links

Links were added to:

- main menu Support section
- footer actions

## QA checklist

- [x] `/privacy` route renders Privacy page
- [x] `/terms` route renders Terms page
- [x] `/trust` route renders Trust page
- [x] footer links navigate to the pages
- [x] menu links navigate to the pages
- [x] pages use Rackle visual system
- [x] pages are mobile-first
- [x] build passes
- [x] game-engine validation passes

## Legal caveat

These pages are launch-ready product copy, not formal legal advice. Before a larger public launch, Rackle should have privacy and terms reviewed by counsel.
