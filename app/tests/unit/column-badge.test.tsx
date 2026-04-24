import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Column } from '../../src/features/board/Column'
import type { Column as ColumnType, Card } from '../../src/types'

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn() })
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

// Mock AppContext
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'c1', title: 'Task 1', description: '', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
          createdAt: '2026-01-01', order: 0 },
        { id: 'c2', title: 'Task 2', description: '', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'high', sprintId: null,
          createdAt: '2026-01-01', order: 1 }
      ],
      columns: [
        { id: 'col-1', title: 'To Do', order: 0 },
        { id: 'col-2', title: 'Done', order: 1 }
      ],
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
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Task 2', description: '', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'high', sprintId: null,
        createdAt: '2026-01-01', order: 1 }
    ]

    const { rerender } = render(
      <Column column={mockColumn} cards={initialCards} />
    )

    // Initial count should be 2
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('2')

    // Simulate drag-drop: remove one card (moved to another column)
    const updatedCards: Card[] = [
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 }
    ]

    rerender(<Column column={mockColumn} cards={updatedCards} />)

    // Count should now be 1 (this will FAIL with buggy code)
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('1')
  })

  it('should update badge count when cards are added', () => {
    const initialCards: Card[] = [
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 }
    ]

    const { rerender } = render(
      <Column column={mockColumn} cards={initialCards} />
    )

    // Initial count should be 1
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('1')

    // Simulate drag-drop: add a card from another column
    const updatedCards: Card[] = [
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 },
      { id: 'c3', title: 'Task 3', description: '', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'low', sprintId: null,
        createdAt: '2026-01-01', order: 1 }
    ]

    rerender(<Column column={mockColumn} cards={updatedCards} />)

    // Count should now be 2 (this will FAIL with buggy code)
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('2')
  })

  it('should show 0 when all cards are removed', () => {
    const initialCards: Card[] = [
      { id: 'c1', title: 'Task 1', description: '', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 }
    ]

    const { rerender } = render(
      <Column column={mockColumn} cards={initialCards} />
    )

    // Initial count should be 1
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('1')

    // Remove all cards
    rerender(<Column column={mockColumn} cards={[]} />)

    // Count should now be 0 (this will FAIL with buggy code)
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('0')
  })
})
