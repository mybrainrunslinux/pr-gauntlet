import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardItem } from '../../src/features/board/Card'
import type { Card } from '../../src/types'

// REQUIRED Mock patterns (vi.mock is hoisted — use inline literals only, no variables)
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'card-1', title: 'Fix login page styles', description: 'Update CSS for login form', 
          columnId: 'col-1', assigneeId: 'u1', labelIds: ['l1'], dueDate: '2026-05-01', 
          priority: 'high', sprintId: 's1', createdAt: '2026-01-01', order: 0 },
        { id: 'card-2', title: 'Add user authentication', description: 'Implement OAuth flow', 
          columnId: 'col-1', assigneeId: null, labelIds: [], dueDate: null, 
          priority: 'medium', sprintId: 's1', createdAt: '2026-01-02', order: 1 }
      ],
      columns: [{ id: 'col-1', title: 'To Do', order: 0 }, { id: 'col-2', title: 'Done', order: 1 }],
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
  DeleteDialog: ({ card, onConfirm, onCancel }: { card: Card; onConfirm: () => void; onCancel: () => void }) => (
    <div data-testid="delete-dialog">
      <p>Are you sure you want to delete "{card?.title}"?</p>
      <button onClick={onConfirm} data-testid="confirm-delete">Yes</button>
      <button onClick={onCancel} data-testid="cancel-delete">Cancel</button>
    </div>
  )
}))

vi.mock('../../src/features/card/CardEditModal', () => ({
  CardEditModal: ({ card, onClose }: { card: Card; onClose: () => void }) => (
    <div data-testid="edit-modal">
      <p>Editing: {card.title}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

vi.mock('../../src/utils/storage', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString()
}))

describe('delete-dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display the card title in the delete confirmation dialog', () => {
    const testCard: Card = {
      id: 'card-1',
      title: 'Fix login page styles',
      description: 'Update CSS for login form',
      columnId: 'col-1',
      assigneeId: 'u1',
      labelIds: ['l1'],
      dueDate: '2026-05-01',
      priority: 'high',
      sprintId: 's1',
      createdAt: '2026-01-01',
      order: 0
    }

    render(<CardItem card={testCard} />)

    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-card-1')
    fireEvent.click(deleteButton)

    // Check that the delete dialog appears
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()

    // Check that the dialog shows the correct card title (not "undefined")
    expect(screen.getByText('Are you sure you want to delete "Fix login page styles"?')).toBeInTheDocument()
  })

  it('should display the card title for different cards', () => {
    const testCard: Card = {
      id: 'card-2',
      title: 'Add user authentication',
      description: 'Implement OAuth flow',
      columnId: 'col-1',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'medium',
      sprintId: 's1',
      createdAt: '2026-01-02',
      order: 1
    }

    render(<CardItem card={testCard} />)

    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-card-2')
    fireEvent.click(deleteButton)

    // Check that the delete dialog appears with the correct title
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete "Add user authentication"?')).toBeInTheDocument()
  })

  it('should not show "undefined" in the delete confirmation', () => {
    const testCard: Card = {
      id: 'card-1',
      title: 'Fix login page styles',
      description: 'Update CSS for login form',
      columnId: 'col-1',
      assigneeId: 'u1',
      labelIds: ['l1'],
      dueDate: '2026-05-01',
      priority: 'high',
      sprintId: 's1',
      createdAt: '2026-01-01',
      order: 0
    }

    render(<CardItem card={testCard} />)

    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-card-1')
    fireEvent.click(deleteButton)

    // Ensure "undefined" is not in the dialog text
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument()
  })
})
