/**
 * Issue #11 — Tab switch preserves unsaved edits (preferences)
 *
 * Root cause: usePreferences.ts lines 23-33
 *
 * The hook registers a `visibilitychange` listener inside a useEffect with
 * dependency array `[prefs]`.  The listener closes over `prefs` at the time
 * the effect ran.  When the user:
 *
 *   1. Calls setPrefs({ darkMode: false }) — saves new prefs to localStorage
 *      and queues a React state update (setPrefsState).
 *   2. Before React re-renders and the effect cleanup/re-register cycle
 *      completes, the tab becomes visible again (visibilitychange fires).
 *
 * On the `visible` transition the stale handler fires:
 *
 *   savePreferences('taskflow:prefs', prefs)  // prefs is the OLD closure value
 *
 * This overwrites the newly saved localStorage entry with stale data.
 *
 * Mechanism: stale closure in visibilitychange handler.
 * The effect depends on [prefs], so a new handler is registered on every
 * render.  But between calling setPrefs() and the next render (async in the
 * browser), the OLD handler is still live.  If the tab returns during that
 * window, the old handler fires and clobbers the fresh localStorage value.
 *
 * Fix (one file, one change): inside onVisibility, read current prefs via a
 * ref (prefsRef.current = prefs kept in sync) instead of the closure value.
 * Alternatively, remove the savePreferences call from onVisibility entirely —
 * the save already happens synchronously in setPrefs.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePreferences } from '../../src/hooks/usePreferences'

// ---------------------------------------------------------------------------
// localStorage mock — use vi.stubGlobal for reliable jsdom compatibility
// ---------------------------------------------------------------------------
const PREFS_KEY = 'taskflow:prefs'

let store: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { store = {} },
  get length() { return Object.keys(store).length },
  key: (index: number) => Object.keys(store)[index] ?? null,
}

// ---------------------------------------------------------------------------
// visibilityState helpers
// ---------------------------------------------------------------------------
function setVisible() {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'visible',
  })
}

function setHidden() {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'hidden',
  })
}

function dispatchVisibility() {
  document.dispatchEvent(new Event('visibilitychange'))
}

function readStorage(): Record<string, unknown> | null {
  const raw = store[PREFS_KEY]
  if (!raw) return null
  return JSON.parse(raw)
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------
beforeEach(() => {
  store = {}
  vi.stubGlobal('localStorage', localStorageMock)
  setVisible()
})

afterEach(() => {
  store = {}
  vi.unstubAllGlobals()
  setVisible()
})

// ---------------------------------------------------------------------------
// Smoke tests — hook is importable and returns expected shape
// ---------------------------------------------------------------------------
describe('tab-switch smoke', () => {
  it('tab-switch: usePreferences is importable and returns prefs + setPrefs', () => {
    const { result } = renderHook(() => usePreferences())
    expect(result.current.prefs).toBeDefined()
    expect(typeof result.current.setPrefs).toBe('function')
  })

  it('tab-switch: default prefs include darkMode, compactView, sortOrder, notifications', () => {
    const { result } = renderHook(() => usePreferences())
    const { prefs } = result.current
    expect(typeof prefs.darkMode).toBe('boolean')
    expect(typeof prefs.compactView).toBe('boolean')
    expect(typeof prefs.sortOrder).toBe('string')
    expect(typeof prefs.notifications).toBe('boolean')
  })

  it('tab-switch: setPrefs updates the returned prefs object', () => {
    const { result } = renderHook(() => usePreferences())
    const originalDarkMode = result.current.prefs.darkMode

    act(() => {
      result.current.setPrefs({ darkMode: !originalDarkMode })
    })

    expect(result.current.prefs.darkMode).toBe(!originalDarkMode)
  })
})

// ---------------------------------------------------------------------------
// Bug reproduction
//
// Key insight: act() normally flushes effects synchronously, hiding the stale-
// closure bug.  To expose the real mechanism we fire the visibilitychange event
// INSIDE the same act() call as setPrefs, before React has a chance to re-run
// the effect and update the closure.  This mirrors the real-world race where
// the browser fires the event in the same microtask batch as the state update.
//
// The bug is in the onVisibility handler at usePreferences.ts:26-29:
//   if (document.visibilityState === 'visible') {
//     savePreferences('taskflow:prefs', prefs)   ← prefs is stale here
//   }
//
// This unconditional save on tab-return is the defect.  The save in setPrefs
// already persisted the new value.  Re-saving on visibility change is only
// safe if the handler captures the latest prefs — which it does not when the
// closure is stale.
// ---------------------------------------------------------------------------
describe('tab-switch', () => {
  it('tab-switch: localStorage retains updated prefs after tab hide + show sequence', () => {
    /**
     * Fire the visibilitychange event INSIDE the same act() as setPrefs so
     * the old effect handler (stale closure) runs before React can re-register
     * the effect with the updated prefs.
     *
     * Sequence inside a single act():
     *   a) tab goes hidden
     *   b) setPrefs called — writes new value to localStorage AND queues state update
     *   c) tab comes back (visibilitychange = visible)
     *      → OLD handler fires: savePreferences(key, oldPrefs) ← clobbers localStorage
     *
     * On the buggy code: localStorage ends up with oldPrefs.darkMode.
     * On the fixed code: localStorage retains the new darkMode value.
     */
    const { result } = renderHook(() => usePreferences())

    const initialDarkMode = result.current.prefs.darkMode
    const updatedDarkMode = !initialDarkMode

    act(() => {
      // Simulate: user is on the tab, starts editing, tab goes away
      setHidden()
      dispatchVisibility()

      // User updates prefs (writes new value to localStorage)
      result.current.setPrefs({ darkMode: updatedDarkMode })

      // Tab comes back — old handler fires BEFORE effect re-runs
      setVisible()
      dispatchVisibility()
    })

    // localStorage must still hold the updated value.
    // BUG: old handler calls savePreferences(key, initialDarkMode), reverting it.
    const stored = readStorage()
    expect(stored).not.toBeNull()
    expect(stored!.darkMode).toBe(updatedDarkMode)
  })

  it('tab-switch: in-memory prefs state is not reverted after tab switch', () => {
    /**
     * The in-memory React state should always hold the updated value regardless
     * of what the visibilitychange handler does to localStorage.
     * This verifies the state side of the invariant.
     */
    const { result } = renderHook(() => usePreferences())

    const initialDarkMode = result.current.prefs.darkMode
    const updatedDarkMode = !initialDarkMode

    act(() => {
      setHidden()
      dispatchVisibility()
      result.current.setPrefs({ darkMode: updatedDarkMode })
      setVisible()
      dispatchVisibility()
    })

    expect(result.current.prefs.darkMode).toBe(updatedDarkMode)
  })

  it('tab-switch: multiple setPrefs calls all survive a tab switch', () => {
    /**
     * Make three sequential updates then simulate a rapid tab return.
     * The handler closed over the prefs from the FIRST render (before any
     * updates) is the most dangerous — it would revert all three changes.
     */
    const { result } = renderHook(() => usePreferences())

    act(() => {
      result.current.setPrefs({ darkMode: false })
    })
    act(() => {
      result.current.setPrefs({ compactView: true })
    })

    // Third update + tab cycle in same act — exposes stale closure
    act(() => {
      result.current.setPrefs({ sortOrder: 'dueDate' })
      setHidden()
      dispatchVisibility()
      setVisible()
      dispatchVisibility()
    })

    const stored = readStorage()
    expect(stored).not.toBeNull()
    expect(stored!.darkMode).toBe(false)
    expect(stored!.compactView).toBe(true)
    expect(stored!.sortOrder).toBe('dueDate')
  })

  it('tab-switch: a remounted hook loads the correct (non-corrupted) prefs', () => {
    /**
     * If localStorage is corrupted by the stale handler, a remounted hook
     * will reload the stale values from storage.  Unmount + remount after
     * the tab cycle exercises this path.
     */
    const first = renderHook(() => usePreferences())

    const initial = first.result.current.prefs.darkMode
    const updated = !initial

    act(() => {
      setHidden()
      dispatchVisibility()
      first.result.current.setPrefs({ darkMode: updated })
      setVisible()
      dispatchVisibility()
    })

    first.unmount()

    // Fresh instance reads from localStorage
    const second = renderHook(() => usePreferences())

    // BUG: if localStorage was corrupted, this returns `initial` (stale).
    expect(second.result.current.prefs.darkMode).toBe(updated)
  })
})
