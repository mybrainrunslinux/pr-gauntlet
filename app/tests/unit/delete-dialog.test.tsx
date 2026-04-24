import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardItem } from '../../src/features/board/Card'
import type { Card } from '../../src/types'

// Mock useAppContext - components throw without it
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { 
          id: 'card-1', 
          title: 'Fix login page styles', 
          description: 'Update the login form CSS', 
          columnId: 'col-1', 
          assigneeId: 'u1',
          labelIds: ['l1'], 
          dueDate: '2026-05-01', 
          priority: 'high', 
          sprintId: 's1',
          createdAt: '2026-01-01', 
          order: 0 
        },
        { 
          id: 'card-2', 
          title: 'Implement user authentication', 
          description: 'Add JWT token handling', 
          columnId: 'col-1', 
          assigneeId: 'u2',
          labelIds: [], 
          dueDate: null, 
          priority: 'medium', 
          sprintId: 's1',
          createdAt: '2026-01-02', 
          order: 1 
        }
      ],
      columns: [
        { id: 'col-1', title: 'To Do', order: 0 }, 
        { id: 'col-2', title: 'In Progress', order: 1 },
        { id: 'col-3', title: 'Done', order: 2 }
      ],
      users: [
        { id: 'u1', name: 'Alice Johnson', avatar: 'avatar1.png' }, 
        { id: 'u2', name: 'Bob Smith', avatar: 'avatar2.png' }
      ],
      labels: [
        { id: 'l1', name: 'Bug', color: '#ff0000' },
        { id: 'l2', name: 'Feature', color: '#00ff00' }
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
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

// Mock CardEditModal component
vi.mock('../../src/features/card/CardEditModal', () => ({
  CardEditModal: ({ card, onClose }: { card: Card, onClose: () => void }) => (
    <div data-testid="edit-modal">
      <p>Editing: {card.title}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

// Mock formatDate utility
vi.mock('../../src/utils/storage', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString()
}))

describe('delete-dialog', () => {
  const mockCard: Card = {
    id: 'card-1',
    title: 'Fix login page styles',
    description: 'Update the login form CSS',
    columnId: 'col-1',
    assigneeId: 'u1',
    labelIds: ['l1'],
    dueDate: '2026-05-01',
    priority: 'high',
    sprintId: 's1',
    createdAt: '2026-01-01',
    order: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display the correct card title in delete confirmation dialog', () => {
    render(<CardItem card={mockCard} />)
    
    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-card-1')
    fireEvent.click(deleteButton)
    
    // Check that the delete dialog appears
    const deleteDialog = screen.getByTestId('delete-dialog')
    expect(deleteDialog).toBeInTheDocument()
    
    // This test will FAIL on buggy code because it shows "undefined" instead of the card title
    // and PASS after the bug is fixed
    expect(deleteDialog).toHaveTextContent('Are you sure you want to delete "Fix login page styles"?')
  })

  it('should display correct title for different cards', () => {
    const anotherCard: Card = {
      id: 'card-2',
      title: 'Implement user authentication',
      description: 'Add JWT token handling',
      columnId: 'col-1',
      assigneeId: 'u2',
      labelIds: [],
      dueDate: null,
      priority: 'medium',
      sprintId: 's1',
      createdAt: '2026-01-02',
      order: 1
    }

    render(<CardItem card={anotherCard} />)
    
    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-card-2')
    fireEvent.click(deleteButton)
    
    // Check that the delete dialog shows the correct card title
    const deleteDialog = screen.getByTestId('delete-dialog')
    expect(deleteDialog).toHaveTextContent('Are you sure you want to delete "Implement user authentication"?')
  })

  it('should not show delete dialog initially', () => {
    render(<CardItem card={mockCard} />)
    
    // Delete dialog should not be present initially
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
  })

  it('should close delete dialog when cancel is clicked', () => {
    render(<CardItem card={mockCard} />)
    
    // Open delete dialog
    const deleteButton = screen.getByTestId('delete-btn-card-1')
    fireEvent.click(deleteButton)
    
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    
    // Click cancel
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    // Dialog should be closed
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
  })
})
