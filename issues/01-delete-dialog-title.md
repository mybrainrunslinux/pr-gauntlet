# Issue #1: Delete confirmation shows "undefined" instead of card title

**Tier:** 1 — Clear  
**Labels:** bug, ui

## Description

When clicking the delete button on any card, the confirmation dialog reads:

> Are you sure you want to delete "undefined"?

Expected behavior: the dialog should display the card's actual title, e.g.:

> Are you sure you want to delete "Fix login page styles"?

## Steps to Reproduce

1. Open any board with at least one card
2. Hover a card to reveal action buttons
3. Click the trash icon
4. Observe the confirmation dialog text

## Notes

Affects all cards. The delete operation itself works correctly after confirming.
