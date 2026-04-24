import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Column } from '../../src/features/board/Column'
import type { Column as ColumnType, Card } from '../../src/types'

// REQUIRED Mock patterns
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'c1', title: 'Task 1', description: 'Desc 1', columnId: 'col-1', assigneeId: 'u1',
          labelIds: ['l1'], dueDate: '2026-05-01', priority: 'high', sprintId: 's1',
          createdAt: '2026-01-15', order: 0 },
        { id: 'c2', title: 'Task 2', description: 'Desc 2', columnId: 'col-1', assigneeId: 'u2',
          labelIds: [], dueDate: null, priority: 'medium', sprintId: 's1',
          createdAt: '2026-01-16', order: 1 },
      ],
      columns: [
        { id: 'col-1', title: 'To Do', order: 0 },
        { id: 'col-2', title: 'In Progress', order: 1 },
        { id: 'col-3', title: 'Done', order: 2 }
      ],
      users: [
        { id: 'u1', name: 'Alice', avatar: 'avatar1.png' },
        { id: 'u2', name: 'Bob', avatar: 'avatar2.png' }
      ],
      labels: [
        { id: 'l1', name: 'Bug', color: '#ff0000' },
        { id: 'l2', name: 'Feature', color: '#00ff00' }
      ],
      sprints: [
        { id: 's0', name: 'Past Sprint', active: false },
        { id: 's1', name: 'Current Sprint', active: true }
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
  useDroppable: () => ({ setNodeRef: vi.fn() }),
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
    title: 'To Do',
    order: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update badge count when cards prop changes', () => {
    const initialCards: Card[] = [
      { id: 'c1', title: 'Task 1', description: 'Desc 1', columnId: 'col-1', assigneeId: 'u1',
        labelIds: [], dueDate: null, priority: 'medium', sprintId: 's1',
        createdAt: '2026-01-15', order: 0 },
      { id: 'c2', title: 'Task 2', description: 'Desc 2', columnId: 'col-1', assigneeId: 'u2',
        labelIds: [], dueDate: null, priority: 'low', sprintId: 's1',
        createdAt: '2026-01-16', order: 1 }
    ]

    const { rerender } = render(<Column column={mockColumn} cards={initialCards} />)
    
    // Initial render should show count of 2
    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('2')

    // Simulate drag-drop: remove one card (moved to another column)
    const updatedCards: Card[] = [
      { id: 'c1', title: 'Task 1', description: 'Desc 1', columnId: 'col-1', assigneeId: 'u1',
        labelIds: [], dueDate: null, priority: 'medium', sprintId: 's1',
        createdAt: '2026-01-15', order: 0 }
    ]

    rerender(<Column column={mockColumn} cards={updatedCards} />)
    
    // Badge should now show count of 1 (FAILS with buggy code due to empty deps)
    expect(badge).toHaveTextContent('1')
  })

  it('should show correct count when cards are added', () => {
    const initialCards: Card[] = []

    const { rerender } = render(<Column column={mockColumn} cards={initialCards} />)
    
    const badge = screen.getByTestId('badge-col-1')
    expect(badge).toHaveTextContent('0')

    // Add cards (simulate drag-drop from another column)
    const updatedCards: Card[] = [
      { id: 'c3', title: 'New Task', description: 'New desc', columnId: 'col-1', assigneeId: null,
        labelIds: ['l1'], dueDate: '2026-05-15', priority: 'high', sprintId: 's1',
        createdAt: '2026-01-20', order: 0 },
      { id: 'c4', title: 'Another Task', description: 'Another desc', columnId: 'col-1', assigneeId: 'u1',
        labelIds: [], dueDate: null, priority: 'medium', sprintId: 's1',
        createdAt: '2026-01-21', order: 1 }
    ]

    rerender(<Column column={mockColumn} cards={updatedCards} />)
    
    // Badge should now show count of 2 (FAILS with buggy code)
    expect(badge).toHaveTextContent('2')
  })
})
