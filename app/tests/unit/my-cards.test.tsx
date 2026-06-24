/**
 * Issue #13 — my-cards
 *
 * Bug: BoardView.tsx line 18
 *   cards = cards.filter(c => c.assigneeId === currentUser.name)
 * should be:
 *   cards = cards.filter(c => c.assigneeId === currentUser.id)
 *
 * The "My Cards" filter compares card.assigneeId (which stores user IDs like
 * 'u1') against currentUser.name (e.g. 'Alice Chen'). They never match, so
 * all users see no cards when using "My Cards".
 *
 * testFilter: my-cards
 *
 * Fix: change `currentUser.name` → `currentUser.id` on line 18 of BoardView.tsx.
 */

import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { AppState, AppAction, Card, Column } from '../../src/types'
import { reducer } from '../../src/store/reducer'

// ---------------------------------------------------------------------------
// Stable AppContext — SCAFFOLDING to neutralise BUG #14.
//
// AppContext.tsx (BUG #14) uses key={Date.now()} on its Provider, causing a
// full subtree remount on every render. We replace it with a stable context
// singleton. The mock factory below references this module-scope context ref
// directly — no closures over per-test variables.
// ---------------------------------------------------------------------------

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

// Single context instance shared by mock provider and mock hook.
const StableContext = createContext<AppContextValue | null>(null)

// ---------------------------------------------------------------------------
// Mock declarations — vi.mock is hoisted to the top of the compiled output,
// so the factory runs before any test code. We must only reference module-scope
// symbols that are initialised at parse time (class/const declarations are fine;
// let variables assigned later are not safe to close over inside the factory).
// StableContext is a const declared above, so it is safe to reference here.
// ---------------------------------------------------------------------------

vi.mock('../../src/store/AppContext', () => ({
  // AppProvider is replaced so tests can supply their own initial state via
  // the Wrapper component defined below — it renders StableContext.Provider
  // directly without going through AppProvider at all.
  AppProvider: ({ children }: { children: ReactNode }) =>
    React.createElement(React.Fragment, null, children),

  // useAppContext reads from StableContext, which each test populates via Wrapper.
  useAppContext: (): AppContextValue => {
    const ctx = useContext(StableContext)
    if (!ctx) throw new Error('useAppContext: must be inside Wrapper (StableContext)')
    return ctx
  },
}))

// Mock Column to render cards as simple data-testid spans.
// Column and CardItem use @dnd-kit/sortable (useDroppable, useSortable) which
// requires a real DndContext tree. BoardView already wraps its children in
// DndContext, but Column and CardItem also call useSortable internally.
// Mocking Column keeps the test focused on the My Cards filter logic inside
// BoardView's useMemo — the exact thing under test — without DnD wiring noise.
vi.mock('../../src/features/board/Column', () => ({
  Column: ({ cards }: { column: Column; cards: Card[] }) =>
    React.createElement(
      'div',
      { 'data-testid': 'mock-column' },
      cards.map(c =>
        React.createElement('span', { key: c.id, 'data-testid': `card-${c.id}` }, c.title)
      )
    ),
}))

// Import the REAL BoardView after mocks are registered.
import { BoardView } from '../../src/features/board/BoardView'

// ---------------------------------------------------------------------------
// Wrapper — provides a stable context with controllable initial state.
// Each test renders React.createElement(Wrapper, { initial: <state> }).
// ---------------------------------------------------------------------------
function Wrapper({ initial }: { initial: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial)
  return React.createElement(
    StableContext.Provider,
    { value: { state, dispatch } },
    React.createElement(BoardView)
  )
}

// ---------------------------------------------------------------------------
// Minimal fixture data
//
// Users:
//   u1 — Alice Chen (the current user, currentUserId = 'u1')
//   u2 — Bob Martinez
//
// Cards:
//   card-mine:   assigneeId = 'u1'  → must appear when My Cards is ON (after fix)
//   card-theirs: assigneeId = 'u2'  → must NOT appear when My Cards is ON
//   card-none:   assigneeId = null  → must NOT appear when My Cards is ON
// ---------------------------------------------------------------------------
const TEST_USERS = [
  { id: 'u1', name: 'Alice Chen' },
  { id: 'u2', name: 'Bob Martinez' },
]

const TEST_COLUMNS: Column[] = [
  { id: 'col-todo', title: 'To Do', order: 0 },
]

