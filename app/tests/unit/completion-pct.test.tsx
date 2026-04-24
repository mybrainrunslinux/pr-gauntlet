import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCardStats } from '../../src/hooks/useCardStats'
import type { Card, Column } from '../../src/types'

// REQUIRED Mock patterns
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id:'c1', title:'Card 1', description:'', columnId:'col-todo', assigneeId:null,
          labelIds:[], dueDate:null, priority:'medium', sprintId:null,
          createdAt:'2026-01-01', order:0 },
        { id:'c2', title:'Card 2', description:'', columnId:'col-todo', assigneeId:null,
          labelIds:[], dueDate:null, priority:'medium', sprintId:null,
          createdAt:'2026-01-01', order:1 },
      ],
      columns: [
        { id:'col-todo', title:'To Do', order:0 }, 
        { id:'col-done', title:'Done', order:1 }
      ],
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

vi.mock('@dnd-kit/core', () => ({ 
  DndContext: ({ children }: { children: any }) => <>{children}</>, 
  closestCenter: {}, 
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }) 
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ 
    attributes: {}, listeners: {}, setNodeRef: vi.fn(), 
    transform: null, transition: null, isDragging: false 
  }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({ 
  CSS: { Transform: { toString: () => '' } } 
}))

// Mock eventBus and useSubscription to avoid side effects
vi.mock('../../src/utils/eventBus', () => ({
  eventBus: { emit: vi.fn() }
}))

vi.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: vi.fn()
}))

describe('completion-pct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calculates 0% when no cards are in done column', () => {
    const cards: Card[] = [
      { id:'c1', title:'Card 1', description:'', columnId:'col-todo', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:0 },
      { id:'c2', title:'Card 2', description:'', columnId:'col-todo', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:1 }
    ]
    
    const columns: Column[] = [
      { id:'col-todo', title:'To Do', order:0 },
      { id:'col-done', title:'Done', order:1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.pct).toBe(0)
    expect(result.current.done).toBe(0)
    expect(result.current.total).toBe(2)
  })

  it('calculates 80% when 8 of 10 cards are done', () => {
    const cards: Card[] = [
      // 8 cards in done column
      { id:'c1', title:'Done 1', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:0 },
      { id:'c2', title:'Done 2', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:1 },
      { id:'c3', title:'Done 3', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:2 },
      { id:'c4', title:'Done 4', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:3 },
      { id:'c5', title:'Done 5', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:4 },
      { id:'c6', title:'Done 6', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:5 },
      { id:'c7', title:'Done 7', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:6 },
      { id:'c8', title:'Done 8', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:7 },
      // 2 cards in todo column
      { id:'c9', title:'Todo 1', description:'', columnId:'col-todo', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:0 },
      { id:'c10', title:'Todo 2', description:'', columnId:'col-todo', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:1 }
    ]
    
    const columns: Column[] = [
      { id:'col-todo', title:'To Do', order:0 },
      { id:'col-done', title:'Done', order:1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.pct).toBe(80)
    expect(result.current.done).toBe(8)
    expect(result.current.total).toBe(10)
  })

  it('calculates 100% when all cards are done', () => {
    const cards: Card[] = [
      { id:'c1', title:'Done 1', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:0 },
      { id:'c2', title:'Done 2', description:'', columnId:'col-done', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:1 }
    ]
    
    const columns: Column[] = [
      { id:'col-todo', title:'To Do', order:0 },
      { id:'col-done', title:'Done', order:1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.pct).toBe(100)
    expect(result.current.done).toBe(2)
    expect(result.current.total).toBe(2)
  })

  it('handles edge case with no cards', () => {
    const cards: Card[] = []
    
    const columns: Column[] = [
      { id:'col-todo', title:'To Do', order:0 },
      { id:'col-done', title:'Done', order:1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.pct).toBe(0)
    expect(result.current.done).toBe(0)
    expect(result.current.total).toBe(0)
  })
})
