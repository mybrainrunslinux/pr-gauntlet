# Issue #9: Board completion percentage is always incorrect

**Tier:** 2 — Moderate  
**Labels:** bug, statistics

## Description

The "X% complete" indicator in the board header is consistently wrong. It typically shows a percentage 5–10 points lower than reality.

For example, with 8 of 10 cards in "Done", the header shows "70% complete" instead of "80%".

## Steps to Reproduce

1. Move exactly 8 of 10 cards to the "Done" column
2. Observe: header shows a percentage other than 80%
3. Try with other ratios — the displayed percentage is always off

## Expected

Percentage = (cards in Done / total cards) × 100, rounded to nearest integer.

## Notes

- The count of cards in each column (shown in badges) is correct
- The error is in the percentage calculation, not the counts
- Has been this way since the statistics feature was added
