# SCORECARD_QA

## Scope checked

- Daily scorecard page uses the premium payoff layout.
- Practice scorecard page uses the same core layout with coaching-first language.
- Homepage completed-state scorecard links into the full scorecard flow.
- Missing scorecard state now gives clear recovery actions.

## Layout order

- Hero scorecard
- Your hand
- Final hand / Starting hand toggle
- Scoring breakdown
- What you were reading
- Expert table read
- Best Realistic Paths
- What shaped the read / Coach read
- Pass by pass dropdowns
- Share section

## Removed / avoided

- Removed duplicate path sections.
- Removed What strong players saw from the scorecard flow.
- Avoided old report-style scorecard blocks.
- Kept one Best Realistic Paths section with three paths max.

## Mobile QA

- Premium tiles wrap without horizontal scroll.
- Dropdown chevrons stay inline.
- Footer spacing remains clean.
- Scorecard CTA buttons stay readable on mobile.

## Known follow-ups

- Test Web Share behavior on iPhone Safari with a real deployed URL.
- Test saved scorecard reload after Supabase write with a live logged-in account.
