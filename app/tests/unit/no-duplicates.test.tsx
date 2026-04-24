import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reducer } from '../../src/store/reducer'
import type { AppState, Card } from '../../src/types'

// ALWAYS mock useAppContext — components throw without it:
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'T', description:'', columnId:'col-1', assigneeId:null,
                 labelIds:[], dueDate:null, priority:'medium', sprintId:null,
                 createdAt:'2026-01-01', order:0 }],
      columns: [{ id:'col-1', title:'To Do', order:0 }, { id:'col-2', title:'Done', order:1 }],
      users: [{ id:'u1', name:'Alice' }, { id:'u2', name:'Bob' }],
      labels: [{ id:'l1', name:'Bug', color:'#f00' }],
      sprints: [{ id:'s0', name:'Past Sprint', active:false }, { id:'s1', name:'Active Sprint', active:true }],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: 's1',
      sprintViewEnabled: false,
      boardName: 'Test Board',
    },
    dispatch: vi.fn(),
  })
}))

// ALWAYS mock dnd-kit:
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

describe('no-duplicates', () => {
  let initialState: AppState
  let existingCard: Card

  beforeEach(() => {
    existingCard = {
      id: 'c1',
      title: 'Original Title',
      description: 'Original description',
      columnId: 'col-1',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'medium' as const,
      sprintId: null,
      createdAt: '2026-01-01',
      order: 0
    }

    initialState = {
      cards: [existingCard],
      columns: [
        { id: 'col-1', title: 'To Do', order: 0 },
        { id: 'col-2', title: 'Done', order: 1 }
      ],
      users: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }],
      labels: [{ id: 'l1', name: 'Bug', color: '#f00' }],
      sprints: [
        { id: 's0', name: 'Past Sprint', active: false },
        { id: 's1', name: 'Active Sprint', active: true }
      ],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: 's1',
      sprintViewEnabled: false,
      boardName: 'Test Board'
    }
  })

  it('UPDATE_CARD replaces existing card, not appends', () => {
    // This test FAILS on buggy code because UPDATE_CARD appends instead of replacing
    const updatedCard = { ...existingCard, title: 'Updated Title' }
    
    const nextState = reducer(initialState, { type: 'UPDATE_CARD', card: updatedCard })
    
    // Should have exactly 1 card (not 2 duplicates)
    expect(nextState.cards).toHaveLength(1)
    expect(nextState.cards[0].title).toBe('Updated Title')
    expect(nextState.cards[0].id).toBe('c1')
  })

  it('UPDATE_CARD with multiple existing cards only replaces the matching one', () => {
    const secondCard: Card = {
      id: 'c2',
      title: 'Second Card',
      description: 'Second description',
      columnId: 'col-2',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'high' as const,
      sprintId: null,
      createdAt: '2026-01-02',
      order: 1
    }

    const stateWithTwoCards = {
      ...initialState,
      cards: [existingCard, secondCard]
    }

    const updatedFirstCard = { ...existingCard, title: 'Updated First Card' }
    
    const nextState = reducer(stateWithTwoCards, { type: 'UPDATE_CARD', card: updatedFirstCard })
    
    // Should still have exactly 2 cards (not 3)
    expect(nextState.cards).toHaveLength(2)
    
    // First card should be updated
    const firstCard = nextState.cards.find(c => c.id === 'c1')
    expect(firstCard?.title).toBe('Updated First Card')
    
    // Second card should remain unchanged
    const stillSecondCard = nextState.cards.find(c => c.id === 'c2')
    expect(stillSecondCard?.title).toBe('Second Card')
  })

  it('MERGE_CARDS properly deduplicates cards by ID', () => {
    const duplicateCard = { ...existingCard, title: 'Duplicate Title' }
    const newCard: Card = {
      id: 'c3',
      title: 'New Card',
      description: 'New description',
      columnId: 'col-1',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'low' as const,
      sprintId: null,
      createdAt: '2026-01-03',
      order: 2
    }

    const incomingCards = [duplicateCard, newCard]
    
    const nextState = reducer(initialState, { type: 'MERGE_CARDS', cards: incomingCards })
    
    // Should have 2 unique cards (existing c1 replaced, new c3 added)
    expect(nextState.cards).toHaveLength(2)
    
    // Card c1 should have the updated title from the duplicate
    const updatedCard = nextState.cards.find(c => c.id === 'c1')
    expect(updatedCard?.title).toBe('Duplicate Title')
    
    // Card c3 should be present
    const addedCard = nextState.cards.find(c => c.id === 'c3')
    expect(addedCard?.title).toBe('New Card')
  })
})
