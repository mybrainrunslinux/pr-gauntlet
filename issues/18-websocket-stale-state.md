# Issue #18: WebSocket updates sometimes revert recent card changes

**Tier:** 4 — Chain  
**Labels:** bug, websocket, stale-state  
**Note:** Caused by #19 (same pattern); fixing #19 resolves this issue

## Description

Incoming WebSocket messages from other users occasionally overwrite local changes that were made within the last few seconds. A user edits a card title, another user makes an unrelated change, and the first user's edit disappears.

This is not a conflict resolution issue — the edits are to *different fields on different cards*. One user's change should not affect another's.

## Observed Pattern

- User A edits Card X (changes title)
- User B (or the server) sends a `card:update` event for Card Y
- User A's change to Card X is reverted

## Why This Is Confusing

The `card:update` event for Card Y should not touch Card X at all. Yet it somehow causes Card X to revert to its pre-edit state.

## Notes

- Happens more frequently as the session runs longer (minutes, not seconds after load)
- Fresh browser sessions have the problem much less frequently
- Adding `console.log` to the WebSocket handler shows it fires more times than expected per incoming message — sometimes 8–10 times for a single WS event
- Each firing appears to use a different (older) snapshot of the cards state
