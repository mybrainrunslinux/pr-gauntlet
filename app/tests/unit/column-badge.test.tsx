import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Column } from '../../src/features/board/Column'
import type { Column as ColumnType, Card } from '../../src/types'

// REQUIRED Mock patterns
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'c1', title: 'Card 1', description: 'First card', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
          createdAt: '2026-01-01', order: 0 },
        { id: 'c2', title: 'Card 2', description: 'Second card', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'high', sprintId: null,
          createdAt: '2026-01-02', order: 1 }
      ],
      columns: [
        { id: 'col-1', title: 'Backlog', order: 0 },
        { id: 'col-2', title: 'In Progress', order: 1 }
      ],
      users: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }],
      labels: [{ id: 'l1', name: 'Bug', color: '#f00' }],
      sprints: [
        { id: 's0', name: 'Past Sprint', active: false },
        { id: 's1', name: 'Active Sprint', active: true }
      ],
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
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false
  }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } }
}))

describe('column-badge', () => {
  const mockColumn: ColumnType = {
    id: 'col-1',
    title: 'Backlog',
    order: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update badge count when cards prop changes', () => {
    const initialCards: Card[] = [
      { id: 'c1', title: 'Card 1', description: 'First card', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 },
      { id: 'c2', title: 'Card 2', description: 'Second card', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'high', sprintId: null,
        createdAt: '2026-01-02', order: 1 }
    ]

    // Initial render with 2 cards
    const { rerender } = render(
      <Column column={mockColumn} cards={initialCards} />
    )

    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('2')

    // Simulate drag-drop: remove one card (as if moved to another column)
    const updatedCards: Card[] = [
      { id: 'c1', title: 'Card 1', description: 'First card', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 }
    ]

    // Re-render with updated cards prop
    rerender(<Column column={mockColumn} cards={updatedCards} />)

    // Badge should now show 1, not the old count of 2
    expect(badge).toHaveTextContent('1')
  })

  it('should update badge count when cards are added', () => {
    const initialCards: Card[] = [
      { id: 'c1', title: 'Card 1', description: 'First card', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 }
    ]

    // Initial render with 1 card
    const { rerender } = render(
      <Column column={mockColumn} cards={initialCards} />
    )

    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('1')

    // Simulate drag-drop: add a card (as if moved from another column)
    const updatedCards: Card[] = [
      ...initialCards,
      { id: 'c3', title: 'Card 3', description: 'New card', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'low', sprintId: null,
        createdAt: '2026-01-03', order: 2 }
    ]

    // Re-render with updated cards prop
    rerender(<Column column={mockColumn} cards={updatedCards} />)

    // Badge should now show 2, not the old count of 1
    expect(badge).toHaveTextContent('2')
  })

  it('should show 0 when all cards are moved away', () => {
    const initialCards: Card[] = [
      { id: 'c1', title: 'Card 1', description: 'First card', columnId: 'col-1', assigneeId: null,
        labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
        createdAt: '2026-01-01', order: 0 }
    ]

    // Initial render with 1 card
    const { rerender } = render(
      <Column column={mockColumn} cards={initialCards} />
    )

    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('1')

    // Simulate all cards moved to other columns
    rerender(<Column column={mockColumn} cards={[]} />)

    // Badge should now show 0
    expect(badge).toHaveTextContent('0')
  })
})
