/**
 * chain-symptoms.test.ts
 *
 * Five describe blocks — each title contains the scorer's testFilter substring:
 *   chain-stats | chain-race | chain-stale | chain-leak | chain-crash
 *
 * Every block has:
 *   - One smoke assertion (must PASS on buggy code — proves test is runnable)
 *   - One bug assertion (must FAIL on buggy code — exposes the symptom)
 *
 * Root cause (useSubscription.ts v1-bugged):
 *   • No cleanup return → handlers accumulate on every re-render
 *   • handler identity changes each render → new subscription added without
 *     removing the previous one
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { eventBus } from '../../../src/utils/eventBus'
import { useSubscription } from '../../../src/hooks/useSubscription'

// Reset event-bus state between every test (matches existing pattern)
beforeEach(() => {
  ;(eventBus as any).listeners.clear()
})

// ---------------------------------------------------------------------------
// Issue #16 — Board sluggish when multiple collaborators are active
// ---------------------------------------------------------------------------
describe('chain-stats — handler accumulation degrades collaboration perf', () => {
  it('smoke: single mount → handler fires exactly once per event', () => {
    const handler = vi.fn()
    renderHook(() => useSubscription('stats:topic', handler))

    act(() => { eventBus.emit('stats:topic', { update: 1 }) })

    // With a single render there is only one registration; smoke always passes.
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('bug: N re-renders accumulate N handlers — one event fires handler N times instead of once', () => {
    // Simulate a component that re-renders N times (e.g., 5 collaborators
    // each triggering a state update that forces the hook to run again).
    const invocations = { count: 0 }
    const { rerender } = renderHook(
      ({ label }: { label: string }) =>
        useSubscription('stats:collab', (_data: unknown) => { invocations.count++ }),
      { initialProps: { label: 'render-1' } }
    )

    // Simulate 4 more re-renders — each one adds a new handler without cleaning up
    rerender({ label: 'render-2' })
    rerender({ label: 'render-3' })
    rerender({ label: 'render-4' })
    rerender({ label: 'render-5' })

    invocations.count = 0 // reset so we only count the next emission
    act(() => { eventBus.emit('stats:collab', { active: 5 }) })

    // After 5 renders there should be 5 accumulated handlers calling the function.
    // On fixed code only ONE handler should fire.
    // This assertion FAILS on buggy code (gets 5, not 1) and PASSES on fixed code.
    expect(invocations.count).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Issue #17 — Cards snap back to wrong column after rapid moves
// ---------------------------------------------------------------------------
describe('chain-race — rapid moves race due to stale handler', () => {
  it('smoke: stable handler receives the event payload correctly', () => {
    const received: unknown[] = []
    renderHook(() =>
      useSubscription('race:topic', (data: unknown) => { received.push(data) })
    )

    act(() => { eventBus.emit('race:topic', { column: 'done' }) })

    expect(received).toHaveLength(1)
    expect(received[0]).toEqual({ column: 'done' })
  })

  it('bug: after rapid re-renders stale handlers fire with outdated column values', () => {
    // Each re-render captures a new "currentColumn" in closure.
    // Without cleanup the OLD closure (stale column) is still registered.
    // After rapid moves the bug causes old column values to appear.
    let currentColumn = 'backlog'
    const seenColumns: string[] = []

    const { rerender } = renderHook(
      ({ col }: { col: string }) =>
        useSubscription('race:move', (_data: unknown) => {
          seenColumns.push(col) // captures col from closure
        }),
      { initialProps: { col: 'backlog' } }
    )

    // Simulate rapid moves: column changes before WS sync completes
    rerender({ col: 'in-progress' })
    rerender({ col: 'done' })

    seenColumns.length = 0 // reset before emission
    currentColumn = 'done'
    act(() => { eventBus.emit('race:move', { card: 'card-1' }) })

    // On fixed code: exactly one call with 'done' (the latest column).
    // On buggy code: multiple calls including stale 'backlog' and 'in-progress'.
    // We assert that only the latest value is observed and only once.
    expect(seenColumns).toHaveLength(1)
    expect(seenColumns[0]).toBe('done')
  })
})

// ---------------------------------------------------------------------------
// Issue #18 — WebSocket updates sometimes revert recent card changes
// ---------------------------------------------------------------------------
describe('chain-stale — websocket message uses stale handler closure', () => {
  it('smoke: before any re-render, published event is received by the registered handler', () => {
    const handlerA = vi.fn()
    renderHook(() => useSubscription('stale:ws', handlerA))

    act(() => { eventBus.emit('stale:ws', { cardId: 'card-X', title: 'Original' }) })

    expect(handlerA).toHaveBeenCalledTimes(1)
    expect(handlerA).toHaveBeenCalledWith({ cardId: 'card-X', title: 'Original' })
  })

  it('bug: re-render with new handler → old stale handler still fires instead of (or alongside) new one', () => {
    // handlerA captures stale state (pre-edit snapshot).
    // handlerB captures fresh state (post-edit snapshot).
    // On buggy code: re-render adds handlerB but keeps handlerA registered.
    // A WS event for an unrelated card invokes BOTH handlers — the stale one
    // (handlerA) overwrites User A's edit with stale data.
    const handlerA = vi.fn()
    const handlerB = vi.fn()

    const { rerender } = renderHook(
      ({ handler }: { handler: typeof handlerA }) =>
        useSubscription('stale:ws-update', handler),
      { initialProps: { handler: handlerA } }
    )

    // User edits card — component re-renders with fresh handler
    rerender({ handler: handlerB })

    act(() => { eventBus.emit('stale:ws-update', { cardId: 'card-Y', col: 'done' }) })

    // Fixed: only handlerB called (1 total), handlerA NOT called.
    // Buggy: handlerA is also called (stale handler still registered).
    expect(handlerA).not.toHaveBeenCalled()
    expect(handlerB).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Issue #19 — Memory leak during drag-drop operations
// ---------------------------------------------------------------------------
describe('chain-leak — drag-drop subscription leak', () => {
  it('smoke: after mount, exactly one listener is registered for the topic', () => {
    renderHook(() => useSubscription('leak:drag', vi.fn()))

    expect(eventBus.subscriberCount('leak:drag')).toBe(1)
  })

  it('bug: after unmount, listener is NOT removed — handler persists (memory leak)', () => {
    const { unmount } = renderHook(() =>
      useSubscription('leak:dragdrop', vi.fn())
    )

    // Sanity — registered before unmount
    expect(eventBus.subscriberCount('leak:dragdrop')).toBe(1)

    unmount()

    // Fixed code: listener removed → count 0.
    // Buggy code: no cleanup return → listener remains → count 1.
    expect(eventBus.subscriberCount('leak:dragdrop')).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Issue #20 — App crashes with phantom handler after unmount
// ---------------------------------------------------------------------------
describe('chain-crash — concurrent updates crash on phantom handler', () => {
  it('smoke: active component receives event without error', () => {
    const handler = vi.fn()
    expect(() => {
      renderHook(() => useSubscription('crash:topic', handler))
      act(() => { eventBus.emit('crash:topic', { type: 'card:update' }) })
    }).not.toThrow()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('bug: after unmount, phantom handler still fires — should be silent after cleanup', () => {
    // On v1-bugged: unmount does not clean up → handler continues to fire
    // post-unmount, causing state updates on unmounted components which
    // triggers "Maximum update depth exceeded" in real React trees.
    let callsAfterUnmount = 0
    let mounted = true

    const { unmount } = renderHook(() =>
      useSubscription('crash:phantom', (_data: unknown) => {
        if (!mounted) {
          callsAfterUnmount++
        }
      })
    )

    unmount()
    mounted = false // from this point any invocation is a phantom call

    act(() => { eventBus.emit('crash:phantom', { concurrent: true }) })

    // Fixed code: handler removed → callsAfterUnmount === 0.
    // Buggy code: handler still in listeners → callsAfterUnmount > 0.
    expect(callsAfterUnmount).toBe(0)
  })
})
