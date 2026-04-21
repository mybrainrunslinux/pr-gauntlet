# Issue #17: Cards snap back to wrong column after rapid moves

**Tier:** 4 — Chain  
**Labels:** bug, drag-drop, websocket, race-condition  
**Note:** Caused by #18; fixing #18 resolves this issue

## Description

When a user drags a card quickly (move, then immediately move again before the first WebSocket sync completes), the card sometimes ends up in the wrong column — specifically, the column it was in *before* the first move, not the column it was most recently dragged to.

It looks like the card "snaps back" after the second move lands.

## Steps to Reproduce

1. Have two columns: "Backlog" and "In Progress"
2. Drag a card from Backlog → In Progress
3. Immediately (within ~200ms) drag it from In Progress → Done
4. Wait 1–2 seconds
5. Observe: card may reappear in "In Progress" or "Backlog" instead of "Done"

## Expected

Card stays in the most recent column it was dragged to.

## Notes

- This only happens during the brief window when a WebSocket update is in flight
- Disabling WebSocket sync entirely makes the bug disappear
- Slowing down the network (Chrome DevTools throttling) makes it easier to reproduce
- The server-side position is correct — the issue is client-side state management
