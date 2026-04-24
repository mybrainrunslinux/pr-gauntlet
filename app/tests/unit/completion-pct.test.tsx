import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCardStats } from '../../src/hooks/useCardStats'
import type { Card, Column } from '../../src/types'

// Required mock patterns
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id:'c1', title:'Card 1', description:'', columnId:'col-todo', assigneeId:null,
          labelIds:[], dueDate:null, priority:'medium', sprintId:null,
          createdAt:'2026-01-01', order:0 },
        { id:'c2', title:'Card 2', description:'', columnId:'col-done', assigneeId:null,
          labelIds:[], dueDate:null, priority:'medium', sprintId:null,
          createdAt:'2026-01-01', order:1 }
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

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

vi.mock('../../src/utils/eventBus', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }
}))

vi.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: vi.fn(),
}))

describe('completion-pct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calculates correct completion percentage when 8 of 10 cards are done', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-in-progress', title: 'In Progress', order: 1 },
      { id: 'col-done', title: 'Done', order: 2 }
    ]

    const cards: Card[] = [
      // 2 cards in To Do
      { id: 'c1', title: 'Card 1', description: '', columnId: 'col-todo', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: '', columnId: 'col-todo', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 1 },
      
      // 8 cards in Done
      { id: 'c3', title: 'Card 3', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 2 },
      { id: 'c4', title: 'Card 4', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 3 },
      { id: 'c5', title: 'Card 5', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 4 },
      { id: 'c6', title: 'Card 6', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 5 },
      { id: 'c7', title: 'Card 7', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 6 },
      { id: 'c8', title: 'Card 8', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 7 },
      { id: 'c9', title: 'Card 9', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 8 },
      { id: 'c10', title: 'Card 10', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 9 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(10)
    expect(result.current.done).toBe(8)
    expect(result.current.pct).toBe(80) // 8/10 * 100 = 80%
  })

  it('calculates correct completion percentage for different ratios', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]

    // Test 3 of 5 cards done (60%)
    const cards: Card[] = [
      { id: 'c1', title: 'Card 1', description: '', columnId: 'col-todo', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: '', columnId: 'col-todo', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 1 },
      { id: 'c3', title: 'Card 3', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 2 },
      { id: 'c4', title: 'Card 4', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 3 },
      { id: 'c5', title: 'Card 5', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 4 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(5)
    expect(result.current.done).toBe(3)
    expect(result.current.pct).toBe(60) // 3/5 * 100 = 60%
  })

  it('returns 0% when no cards exist', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]
    const cards: Card[] = []

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(0)
    expect(result.current.done).toBe(0)
    expect(result.current.pct).toBe(0)
  })

  it('returns 100% when all cards are done', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]
    const cards: Card[] = [
      { id: 'c1', title: 'Card 1', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: '', columnId: 'col-done', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(2)
    expect(result.current.done).toBe(2)
    expect(result.current.pct).toBe(100)
  })
})
