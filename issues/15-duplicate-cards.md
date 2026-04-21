# Issue #15: Cards appear duplicated after page refresh or WebSocket reconnect

**Tier:** 3 — Vague  
**Labels:** bug, sync, websocket

## Description

After refreshing the page or after a WebSocket reconnection (e.g. coming back from sleep, network blip), some cards appear twice in their column — identical cards, same ID, same content, side by side.

This is resolved by a second refresh, but users are noticing it frequently on flaky connections.

## Steps to Reproduce (somewhat reliable)

1. Load the board (cards appear normally)
2. Disconnect from the network for 10–30 seconds (airplane mode works)
3. Reconnect
4. Observe: some cards may now appear in duplicate

## Additional Context

- Duplicates always have the same card ID — they are not new cards, just rendered twice
- The duplication clears after another refresh or after a new card is added
- More cards are affected on larger boards
- The server is not sending duplicate cards — this is a client-side rendering issue

## What to Investigate

The WebSocket reconnect path and the initial HTTP fetch path may both be adding cards to the same state array, rather than one replacing or merging with the other.