const TEST_CARDS: Card[] = [
  {
    id: 'card-mine',
    title: 'My assigned card',
    description: 'assigned to u1',
    columnId: 'col-todo',
    assigneeId: 'u1',
    labelIds: [],
    dueDate: null,
    priority: 'medium',
    sprintId: null,
    createdAt: '2024-04-01',
    order: 0,
  },
  {
    id: 'card-theirs',
    title: "Bob's card",
    description: 'assigned to u2',
    columnId: 'col-todo',
    assigneeId: 'u2',
    labelIds: [],
    dueDate: null,
    priority: 'low',
    sprintId: null,
    createdAt: '2024-04-01',
    order: 1,
  },
  {
    id: 'card-none',
    title: 'Unassigned card',
    description: 'no assignee',
    columnId: 'col-todo',
    assigneeId: null,
    labelIds: [],
    dueDate: null,
    priority: 'low',
    sprintId: null,
    createdAt: '2024-04-01',
    order: 2,
  },
]

// Base state (My Cards filter OFF, searchQuery = '')
const baseState: AppState = {
  cards: TEST_CARDS,
  columns: TEST_COLUMNS,
  users: TEST_USERS,
  labels: [],
  sprints: [],
  currentUserId: 'u1',
  searchQuery: '',
  activeSprintId: null,
  sprintViewEnabled: false,
  boardName: 'Test Board',
}

// My Cards ON state (searchQuery = 'my cards')
const myCardsState: AppState = {
  ...baseState,
  searchQuery: 'my cards',
}

// Boundary state: My Cards ON but no cards belong to currentUser
const noMatchState: AppState = {
  ...baseState,
  searchQuery: 'my cards',
  cards: TEST_CARDS.map(c =>
    c.id === 'card-mine' ? { ...c, assigneeId: 'u99' } : c
  ),
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('my-cards', () => {
  // -------------------------------------------------------------------------
  // Smoke 1: My Cards filter OFF — all cards visible.
  //
  // searchQuery is empty so the filter branch is not entered. All cards pass
  // through to the Column mock. Validates mock scaffolding is wired up and
  // that the baseline rendering path works on v1-bugged source.
  // Must PASS on v1-bugged.
  // -------------------------------------------------------------------------
  it('smoke: my-cards OFF shows all cards', () => {
    render(React.createElement(Wrapper, { initial: baseState }))

    expect(screen.getByTestId('card-card-mine')).toBeInTheDocument()
    expect(screen.getByTestId('card-card-theirs')).toBeInTheDocument()
    expect(screen.getByTestId('card-card-none')).toBeInTheDocument()
  })

  // -------------------------------------------------------------------------
  // Smoke 2 (boundary): My Cards ON + zero matches → no cards visible.
  //
  // No card in noMatchState has assigneeId === 'u1' (after fix) or
  // assigneeId === 'Alice Chen' (on bug). Either way the result is empty.
  // Validates that a genuine "no matches" case returns an empty board on both
  // bugged and fixed code.
  // Must PASS on v1-bugged.
  // -------------------------------------------------------------------------
  it('smoke: my-cards ON with zero matches shows no cards', () => {
    render(React.createElement(Wrapper, { initial: noMatchState }))

    expect(screen.queryByTestId('card-card-mine')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-card-theirs')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-card-none')).not.toBeInTheDocument()
  })

  // -------------------------------------------------------------------------
  // Bug test: My Cards ON — card assigned to currentUser by ID must appear.
  //
  // card-mine has assigneeId = 'u1'.
  // currentUser.id   = 'u1'         ← correct comparison (after fix)
  // currentUser.name = 'Alice Chen' ← wrong comparison (v1-bugged line 18)
  //
  // On v1-bugged:
  //   'u1' === 'Alice Chen'  → false → card-mine filtered OUT → FAILS here
  //
  // After dev fix (currentUser.name → currentUser.id on line 18):
  //   'u1' === 'u1'          → true  → card-mine visible      → PASSES
  //
  // FAILS on v1-bugged. PASSES after single-field fix on BoardView.tsx line 18.
  // -------------------------------------------------------------------------
  it('my-cards: My Cards ON shows cards assigned to currentUser by ID', () => {
    render(React.createElement(Wrapper, { initial: myCardsState }))

    // This assertion FAILS on v1-bugged because the filter compares against
    // currentUser.name ('Alice Chen') instead of currentUser.id ('u1')
    expect(screen.getByTestId('card-card-mine')).toBeInTheDocument()

    // Other users' cards must not appear
    expect(screen.queryByTestId('card-card-theirs')).not.toBeInTheDocument()

    // Unassigned cards must not appear
    expect(screen.queryByTestId('card-card-none')).not.toBeInTheDocument()
  })
})
