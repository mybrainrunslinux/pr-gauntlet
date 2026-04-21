# Issue #2: Column card count badges don't update after drag-drop

**Tier:** 1 — Clear  
**Labels:** bug, ui

## Description

Each column header shows a badge with the number of cards in that column (e.g. "In Progress · 3"). After dragging a card from one column to another, the badge counts do not update — they remain frozen at the counts from initial page load.

## Steps to Reproduce

1. Load the board (note the column badge counts)
2. Drag a card from "Backlog" to "In Progress"
3. Observe: "Backlog" still shows the old count; "In Progress" still shows the old count

## Expected

Badge counts update immediately to reflect the new column membership.

## Notes

Refreshing the page shows correct counts. The cards array itself is updated correctly — this is purely a display issue with the computed counts.
