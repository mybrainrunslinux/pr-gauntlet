import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardItem } from '../../src/features/board/Card'

// REQUIRED Mock patterns
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { 
          id: 'c1', 
          title: 'Fix login page styles', 
          description: 'Update CSS for login form', 
          columnId: 'col-1', 
          assigneeId: 'u1',
          labelIds: ['l1'], 
          dueDate: '2026-05-01', 
          priority: 'high', 
          sprintId: 's1',
          createdAt: '2026-04-20', 
          order: 0 
        },
        { 
          id: 'c2', 
          title: 'Add unit tests', 
          description: 'Write comprehensive test suite', 
          columnId: 'col-2', 
          assigneeId: 'u2',
          labelIds: [], 
          dueDate: null, 
          priority: 'medium', 
          sprintId: 's1',
          createdAt: '2026-04-21', 
          order: 1 
        }
      ],
      columns: [
        { id: 'col-1', title: 'To Do', order: 0 }, 
        { id: 'col-2', title: 'In Progress', order: 1 }
      ],
      users: [
        { id: 'u1', name: 'Alice Developer' }, 
        { id: 'u2', name: 'Bob Tester' }
      ],
      labels: [
        { id: 'l1', name: 'Bug', color: '#ff4444' },
        { id: 'l2', name: 'Feature', color: '#44ff44' }
      ],
      sprints: [
        { id: 's0', name: 'Sprint 1', active: false }, 
        { id: 's1', name: 'Sprint 2', active: true }
      ],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: 's1',
      sprintViewEnabled: false,
      boardName: 'Development Board',
    },
    dispatch: vi.fn(),
  })
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

vi.mock('../../src/features/card/DeleteDialog', () => ({
  DeleteDialog: ({ card, onConfirm, onCancel }: { card: any, onConfirm: () => void, onCancel: () => void }) => (
    <div data-testid="delete-dialog">
      <p>Are you sure you want to delete "{card?.title}"?</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

vi.mock('../../src/features/card/CardEditModal', () => ({
  CardEditModal: ({ card, onClose }: { card: any, onClose: () => void }) => (
    <div data-testid="edit-modal">
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

vi.mock('../../src/utils/storage', () => ({
  formatDate: (date: string) => date
}))

describe('delete-dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display card title in delete confirmation dialog', () => {
    const testCard = {
      id: 'c1',
      title: 'Fix login page styles',
      description: 'Update CSS for login form',
      columnId: 'col-1',
      assigneeId: 'u1',
      labelIds: ['l1'],
      dueDate: '2026-05-01',
      priority: 'high' as const,
      sprintId: 's1',
      createdAt: '2026-04-20',
      order: 0
    }

    render(<CardItem card={testCard} />)

    // Click delete button to open confirmation dialog
    const deleteButton = screen.getByTestId('delete-btn-c1')
    fireEvent.click(deleteButton)

    // Verify dialog appears
    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toBeInTheDocument()

    // This test FAILS on buggy code because it shows "undefined"
    // and PASSES after fix when it shows the actual card title
    expect(dialog).toHaveTextContent('Are you sure you want to delete "Fix login page styles"?')
    expect(dialog).not.toHaveTextContent('Are you sure you want to delete "undefined"?')
  })

  it('should display different card titles correctly for multiple cards', () => {
    const testCard2 = {
      id: 'c2',
      title: 'Add unit tests',
      description: 'Write comprehensive test suite',
      columnId: 'col-2',
      assigneeId: 'u2',
      labelIds: [],
      dueDate: null,
      priority: 'medium' as const,
      sprintId: 's1',
      createdAt: '2026-04-21',
      order: 1
    }

    render(<CardItem card={testCard2} />)

    // Click delete button
    const deleteButton = screen.getByTestId('delete-btn-c2')
    fireEvent.click(deleteButton)

    // Verify correct title is shown for this different card
    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toHaveTextContent('Are you sure you want to delete "Add unit tests"?')
    expect(dialog).not.toHaveTextContent('Are you sure you want to delete "undefined"?')
  })
})
