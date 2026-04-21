# Issue #7: Sprint view shows cards from previous sprint on initial load

**Tier:** 2 — Moderate  
**Labels:** bug, sprints

## Description

When switching to "Sprint View" (the toggle in the top nav), the board shows cards from the previous (or earliest) sprint instead of the current active sprint.

Clicking away and back to Sprint View, or hard-refreshing the page, does not reliably fix it. Sometimes the correct sprint loads, sometimes it doesn't.

## Steps to Reproduce

1. Ensure at least 2 sprints exist (Sprint 1 completed, Sprint 2 active)
2. Load the board
3. Toggle "Sprint View" on
4. Observe: Sprint 1 cards are shown, or no cards, instead of Sprint 2 cards

## Expected

Sprint View should immediately display cards from the currently active sprint.

## Notes

- The sprint selector dropdown shows the correct active sprint in its label
- The issue is specifically with the *initial* filter applied on first render
- If you manually select "Sprint 2" from the dropdown and then select it again, it works correctly
- This is intermittent in dev (fast machines) but consistent in production
