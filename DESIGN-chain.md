# PR-Gauntlet — Chain Primitive Design

The dependency chain in Issues 16–20 must share a single real code path.
This doc locks that primitive before any app code is written.

## The Hook: `useSubscription`

```typescript
// src/hooks/useSubscription.ts  (BUGGED VERSION — as shipped in v1-bugged)
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  useEffect(() => {
    eventBus.subscribe(topic, handler)
    // MISSING: return () => eventBus.unsubscribe(topic, handler)
  }, [topic, handler])
  // BUG 1: no cleanup — handlers accumulate on every call
  // BUG 2: handler is a new ref on every render → re-registers every render
}
```

```typescript
// src/hooks/useSubscription.ts  (FIXED VERSION)
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const stableHandler = (data: T) => handlerRef.current(data)
    eventBus.subscribe(topic, stableHandler)
    return () => eventBus.unsubscribe(topic, stableHandler)
  }, [topic]) // stable dep, fires once per topic mount
}
```

## The Four Call Sites

| File | Topic | What breaks without fix |
|------|-------|------------------------|
| `src/features/board/useDragDrop.ts` | `'drag:end'` | Issue 19: heap grows ~2MB/min — each drag adds a permanent handler |
| `src/features/sync/useWebSocket.ts` | `'ws:card-update'` | Issue 18: 10+ handlers accumulate, each with stale card state snapshot |
| `src/features/board/useCardStats.ts` | `'card:update'` | Issue 16: stats recalculated N times per event (N = number of mounts) |
| `src/features/notifications/useNotifications.ts` | `'user:mention'` | (side effect of 18 — not a standalone issue) |

## The Cascade

```
Fix useSubscription cleanup (Issue 19 root)
  → useDragDrop no longer accumulates handlers          → Issue 19 PASSES
  → useWebSocket no longer accumulates handlers         → Issue 18 PASSES
    → WebSocket handlers see current state via ref      → Issue 17 PASSES
      → No duplicate state updates in same frame        → Issue 20 PASSES
  → useCardStats fires once per event                   → Issue 16 PASSES (partial)
```

## Test Probes (behavioral, not implementation)

```
Issue 19 test: render BoardView, perform 50 drags, measure
  window.performance.memory.usedJSHeapSize delta < 10MB

Issue 18 test: simulate 10 ws 'card-update' events for card X,
  final card state === last event data (not an older snapshot)

Issue 17 test: simulate 5 rapid drag→ws-update pairs in 100ms,
  card ends in position set by last drag, not reverted by ws

Issue 20 test: trigger 20 concurrent ws events,
  no "Maximum update depth exceeded" console error

Issue 16 test: spy on computeStats(), fire 1 card:update event,
  computeStats called exactly once (not N times)
```

**Acceptance criterion:** running `vitest run tests/chain/` on v0-clean passes 5/5;
on v1-bugged fails 5/5. If that isn't true, the design isn't right yet.
