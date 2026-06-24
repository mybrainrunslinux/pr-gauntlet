import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCardStats } from '../../src/hooks/useCardStats'
import type { Card, Column } from '../../src/types'

// Mock useSubscription hook
vi.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: vi.fn()
}))

// Mock eventBus
vi.mock('../../src/utils/eventBus', () => ({
  eventBus: {
    emit: vi.fn()
  }
}))

describe('completion-pct', () => {
  it('should calculate correct completion percentage when 8 of 10 cards are done', () => {
    // Setup: 10 cards total, 8 in done column, 2 in todo column
    const cards: Card[] = [
      // 8 cards in done column (col-done)
      { id: 'c1', title: 'Card 1', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      { id: 'c3', title: 'Card 3', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 2 },
      { id: 'c4', title: 'Card 4', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 3 },
      { id: 'c5', title: 'Card 5', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 4 },
      { id: 'c6', title: 'Card 6', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 5 },
      { id: 'c7', title: 'Card 7', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 6 },
      { id: 'c8', title: 'Card 8', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 7 },
      // 2 cards in todo column
      { id: 'c9', title: 'Card 9', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c10', title: 'Card 10', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 }
    ]

    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    // Should be 80% (8/10 * 100 = 80)
    expect(result.current.done).toBe(8)
    expect(result.current.total).toBe(10)
    expect(result.current.pct).toBe(80)
  })

  it('should calculate 0% when no cards are done', () => {
    const cards: Card[] = [
      { id: 'c1', title: 'Card 1', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: '', columnId: 'col-todo', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 }
    ]

    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.done).toBe(0)
    expect(result.current.total).toBe(2)
    expect(result.current.pct).toBe(0)
  })

  it('should calculate 100% when all cards are done', () => {
    const cards: Card[] = [
      { id: 'c1', title: 'Card 1', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 }
    ]

    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.done).toBe(2)
    expect(result.current.total).toBe(2)
    expect(result.current.pct).toBe(100)
  })

  it('should handle empty cards array', () => {
    const cards: Card[] = []
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.done).toBe(0)
    expect(result.current.total).toBe(0)
    expect(result.current.pct).toBe(0)
  })
})
