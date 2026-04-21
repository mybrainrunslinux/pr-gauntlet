# Issue #13: Some users can't see cards assigned to them

**Tier:** 3 — Vague  
**Labels:** bug, assignments, filtering

## Description

The "My Cards" view (filtered view showing only cards assigned to the current user) is showing no cards for some users, even though they can see their assigned cards in the regular board view and others can see those same cards are assigned to them.

Not all users are affected — it appears to be specific individuals, and the issue persists after logout/login.

## User Reports

- "My Cards shows empty but I have 12 cards assigned to me in the board"
- "My colleague can see my assigned cards fine but I can't"
- "Tried incognito, same result"

## What We've Checked

- The user account data looks correct in the database
- Cards are correctly assigned (verified by team lead looking at the same board)
- The filter feature itself works for other users
- No error in the console for affected users

## Pattern

Affected users appear to be those whose display names were changed at some point (either by them or by an admin). Users who have never changed their name are not affected.

This may be a clue.
