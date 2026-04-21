# Issue #14: User preferences randomly reset to defaults

**Tier:** 3 — Vague  
**Labels:** bug, preferences, state

## Description

User display preferences — dark mode toggle, compact card view, column sort order, notification settings — occasionally reset to their default values without the user changing them.

This is not triggered by logout or cache clearing. It happens mid-session, sometimes within minutes of the user setting their preferences.

## User Reports

- "I set dark mode every morning when I open the app. Sometimes it resets again within a few minutes."
- "My sort order keeps flipping back to 'Created date' even though I always use 'Priority'"
- "Seems to happen more when I'm navigating around a lot vs staying on one board"

## What We've Checked

- Preferences are stored in localStorage and appear to be written correctly
- Reading localStorage directly in the console shows the correct values even when the UI shows defaults
- There are no explicit calls to reset preferences in the codebase (we searched)

## Notes

The gap between what localStorage contains and what the UI shows is a key observation. The preferences are being *saved* correctly but *read* incorrectly — or the UI is not picking up the saved values.
