/**
 * Issue #15: No duplicate cards after WS reconnect
 * testFilter: no-duplicates
 *
 * Root cause: reducer.ts UPDATE_CARD case uses [...state.cards, action.card]
 * (append) instead of map+replace. When a WS 'connected' message arrives on
 * reconnect, useWebSocket iterates every card in msg.cards and calls
 * onCardUpdateRef.current(c), dispatching UPDATE_CARD for each. Because those
 * cards already exist in state (loaded from seed / initial HTTP fetch),
 * each one is appended rather than updated → identical duplicate entries.
 *
 * This is Case A: INDEPENDENT of the chain bug (16–20). The chain bug lives in
 * useSubscription.ts (no cleanup return + handler reference instability).
 * The duplicate-card bug lives in reducer.ts UPDATE_CARD. The BUG #15 marker
 * at reducer.ts line 16 confirms this.
 *
 * Fix (for dev): change UPDATE_CARD to:
 *   return { ...state, cards: state.cards.map(c => c.id === action.card.id ? action.card : c) }
 *
 * Tests:
 *   [smoke] reducer handles SET_CARDS correctly (no-duplicates)
 *   [smoke] reducer ADD_CARD appends a brand-new card (no-duplicates)
 *   [bug]   reducer UPDATE_CARD must not duplicate — replace in-place (no-duplicates)
 *   [bug]   WS reconnect pattern: repeated UPDATE_CARD for same id produces 1 card (no-duplicates)
 */

import { describe, it, expect } from 'vitest'
// IMPORT real reducer — not mocked, not inlined
import { reducer } from '../../src/store/reducer'
import type { AppState, Card } from '../../src/types'

// ---------------------------------------------------------------------------
// Minimal AppState fixture — only the fields the reducer touches.
// Using a factory keeps each test hermetically isolated.
// ---------------------------------------------------------------------------
function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'c1',
    title: 'Test card',
    description: '',
    columnId: 'col-backlog',
    assigneeId: null,
    labelIds: [],
    dueDate: null,
    priority: 'low',
    sprintId: null,
    createdAt: '2024-04-01',
    order: 0,
    ...overrides,
  }
}

function makeState(cards: Card[]): AppState {
  return {
    cards,
    columns: [],
    users: [],
    labels: [],
    sprints: [],
    currentUserId: 'u1',
    searchQuery: '',
    activeSprintId: null,
    sprintViewEnabled: false,
    boardName: 'Test Board',
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('no-duplicates — reducer UPDATE_CARD must replace, not append', () => {
  // ------------------------------------------------------------------
  // Smoke 1: SET_CARDS replaces cards array cleanly
  // ------------------------------------------------------------------
  it('[smoke] reducer handles SET_CARDS correctly (no-duplicates)', () => {
    const initial = makeState([makeCard({ id: 'c1' })])
    const newCards = [makeCard({ id: 'c2', title: 'New card' })]

    const next = reducer(initial, { type: 'SET_CARDS', cards: newCards })

    expect(next.cards).toHaveLength(1)
    expect(next.cards[0].id).toBe('c2')
  })

  // ------------------------------------------------------------------
  // Smoke 2: ADD_CARD appends a brand-new card (id not already in state)
  // ------------------------------------------------------------------
  it('[smoke] reducer ADD_CARD appends a brand-new card (no-duplicates)', () => {
    const initial = makeState([makeCard({ id: 'c1' })])
    const newCard = makeCard({ id: 'c2', title: 'Brand new' })

    const next = reducer(initial, { type: 'ADD_CARD', card: newCard })

    expect(next.cards).toHaveLength(2)
    expect(next.cards.map(c => c.id)).toEqual(['c1', 'c2'])
  })

  // ------------------------------------------------------------------
  // Bug test 1 (primary): UPDATE_CARD for an existing card must leave
  // exactly 1 card in state — not 2.
  //
  // On v1-bugged: UPDATE_CARD uses [...state.cards, action.card] which
  // appends unconditionally → 2 cards with the same id.
  // ------------------------------------------------------------------
  it('[bug] reducer UPDATE_CARD must not duplicate — replace in-place (no-duplicates)', () => {
    const existingCard = makeCard({ id: 'c1', title: 'Original title' })
    const initial = makeState([existingCard])

    // Simulate a WS card:update for a card that already exists in state
    const updatedCard = makeCard({ id: 'c1', title: 'Updated title' })
    const next = reducer(initial, { type: 'UPDATE_CARD', card: updatedCard })

    // Must have exactly 1 card — not 2
    expect(next.cards).toHaveLength(1)
    // The card must carry the updated data
    expect(next.cards[0].title).toBe('Updated title')
  })

  // ------------------------------------------------------------------
  // Bug test 2 (reconnect pattern): simulate the WS reconnect sequence.
  // On reconnect, useWebSocket dispatches UPDATE_CARD for every card in
  // the server's 'connected' message. With 3 cards already in state,
  // dispatching UPDATE_CARD for each should leave 3 cards — not 6.
  //
  // On v1-bugged: each dispatch appends → 6 cards (each original
  // duplicated once).
  // ------------------------------------------------------------------
  it('[bug] WS reconnect pattern: repeated UPDATE_CARD for same ids produces no duplicates (no-duplicates)', () => {
    // Board initially has 3 cards (loaded from HTTP fetch / seed)
    const card1 = makeCard({ id: 'c1', title: 'Card 1' })
    const card2 = makeCard({ id: 'c2', title: 'Card 2' })
    const card3 = makeCard({ id: 'c3', title: 'Card 3' })
    let state = makeState([card1, card2, card3])

    expect(state.cards).toHaveLength(3)

    // Simulate WS 'connected' message — server sends back all cards.
    // useWebSocket calls onCardUpdateRef.current(c) per card → UPDATE_CARD per card.
    const serverCards = [
      makeCard({ id: 'c1', title: 'Card 1 (server)' }),
      makeCard({ id: 'c2', title: 'Card 2 (server)' }),
      makeCard({ id: 'c3', title: 'Card 3 (server)' }),
    ]

    for (const card of serverCards) {
      state = reducer(state, { type: 'UPDATE_CARD', card })
    }

    // Must still have exactly 3 cards — duplicates would give 6
    expect(state.cards).toHaveLength(3)

    // Each card should reflect the server version
    const ids = state.cards.map(c => c.id).sort()
    expect(ids).toEqual(['c1', 'c2', 'c3'])

    const titles = state.cards.map(c => c.title).sort()
    expect(titles).toEqual(['Card 1 (server)', 'Card 2 (server)', 'Card 3 (server)'])
  })
})
