import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardItem } from '../../src/features/board/Card'
import type { Card } from '../../src/types'

// Mock useAppContext
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { 
          id: 'c1', 
          title: 'Fix login page styles', 
          description: 'Update the CSS for the login form', 
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
          title: 'Add user authentication', 
          description: 'Implement JWT auth', 
          columnId: 'col-1', 
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
        { id: 'col-2', title: 'In Progress', order: 1 },
        { id: 'col-3', title: 'Done', order: 2 }
      ],
      users: [
        { id: 'u1', name: 'Alice Johnson', avatar: 'alice.jpg' }, 
        { id: 'u2', name: 'Bob Smith', avatar: 'bob.jpg' }
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
      sprintViewEnabled: true,
      boardName: 'Development Board',
    },
    dispatch: vi.fn(),
  })
}))

// Mock dnd-kit
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

// Mock DeleteDialog component
vi.mock('../../src/features/card/DeleteDialog', () => ({
  DeleteDialog: ({ card, onConfirm, onCancel }: { card: Card, onConfirm: () => void, onCancel: () => void }) => (
    <div data-testid="delete-dialog">
      <p>Are you sure you want to delete "{card?.title}"?</p>
      <button onClick={onConfirm} data-testid="confirm-delete">Confirm</button>
      <button onClick={onCancel} data-testid="cancel-delete">Cancel</button>
    </div>
  )
}))

// Mock CardEditModal
vi.mock('../../src/features/card/CardEditModal', () => ({
  CardEditModal: ({ card, onClose }: { card: Card, onClose: () => void }) => (
    <div data-testid="edit-modal">
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

// Mock formatDate utility
vi.mock('../../src/utils/storage', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString()
}))

describe('delete-dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display the correct card title in delete confirmation dialog', () => {
    const testCard: Card = {
      id: 'c1',
      title: 'Fix login page styles',
      description: 'Update the CSS for the login form',
      columnId: 'col-1',
      assigneeId: 'u1',
      labelIds: ['l1'],
      dueDate: '2026-05-01',
      priority: 'high',
      sprintId: 's1',
      createdAt: '2026-04-20',
      order: 0
    }

    render(<CardItem card={testCard} />)

    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-c1')
    fireEvent.click(deleteButton)

    // Check that the delete dialog appears with the correct card title
    const deleteDialog = screen.getByTestId('delete-dialog')
    expect(deleteDialog).toBeInTheDocument()
    
    // This should show the actual card title, not "undefined"
    expect(deleteDialog).toHaveTextContent('Are you sure you want to delete "Fix login page styles"?')
  })

  it('should display correct title for different card', () => {
    const testCard: Card = {
      id: 'c2',
      title: 'Add user authentication',
      description: 'Implement JWT auth',
      columnId: 'col-1',
      assigneeId: 'u2',
      labelIds: [],
      dueDate: null,
      priority: 'medium',
      sprintId: 's1',
      createdAt: '2026-04-21',
      order: 1
    }

    render(<CardItem card={testCard} />)

    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-c2')
    fireEvent.click(deleteButton)

    // Check that the delete dialog appears with the correct card title
    const deleteDialog = screen.getByTestId('delete-dialog')
    expect(deleteDialog).toBeInTheDocument()
    
    // This should show the actual card title, not "undefined"
    expect(deleteDialog).toHaveTextContent('Are you sure you want to delete "Add user authentication"?')
  })
})
