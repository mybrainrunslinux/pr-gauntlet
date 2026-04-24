import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Column } from '../../src/features/board/Column'
import type { Column as ColumnType, Card } from '../../src/types'

// Mock useAppContext
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'c1', title: 'Task 1', description: 'First task', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
          createdAt: '2026-01-01', order: 0 },
        { id: 'c2', title: 'Task 2', description: 'Second task', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
          createdAt: '2026-01-01', order: 1 },
      ],
      columns: [{ id: 'col-1', title: 'To Do', order: 0 }, { id: 'col-2', title: 'In Progress', order: 1 }],
      users: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }],
      labels: [{ id: 'l1', name: 'Bug', color: '#f00' }],
      sprints: [{ id: 's0', name: 'Past Sprint', active: false }, { id: 's1', name: 'Active Sprint', active: true }],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: 's1',
      sprintViewEnabled: false,
      boardName: 'Test Board',
    },
    dispatch: vi.fn(),
  })
}))

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn() }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

describe('column-badge', () => {
  const mockColumn: ColumnType = {
    id: 'col-1',
    title: 'To Do',
    order: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update badge count when cards prop changes', () => {
    const initialCards: Card[] = [
      { id: 'c1', title: 'Task 1', description: 'First task', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Task 2', description: 'Second task', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 1 },
    ]

    // Initial render with 2 cards
    const { rerender } = render(<Column column={mockColumn} cards={initialCards} />)
    
    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('2')

    // Simulate drag-drop: remove one card (as if moved to another column)
    const updatedCards: Card[] = [
      { id: 'c1', title: 'Task 1', description: 'First task', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 },
    ]

    // Re-render with updated cards
    rerender(<Column column={mockColumn} cards={updatedCards} />)
    
    // Badge should now show 1 (this will FAIL with buggy code due to empty deps)
    expect(badge).toHaveTextContent('1')
  })

  it('should show correct count when cards are added', () => {
    const initialCards: Card[] = []

    // Initial render with no cards
    const { rerender } = render(<Column column={mockColumn} cards={initialCards} />)
    
    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('0')

    // Add cards (simulate drag-drop from another column)
    const updatedCards: Card[] = [
      { id: 'c3', title: 'New Task', description: 'Moved task', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 },
    ]

    rerender(<Column column={mockColumn} cards={updatedCards} />)
    
    // Badge should now show 1 (this will FAIL with buggy code)
    expect(badge).toHaveTextContent('1')
  })
})
