# Issue #16: Board sluggish when multiple collaborators are active

**Tier:** 4 — Chain  
**Labels:** bug, performance, websocket  
**Note:** Related to #18, #19

## Description

When 3 or more team members are editing the same board simultaneously, card interactions become slow (200–400ms lag on drag-drop, typing in cards feels unresponsive). Performance degrades further the longer the session runs.

Single-user sessions are unaffected.

## Observed Behavior

- Drag-drop completion takes noticeably longer with more active users
- The board's "active users" indicator shows 3 users → interaction latency increases
- Leaving the board tab open for an hour with collaborators makes it nearly unusable
- Stats and badges update multiple times per second unnecessarily

## What We Suspect

Likely related to how WebSocket updates are processed when multiple users are generating events. The board may be doing redundant work per incoming event.

## Impact

High for teams using real-time collaboration. Solo users unaffected.
