# Issue #10: Ctrl+Z undoes two operations instead of one

**Tier:** 2 — Moderate  
**Labels:** bug, undo

## Description

Pressing Ctrl+Z (or Cmd+Z on Mac) to undo the last action reverts two operations instead of one. For example:

1. Create card A
2. Create card B
3. Press Ctrl+Z → both card A and card B are removed

Expected: only card B is removed; card A remains.

This affects drag-drop operations particularly — undoing a card move also undoes the action before it.

## Steps to Reproduce

1. Perform any two actions in sequence (e.g. create two cards, or drag a card and then edit a title)
2. Press Ctrl+Z once
3. Observe: two operations are undone

## Expected

One Ctrl+Z undoes exactly one operation.

## Notes

- Redo (Ctrl+Shift+Z) is similarly affected — it re-applies two operations at once
- The undo stack appears to have duplicate entries for some operations
- The issue is most pronounced with drag-drop, less so with text edits
