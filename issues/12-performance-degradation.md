# Issue #12: App becomes slow and unresponsive after extended use

**Tier:** 3 — Vague  
**Labels:** bug, performance

## Description

After using the app for 10–20 minutes, interactions become noticeably sluggish. Drag-drop lags, card opens are slow, and keyboard shortcuts occasionally fire multiple times for a single keypress.

Refreshing the page restores normal performance, which suggests a memory or listener leak rather than a server-side issue.

## User Reports

- "After about 15 minutes the app feels like it's running in slow motion"
- "My keyboard shortcut N (new card) sometimes creates 3 or 4 cards when I press it once"
- "The browser tab's memory usage climbs steadily in Task Manager"

## Profiling Notes (from one engineer's quick investigation)

- Chrome DevTools Memory tab shows heap growing ~1–3MB per minute with normal use
- Event listener count in DevTools increases over time even when no new components are mounted
- Hard to reproduce in short dev sessions; consistent in production after ~15 min

## What to Investigate

The memory and listener growth pattern suggests something is not being cleaned up properly. Could be an event listener, a subscription, a timer, or a ref. The keyboard shortcut double-firing is a strong clue.
