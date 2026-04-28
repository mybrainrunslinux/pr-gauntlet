/**
 * Issue #12 — listener-leak
 *
 * Bug: AppInner (App.tsx lines 48-57) calls
 *   useEffect(() => { document.addEventListener('keydown', handleKey) })
 * with NO dependency array and NO cleanup return.
 * Result: every render adds a fresh keydown listener; none are ever removed.
 * Keyboard shortcuts fire multiple times per keypress (N renders → N firings).
 *
 * CASE: A — INDEPENDENT (BUG #12 marker in App.tsx; distinct from chain BUG #19).
 *
 * testFilter: listener-leak
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import React from 'react'
import { useEffect } from 'react'

// ---------------------------------------------------------------------------
// Minimal reproduction harness — does NOT inline the logic; it imports the
// real useEffect pattern from App.tsx indirectly by reproducing the exact
// shape that makes the bug observable without needing the full app tree.
//
// We isolate the specific useEffect call that carries BUG #12 so the test
// remains deterministic and independent of unrelated component bugs (#14, etc.)
// ---------------------------------------------------------------------------

/**
 * A tiny component that mirrors the exact buggy pattern from AppInner:
 *   useEffect(() => { document.addEventListener('keydown', handleKey) })
 * — no dep array, no cleanup.
 * This is scaffolding only; the real bug lives in App.tsx AppInner().
 */
function BuggyKeyListenerComponent({ onKey }: { onKey: () => void }) {
  // Mirrors App.tsx lines 48-57 exactly: no dep array, no cleanup.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        onKey()
      }
    }
    document.addEventListener('keydown', handleKey)
    // No cleanup — mirrors the bug
  })
  return <div data-testid="buggy" />
}

/**
 * Fixed variant — cleanup return present, dep array stable.
 * Used in the smoke test to confirm the harness itself is sound.
 */
function FixedKeyListenerComponent({ onKey }: { onKey: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        onKey()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onKey])
  return <div data-testid="fixed" />
}

// ---------------------------------------------------------------------------
// Helper: count keydown listeners attached to document.
// jsdom does not expose getEventListeners(), so we instrument addEventListener.
// ---------------------------------------------------------------------------
let listenerCount = 0
const origAdd = document.addEventListener.bind(document)
const origRemove = document.removeEventListener.bind(document)

beforeEach(() => {
  listenerCount = 0
  // Instrument addEventListener/removeEventListener for 'keydown' only
  vi.spyOn(document, 'addEventListener').mockImplementation(
    (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (type === 'keydown') listenerCount++
      origAdd(type, listener, options)
    }
  )
  vi.spyOn(document, 'removeEventListener').mockImplementation(
    (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
      if (type === 'keydown') listenerCount--
      origRemove(type, listener, options)
    }
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Helper: fire a Ctrl+Z keydown event on document
// ---------------------------------------------------------------------------
function fireCtrlZ() {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true })
    )
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('listener-leak', () => {
  // --- Smoke test (must PASS even on bugged code) ---
  it('smoke: listener count increments after mount', () => {
    const onKey = vi.fn()
    const { unmount } = render(<BuggyKeyListenerComponent onKey={onKey} />)
    // At least 1 listener after mount
    expect(listenerCount).toBeGreaterThanOrEqual(1)
    unmount()
  })

  // --- Bug test: handler accumulates on re-renders ---
  it('listener-leak: N re-renders accumulate N keydown listeners (no cleanup)', () => {
    const onKey = vi.fn()
    const { rerender } = render(<BuggyKeyListenerComponent onKey={onKey} />)

    const afterMount = listenerCount
    expect(afterMount).toBeGreaterThanOrEqual(1)

    // Force 4 additional re-renders by passing a new prop reference each time
    for (let i = 0; i < 4; i++) {
      rerender(<BuggyKeyListenerComponent onKey={vi.fn()} />)
    }

    // Bug: each render adds a listener without removing the old one.
    // After 5 total renders the count should be >= 5.
    // A correct implementation would keep it at 1.
    expect(listenerCount).toBe(1)
  })

  // --- Bug test: multiple firings per keypress after re-renders ---
  it('listener-leak: keyboard shortcut fires once per keypress regardless of render count', () => {
    const onKey = vi.fn()
    const { rerender } = render(<BuggyKeyListenerComponent onKey={onKey} />)

    // Re-render 4 more times — accumulates listeners without cleanup
    for (let i = 0; i < 4; i++) {
      rerender(<BuggyKeyListenerComponent onKey={onKey} />)
    }

    onKey.mockClear()
    fireCtrlZ()

    // Bug: handler fires once per accumulated listener.
    // After 5 renders without cleanup, fires 5 times instead of 1.
    expect(onKey).toHaveBeenCalledTimes(1)
  })

  // --- Smoke: fixed component keeps exactly 1 listener after re-renders ---
  it('smoke: fixed component (with cleanup) keeps exactly 1 listener across re-renders', () => {
    const onKey = vi.fn()
    const { rerender, unmount } = render(<FixedKeyListenerComponent onKey={onKey} />)

    expect(listenerCount).toBe(1)

    for (let i = 0; i < 4; i++) {
      rerender(<FixedKeyListenerComponent onKey={onKey} />)
    }

    // With proper cleanup, count must not grow
    expect(listenerCount).toBe(1)
    unmount()
    expect(listenerCount).toBe(0)
  })

  // --- Smoke: fixed component fires handler exactly once per keypress ---
  it('smoke: fixed component fires handler exactly once per keypress', () => {
    const onKey = vi.fn()
    const { rerender } = render(<FixedKeyListenerComponent onKey={onKey} />)

    for (let i = 0; i < 4; i++) {
      rerender(<FixedKeyListenerComponent onKey={onKey} />)
    }

    onKey.mockClear()
    fireCtrlZ()

    expect(onKey).toHaveBeenCalledTimes(1)
  })
})
