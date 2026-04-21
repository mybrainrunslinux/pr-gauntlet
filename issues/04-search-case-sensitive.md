# Issue #4: Search filter shows all cards regardless of query

**Tier:** 1 — Clear  
**Labels:** bug, search

## Description

Typing in the search box at the top of the board has no visible effect — all cards remain visible regardless of the search term entered.

## Steps to Reproduce

1. Ensure the board has at least 5 cards with different titles
2. Type a word that appears in only one card title (e.g. "login")
3. Observe: all cards remain visible, not just the matching one

## Expected

Only cards whose title or description contains the search term (case-insensitive) should be shown.

## Notes

The search input fires correctly (no event handler issue). The filter logic runs but produces wrong results.
