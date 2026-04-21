# Issue #11: Users lose unsaved edits when switching browser tabs

**Tier:** 3 — Vague  
**Labels:** bug, data-loss

## Description

Several users have reported that card edits they were making disappeared after switching to another browser tab and returning. The card reverts to its last saved state, even though the user had made changes and not yet clicked Save.

This does not happen every time — users estimate it occurs roughly 30–40% of tab switches when an edit is in progress.

## What We Know

- Happens in Chrome and Firefox; not reported in Safari
- More likely when the user has been editing for more than ~10 seconds before switching tabs
- The edit form is still open when they return, but the fields show old values
- No error appears in the console when it happens

## What We Don't Know

- Whether this is a synchronization issue, a focus/blur event issue, or a re-render issue
- Whether it's related to the recent addition of "auto-save draft" functionality

## Impact

Medium — users are frustrated but can work around it by saving frequently. However, two users have reported losing significant work.
