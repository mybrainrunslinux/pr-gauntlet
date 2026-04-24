import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCardStats } from '../../src/hooks/useCardStats'
import type { Card, Column } from '../../src/types'

// Mock eventBus
vi.mock('../../src/utils/eventBus', () => ({
  eventBus: {
    emit: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }
}))

// Mock useSubscription hook
vi.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: vi.fn(),
}))

describe('completion-pct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calculates correct completion percentage - 8 of 10 cards done should be 80%', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]
    
    const cards: Card[] = [
      // 2 cards in To Do
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Task 2', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      // 8 cards in Done
      { id: 'c3', title: 'Task 3', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c4', title: 'Task 4', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      { id: 'c5', title: 'Task 5', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 2 },
      { id: 'c6', title: 'Task 6', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 3 },
      { id: 'c7', title: 'Task 7', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 4 },
      { id: 'c8', title: 'Task 8', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 5 },
      { id: 'c9', title: 'Task 9', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 6 },
      { id: 'c10', title: 'Task 10', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 7 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))
    
    expect(result.current.total).toBe(10)
    expect(result.current.done).toBe(8)
    expect(result.current.pct).toBe(80) // This will FAIL on buggy code (shows 0% because doneCol is null)
  })

  it('calculates correct completion percentage for other ratios', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]
    
    const cards: Card[] = [
      // 1 card in To Do
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      // 3 cards in Done
      { id: 'c2', title: 'Task 2', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c3', title: 'Task 3', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      { id: 'c4', title: 'Task 4', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 2 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))
    
    expect(result.current.total).toBe(4)
    expect(result.current.done).toBe(3)
    expect(result.current.pct).toBe(75) // 3/4 = 75%, buggy code will show 0%
  })

  it('handles zero cards gracefully', () => {
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

  it('handles all cards done (100%)', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]
    
    const cards: Card[] = [
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Task 2', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))
    
    expect(result.current.total).toBe(2)
    expect(result.current.done).toBe(2)
    expect(result.current.pct).toBe(100) // Buggy code will show 0%
  })

  it('returns correct byColumn counts', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-progress', title: 'In Progress', order: 1 },
      { id: 'col-done', title: 'Done', order: 2 }
    ]
    
    const cards: Card[] = [
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Task 2', description: '', columnId: 'col-progress', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c3', title: 'Task 3', description: '', columnId: 'col-progress', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      { id: 'c4', title: 'Task 4', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))
    
    expect(result.current.byColumn).toEqual({
      'col-todo': 1,
      'col-progress': 2,
      'col-done': 1
    })
    expect(result.current.pct).toBe(25) // 1/4 = 25%, buggy code will show 0%
  })
})
