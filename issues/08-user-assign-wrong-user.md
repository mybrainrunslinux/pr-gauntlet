# Issue #8: Assigning a user via dropdown occasionally assigns the wrong person

**Tier:** 2 — Moderate  
**Labels:** bug, assignments

## Description

When assigning a team member to a card using the assignee dropdown, the wrong user is sometimes saved. For example, selecting "Carol" saves "Bob" as the assignee.

This appears to depend on the order of users in the dropdown and is reproducible when the user list is sorted alphabetically.

## Steps to Reproduce

1. Open a card with no assignee
2. Click the "Assign" dropdown
3. Select the second or third user in the list
4. Save the card
5. Observe: the assignee shown is not the user that was selected

## Expected

The selected user is saved as the assignee.

## Notes

- The displayed name in the dropdown at selection time is correct — the bug occurs during save
- Sorting the user list differently changes which user gets incorrectly assigned
- Only affects the dropdown; the user avatar quick-assign buttons work correctly
