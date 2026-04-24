import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCardStats } from '../../src/hooks/useCardStats'
import type { Card, Column } from '../../src/types'

// Mock eventBus
vi.mock('../../src/utils/eventBus', () => ({
  eventBus: {
    emit: vi.fn(),
    subscribe: vi.fn(() => vi.fn()), // Return unsubscribe function
  }
}))

// Mock useSubscription hook
vi.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: vi.fn()
}))

describe('completion-pct', () => {
  const columns: Column[] = [
    { id: 'col-todo', title: 'To Do', order: 0 },
    { id: 'col-progress', title: 'In Progress', order: 1 },
    { id: 'col-done', title: 'Done', order: 2 }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 80% when 8 of 10 cards are done', () => {
    const cards: Card[] = [
      // 8 cards in done column
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `done-${i}`,
        title: `Done Card ${i}`,
        description: '',
        columnId: 'col-done',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium' as const,
        sprintId: null,
        createdAt: '2026-01-01',
        order: i
      })),
      // 2 cards in other columns
      {
        id: 'todo-1',
        title: 'Todo Card',
        description: '',
        columnId: 'col-todo',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium' as const,
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      },
      {
        id: 'progress-1',
        title: 'Progress Card',
        description: '',
        columnId: 'col-progress',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium' as const,
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(10)
    expect(result.current.done).toBe(8)
    expect(result.current.pct).toBe(80)
  })

  it('returns 100% when all cards are done', () => {
    const cards: Card[] = Array.from({ length: 5 }, (_, i) => ({
      id: `done-${i}`,
      title: `Done Card ${i}`,
      description: '',
      columnId: 'col-done',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'medium' as const,
      sprintId: null,
      createdAt: '2026-01-01',
      order: i
    }))

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(5)
    expect(result.current.done).toBe(5)
    expect(result.current.pct).toBe(100)
  })

  it('returns 0% when no cards are done', () => {
    const cards: Card[] = [
      {
        id: 'todo-1',
        title: 'Todo Card',
        description: '',
        columnId: 'col-todo',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium' as const,
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      },
      {
        id: 'progress-1',
        title: 'Progress Card',
        description: '',
        columnId: 'col-progress',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium' as const,
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(2)
    expect(result.current.done).toBe(0)
    expect(result.current.pct).toBe(0)
  })

  it('returns 0% when no cards exist', () => {
    const cards: Card[] = []

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(0)
    expect(result.current.done).toBe(0)
    expect(result.current.pct).toBe(0)
  })

  it('calculates percentage correctly with rounding', () => {
    // 1 of 3 cards done = 33.33...% -> should round to 33%
    const cards: Card[] = [
      {
        id: 'done-1',
        title: 'Done Card',
        description: '',
        columnId: 'col-done',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium' as const,
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      },
      {
        id: 'todo-1',
        title: 'Todo Card 1',
        description: '',
        columnId: 'col-todo',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium' as const,
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      },
      {
        id: 'todo-2',
        title: 'Todo Card 2',
        description: '',
        columnId: 'col-todo',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium' as const,
        sprintId: null,
        createdAt: '2026-01-01',
        order: 1
      }
    ]

    const { result } = renderHook(() => useCardStats(cards, columns))

    expect(result.current.total).toBe(3)
    expect(result.current.done).toBe(1)
    expect(result.current.pct).toBe(33)
  })
})
