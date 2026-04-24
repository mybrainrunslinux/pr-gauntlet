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
  useSubscription: vi.fn()
}))

describe('completion-pct', () => {
  let mockCards: Card[]
  let mockColumns: Column[]

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockColumns = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-progress', title: 'In Progress', order: 1 },
      { id: 'col-done', title: 'Done', order: 2 }
    ]
  })

  it('calculates correct completion percentage - 3 of 5 cards done should be 60%', () => {
    mockCards = [
      { id: 'c1', title: 'Card 1', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: '', columnId: 'col-progress', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      { id: 'c3', title: 'Card 3', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 2 },
      { id: 'c4', title: 'Card 4', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 3 },
      { id: 'c5', title: 'Card 5', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 4 }
    ]

    const { result } = renderHook(() => useCardStats(mockCards, mockColumns))
    
    expect(result.current.total).toBe(5)
    expect(result.current.done).toBe(3)
    expect(result.current.pct).toBe(60)
  })

  it('calculates correct completion percentage - 8 of 10 cards done should be 80%', () => {
    mockCards = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i + 1}`,
      title: `Card ${i + 1}`,
      description: '',
      columnId: i < 8 ? 'col-done' : 'col-todo',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'medium' as const,
      sprintId: null,
      createdAt: '2026-01-01',
      order: i
    }))

    const { result } = renderHook(() => useCardStats(mockCards, mockColumns))
    
    expect(result.current.total).toBe(10)
    expect(result.current.done).toBe(8)
    expect(result.current.pct).toBe(80)
  })

  it('handles empty board correctly', () => {
    mockCards = []

    const { result } = renderHook(() => useCardStats(mockCards, mockColumns))
    
    expect(result.current.total).toBe(0)
    expect(result.current.done).toBe(0)
    expect(result.current.pct).toBe(0)
  })

  it('handles all cards done correctly', () => {
    mockCards = [
      { id: 'c1', title: 'Card 1', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      { id: 'c3', title: 'Card 3', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 2 }
    ]

    const { result } = renderHook(() => useCardStats(mockCards, mockColumns))
    
    expect(result.current.total).toBe(3)
    expect(result.current.done).toBe(3)
    expect(result.current.pct).toBe(100)
  })

  it('handles no done column correctly', () => {
    mockCards = [
      { id: 'c1', title: 'Card 1', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: '', columnId: 'col-progress', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 }
    ]

    const columnsWithoutDone = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-progress', title: 'In Progress', order: 1 }
    ]

    const { result } = renderHook(() => useCardStats(mockCards, columnsWithoutDone))
    
    expect(result.current.total).toBe(2)
    expect(result.current.done).toBe(0)
    expect(result.current.pct).toBe(0)
  })
})
