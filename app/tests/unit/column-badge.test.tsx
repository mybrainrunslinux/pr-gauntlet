import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Column } from '../../src/features/board/Column'
import type { Column as ColumnType, Card } from '../../src/types'

// Mock dependencies
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'c1', title: 'Task 1', description: '', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
          createdAt: '2026-01-01', order: 0 },
        { id: 'c2', title: 'Task 2', description: '', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
          createdAt: '2026-01-01', order: 1 }
      ],
      columns: [
        { id: 'col-1', title: 'To Do', order: 0 },
        { id: 'col-2', title: 'Done', order: 1 }
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
  useDroppable: () => ({ setNodeRef: vi.fn() })
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

// Mock CardItem component
vi.mock('../../src/features/board/Card', () => ({
  CardItem: ({ card }: { card: Card }) => <div data-testid={`card-${card.id}`}>{card.title}</div>
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
      {
        id: 'c1',
        title: 'Task 1',
        description: '',
        columnId: 'col-1',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium',
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      },
      {
        id: 'c2',
        title: 'Task 2',
        description: '',
        columnId: 'col-1',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium',
        sprintId: null,
        createdAt: '2026-01-01',
        order: 1
      }
    ]

    // Initial render with 2 cards
    const { rerender } = render(<Column column={mockColumn} cards={initialCards} />)
    
    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('2')

    // Simulate card being moved to another column (1 card remaining)
    const updatedCards: Card[] = [
      {
        id: 'c1',
        title: 'Task 1',
        description: '',
        columnId: 'col-1',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium',
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      }
    ]

    rerender(<Column column={mockColumn} cards={updatedCards} />)
    
    // Badge should now show 1, but with the bug it will still show 2
    expect(badge).toHaveTextContent('1')
  })

  it('should update badge count when cards array becomes empty', () => {
    const initialCards: Card[] = [
      {
        id: 'c1',
        title: 'Task 1',
        description: '',
        columnId: 'col-1',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium',
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      }
    ]

    // Initial render with 1 card
    const { rerender } = render(<Column column={mockColumn} cards={initialCards} />)
    
    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('1')

    // Simulate all cards being moved away (empty array)
    rerender(<Column column={mockColumn} cards={[]} />)
    
    // Badge should now show 0, but with the bug it will still show 1
    expect(badge).toHaveTextContent('0')
  })

  it('should update badge count when new cards are added', () => {
    // Initial render with empty cards array
    const { rerender } = render(<Column column={mockColumn} cards={[]} />)
    
    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('0')

    // Simulate cards being added to the column
    const newCards: Card[] = [
      {
        id: 'c1',
        title: 'New Task',
        description: '',
        columnId: 'col-1',
        assigneeId: null,
        labelIds: [],
        dueDate: null,
        priority: 'medium',
        sprintId: null,
        createdAt: '2026-01-01',
        order: 0
      }
    ]

    rerender(<Column column={mockColumn} cards={newCards} />)
    
    // Badge should now show 1, but with the bug it will still show 0
    expect(badge).toHaveTextContent('1')
  })
})
