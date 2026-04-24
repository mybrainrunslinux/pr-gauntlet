import { describe, it, expect, vi } from 'vitest'
import { reducer } from '../../src/store/reducer'
import type { AppState } from '../../src/types'

// Required mocks
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

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

describe('no-duplicates', () => {
  it('UPDATE_CARD replaces existing card, not appends', () => {
    const card = { 
      id: 'c1', 
      title: 'Old Title', 
      description: '', 
      columnId: 'col-1',
      assigneeId: null, 
      labelIds: [], 
      dueDate: null, 
      priority: 'medium' as const,
      sprintId: null, 
      createdAt: '2026-01-01', 
      order: 0 
    }
    
    const state: AppState = { 
      cards: [card], 
      columns: [], 
      users: [], 
      labels: [],
      sprints: [], 
      currentUserId: 'u1', 
      searchQuery: '', 
      activeSprintId: null,
      sprintViewEnabled: false, 
      boardName: 'Board' 
    }
    
    const updated = { ...card, title: 'New Title' }
    const next = reducer(state, { type: 'UPDATE_CARD', card: updated })
    
    expect(next.cards).toHaveLength(1)      // must NOT grow to 2
    expect(next.cards[0].title).toBe('New Title')
    expect(next.cards[0].id).toBe('c1')
  })

  it('UPDATE_CARD handles multiple existing cards correctly', () => {
    const card1 = { 
      id: 'c1', 
      title: 'Card 1', 
      description: '', 
      columnId: 'col-1',
      assigneeId: null, 
      labelIds: [], 
      dueDate: null, 
      priority: 'medium' as const,
      sprintId: null, 
      createdAt: '2026-01-01', 
      order: 0 
    }
    
    const card2 = { 
      id: 'c2', 
      title: 'Card 2', 
      description: '', 
      columnId: 'col-2',
      assigneeId: null, 
      labelIds: [], 
      dueDate: null, 
      priority: 'high' as const,
      sprintId: null, 
      createdAt: '2026-01-02', 
      order: 1 
    }
    
    const state: AppState = { 
      cards: [card1, card2], 
      columns: [], 
      users: [], 
      labels: [],
      sprints: [], 
      currentUserId: 'u1', 
      searchQuery: '', 
      activeSprintId: null,
      sprintViewEnabled: false, 
      boardName: 'Board' 
    }
    
    const updated = { ...card1, title: 'Updated Card 1' }
    const next = reducer(state, { type: 'UPDATE_CARD', card: updated })
    
    expect(next.cards).toHaveLength(2)      // should remain 2, not grow to 3
    expect(next.cards.find(c => c.id === 'c1')?.title).toBe('Updated Card 1')
    expect(next.cards.find(c => c.id === 'c2')?.title).toBe('Card 2')
  })

  it('MERGE_CARDS properly deduplicates cards by ID', () => {
    const existingCard = { 
      id: 'c1', 
      title: 'Existing', 
      description: '', 
      columnId: 'col-1',
      assigneeId: null, 
      labelIds: [], 
      dueDate: null, 
      priority: 'medium' as const,
      sprintId: null, 
      createdAt: '2026-01-01', 
      order: 0 
    }
    
    const state: AppState = { 
      cards: [existingCard], 
      columns: [], 
      users: [], 
      labels: [],
      sprints: [], 
      currentUserId: 'u1', 
      searchQuery: '', 
      activeSprintId: null,
      sprintViewEnabled: false, 
      boardName: 'Board' 
    }
    
    // Simulate WebSocket reconnect sending same card with updated data
    const incomingCards = [
      { ...existingCard, title: 'Updated via WebSocket' }
    ]
    
    const next = reducer(state, { type: 'MERGE_CARDS', cards: incomingCards })
    
    expect(next.cards).toHaveLength(1)      // should remain 1, not grow to 2
    expect(next.cards[0].title).toBe('Updated via WebSocket')
    expect(next.cards[0].id).toBe('c1')
  })
})
