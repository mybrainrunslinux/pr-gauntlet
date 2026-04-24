import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCardStats } from '../../src/hooks/useCardStats'
import type { Card, Column } from '../../src/types'

// Mock eventBus
vi.mock('../../src/utils/eventBus', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }
}))

// Mock useSubscription
vi.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: vi.fn()
}))

describe('completion-pct', () => {
  it('calculates correct completion percentage for 8/10 cards done', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-in-progress', title: 'In Progress', order: 1 },
      { id: 'col-done', title: 'Done', order: 2 }
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
    expect(result.current.pct).toBe(80) // Should be 80%, not 0% due to wrong column ID lookup
  })

  it('calculates correct completion percentage for different ratios', () => {
    const columns: Column[] = [
      { id: 'col-backlog', title: 'Backlog', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]

    const cards: Card[] = [
      // 3 cards in Backlog
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-backlog', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Task 2', description: '', columnId: 'col-backlog', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      { id: 'c3', title: 'Task 3', description: '', columnId: 'col-backlog', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 2 },
      
      // 7 cards in Done
      { id: 'c4', title: 'Task 4', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c5', title: 'Task 5', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      { id: 'c6', title: 'Task 6', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 2 },
      { id: 'c7', title: 'Task 7', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 3 },
      { id: 'c8', title: 'Task 8', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 4 },
      { id: 'c9', title: 'Task 9', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 5 },
      { id: 'c10', title: 'Task 10', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 6 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(10)
    expect(result.current.done).toBe(7)
    expect(result.current.pct).toBe(70) // Should be 70%, not 0% due to wrong column ID lookup
  })

  it('handles zero cards correctly', () => {
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

  it('handles all cards done correctly', () => {
    const columns: Column[] = [
      { id: 'col-todo', title: 'To Do', order: 0 },
      { id: 'col-done', title: 'Done', order: 1 }
    ]

    const cards: Card[] = [
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Task 2', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
      { id: 'c3', title: 'Task 3', description: '', columnId: 'col-done', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 2 }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(3)
    expect(result.current.done).toBe(3)
    expect(result.current.pct).toBe(100)
  })
})
