/**
 * Issue #12 — listener-leak
 *
 * Bug: AppInner (app/src/App.tsx lines 49-57) calls
 *   useEffect(() => { document.addEventListener('keydown', handleKey) })
 * with NO dependency array and NO cleanup return.
 * Each render adds a fresh 'keydown' listener; none are ever removed.
 * After N renders, pressing a key fires the shortcut N times.
 *
 * testFilter: listener-leak
 *
 * CASE: A — INDEPENDENT (BUG #12 marker in App.tsx; distinct from chain BUG #19)
 */
import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import type { AppState, AppAction } from '../../src/types'
import { reducer } from '../../src/store/reducer'
import { CARDS, COLUMNS, USERS, LABELS, SPRINTS } from '../../src/data/seed'

// ---------------------------------------------------------------------------
// Stable AppContext mock — SCAFFOLDING to neutralise BUG #14.
//
// AppContext.tsx has BUG #14: AppProvider uses key={Date.now()} on the inner
// Provider element, causing a full subtree remount on every render.
// We replace AppProvider with a stable version sharing the same context ref.
// The mock is hoisted by vitest before the import of AppInner below.
// ---------------------------------------------------------------------------

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const StableContext = createContext<AppContextValue | null>(null)

const initialState: AppState = {
  cards: CARDS,
  columns: COLUMNS,
  users: USERS,
  labels: LABELS,
  sprints: SPRINTS,
  currentUserId: 'u1',
  searchQuery: '',
  activeSprintId: null,
  sprintViewEnabled: false,
  boardName: 'My Board',
}

function StableAppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return React.createElement(StableContext.Provider, { value: { state, dispatch } }, children)
}

function useStableAppContext(): AppContextValue {
  const ctx = useContext(StableContext)
  if (!ctx) throw new Error('must be inside StableAppProvider')
  return ctx
}

vi.mock('../../src/store/AppContext', () => ({
  AppProvider: StableAppProvider,
  useAppContext: useStableAppContext,
}))

// ---------------------------------------------------------------------------
// Scaffolding mocks — prevent noise from components NOT under test.
//
// AppInner renders BoardHeader (SearchBar, SprintSelector, BoardStats) and
// BoardView (DnD context, Column, Card). None are under test; BUG #12 lives
// solely in AppInner's useEffect. Mocking avoids DnD setup errors and keeps
// the listener spy signal clean.
// ---------------------------------------------------------------------------
vi.mock('../../src/hooks/useWebSocket', () => ({
  useWebSocket: () => undefined,
}))

vi.mock('../../src/features/board/BoardView', () => ({
  BoardView: () => React.createElement('div', { 'data-testid': 'mock-board-view' }),
}))

vi.mock('../../src/features/filters/SearchBar', () => ({
  SearchBar: () => React.createElement('div', { 'data-testid': 'mock-search-bar' }),
}))

vi.mock('../../src/features/filters/SprintSelector', () => ({
  SprintSelector: () => React.createElement('div', { 'data-testid': 'mock-sprint-selector' }),
}))

vi.mock('../../src/features/stats/BoardStats', () => ({
  BoardStats: () => React.createElement('div', { 'data-testid': 'mock-board-stats' }),
}))

// ---------------------------------------------------------------------------
// Import the REAL AppInner — the component whose useEffect contains BUG #12.
// `export` was added to App.tsx solely as a test affordance.
// ---------------------------------------------------------------------------
import { AppInner } from '../../src/App'

// ---------------------------------------------------------------------------
// Wrapper: stable context provider wrapping the real AppInner.
// ---------------------------------------------------------------------------
function Wrapper() {
  return React.createElement(
    StableAppProvider,
    null,
    React.createElement(AppInner, null)
  )
}

// ---------------------------------------------------------------------------
// Listener spy infrastructure.
//
// jsdom does not expose getEventListeners(). We spy on document.addEventListener
// and document.removeEventListener and track the NET DELTA of 'keydown'
// registrations per test. Net delta (adds minus removes) is used rather than
// absolute count so the assertion is independent of any pre-existing listeners
// attached by jsdom or other test infrastructure.
//
// origAdd / origRemove are captured fresh each beforeEach after restoring mocks,
// so they always point to the real (un-spied) implementation.
// ---------------------------------------------------------------------------
let keydownNetDelta = 0

beforeEach(() => {
  keydownNetDelta = 0

  const realAdd = document.addEventListener.bind(document)
  const realRemove = document.removeEventListener.bind(document)

  vi.spyOn(document, 'addEventListener').mockImplementation(
    (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (type === 'keydown') keydownNetDelta++
      realAdd(type, listener, options)
    }
  )
  vi.spyOn(document, 'removeEventListener').mockImplementation(
    (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
      if (type === 'keydown') keydownNetDelta--
      realRemove(type, listener, options)
    }
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  keydownNetDelta = 0
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('listener-leak', () => {
  // -------------------------------------------------------------------------
  // Smoke 1: AppInner mounts without throwing and produces expected markup.
  // Validates mock scaffolding is wired up correctly.
  // Must PASS on v1-bugged source.
  // -------------------------------------------------------------------------
  it('smoke: AppInner renders without error and produces app container', () => {
    const { container, unmount } = render(React.createElement(Wrapper))
    expect(container.querySelector('.app')).not.toBeNull()
    unmount()
  })

  // -------------------------------------------------------------------------
  // Smoke 2: Single mount adds exactly 1 keydown listener (net delta = 1).
  // Validates the spy is correctly counting additions.
  // Must PASS on v1-bugged source.
  // -------------------------------------------------------------------------
  it('smoke: single mount registers exactly 1 keydown listener', () => {
    const { unmount } = render(React.createElement(Wrapper))
    expect(keydownNetDelta).toBe(1)
    unmount()
  })

  // -------------------------------------------------------------------------
  // Bug test: after N re-renders the net keydown listener delta must stay at 1.
  //
  // On v1-bugged (App.tsx lines 49-57):
  //   useEffect runs on every render (no dep array) and never removes the
  //   previous listener (no cleanup return). After 5 renders → delta = 5.
  //   FAILS on v1-bugged.
  //
  // After dev fix:
  //   useEffect runs once on mount; cleanup return removes the listener before
  //   re-registering (if deps change) or never re-registers (if dep array is
  //   stable []). After 5 renders → delta = 1.
  //   PASSES after fix.
  //
  // This test exercises the REAL AppInner from app/src/App.tsx.
  // Dev fixes App.tsx; this test passes without modification.
  // -------------------------------------------------------------------------
  it('listener-leak: keydown listener net delta stays at 1 across N re-renders', () => {
    const { rerender, unmount } = render(React.createElement(Wrapper))

    // 1 mount + 4 forced re-renders = 5 total render cycles
    for (let i = 0; i < 4; i++) {
      act(() => {
        rerender(React.createElement(Wrapper))
      })
    }

    // Bugged:  delta = 5 — one new listener added per render, none removed
    // Fixed:   delta = 1 — effect runs once on mount, cleanup prevents accumulation
    expect(keydownNetDelta).toBe(1)

    unmount()
  })
})
