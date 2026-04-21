# Issue #20: App crashes with "Maximum update depth exceeded" during concurrent edits

**Tier:** 4 — Chain  
**Labels:** bug, crash, react, websocket  
**Note:** Resolved automatically when #17, #18, #19 are fixed

## Description

Under heavy concurrent use (multiple users making changes rapidly), the app crashes with a React error:

```
Error: Maximum update depth exceeded. This can happen when a component calls setState 
inside useEffect, but useEffect either doesn't have a dependency array, or one of 
the dependencies changes on every render.
```

The crash brings down the entire board view. Users must refresh.

## Reproduction Conditions

- Requires 2+ active users making changes simultaneously
- More likely when the session has been running for >5 minutes
- Can be triggered in solo testing by running a script that fires 20 WebSocket events in rapid succession
- More likely during "end of sprint" activity when the whole team is moving cards

## Test Script (paste in browser console after 5 minutes of use)

```javascript
// Simulate rapid WS events — if bug is present, crashes within ~20 events
for (let i = 0; i < 20; i++) {
  window.__taskflow_ws_debug?.inject({ type: 'card:update', card: { id: `card-${i % 5}`, column: 'done' } })
}
```

## Notes

- The error originates in a setState call inside a WebSocket event handler
- The handler appears to be firing multiple times per event (see #18)
- Fixing the underlying subscription management in the drag-drop and WebSocket layers is likely to resolve this as a side effect
- Do not simply wrap with try/catch — address the root cause
