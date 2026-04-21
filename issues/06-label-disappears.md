# Issue #6: Labels disappear immediately after being added to a card

**Tier:** 2 — Moderate  
**Labels:** bug, labels, state

## Description

When adding a label to a card via the label picker, the label appears briefly then disappears as soon as the picker closes. The card shows no labels, even though the action appeared to succeed.

Occurs consistently across all cards and all labels. Labels are not persisted.

## Steps to Reproduce

1. Open any card's edit view
2. Click the label picker
3. Select any label (e.g. "bug" or "feature")
4. Close the label picker
5. Observe: the selected label is not shown on the card

## Expected

Selected label persists on the card and is visible in the card detail and in the column view.

## Notes

- Network request to save the card fires correctly
- Inspecting the response shows the label was saved server-side
- The issue is in how the frontend re-renders after save
- Has been reported by multiple users; introduced somewhere in the last few weeks
