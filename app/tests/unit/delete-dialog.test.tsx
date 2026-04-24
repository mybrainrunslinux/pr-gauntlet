import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardItem } from '../../src/features/board/Card'

// Mock useAppContext - components throw without it
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { 
          id: 'card-1', 
          title: 'Fix login page styles', 
          description: 'Update the CSS for login form', 
          columnId: 'col-1', 
          assigneeId: 'u1',
          labelIds: ['l1'], 
          dueDate: '2026-05-01', 
          priority: 'high', 
          sprintId: 's1',
          createdAt: '2026-04-20', 
          order: 1 
        },
        { 
          id: 'card-2', 
          title: 'Update documentation', 
          description: 'Add API docs', 
          columnId: 'col-1', 
          assigneeId: null,
          labelIds: [], 
          dueDate: null, 
          priority: 'medium', 
          sprintId: null,
          createdAt: '2026-04-21', 
          order: 2 
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
        { id: 'l1', name: 'Bug Fix', color: '#ff4444' },
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
  DeleteDialog: ({ card, onConfirm, onCancel }: { 
    card: any, 
    onConfirm: () => void, 
    onCancel: () => void 
  }) => (
    <div data-testid="delete-dialog">
      <p>Are you sure you want to delete "{card?.title}"?</p>
      <button onClick={onConfirm} data-testid="confirm-delete">Confirm</button>
      <button onClick={onCancel} data-testid="cancel-delete">Cancel</button>
    </div>
  )
}))

// Mock CardEditModal
vi.mock('../../src/features/card/CardEditModal', () => ({
  CardEditModal: ({ card, onClose }: { card: any, onClose: () => void }) => (
    <div data-testid="edit-modal">
      <p>Editing: {card.title}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

// Mock storage utils
vi.mock('../../src/utils/storage', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString()
}))

describe('delete-dialog', () => {
  const mockCard = {
    id: 'card-1',
    title: 'Fix login page styles',
    description: 'Update the CSS for login form',
    columnId: 'col-1',
    assigneeId: 'u1',
    labelIds: ['l1'],
    dueDate: '2026-05-01',
    priority: 'high' as const,
    sprintId: 's1',
    createdAt: '2026-04-20',
    order: 1
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display card title in delete confirmation dialog', () => {
    render(<CardItem card={mockCard} />)
    
    // Click delete button to open dialog
    const deleteButton = screen.getByTestId('delete-btn-card-1')
    fireEvent.click(deleteButton)
    
    // Check that delete dialog appears with correct card title
    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toBeInTheDocument()
    
    // This test will FAIL with the buggy code because it shows "undefined"
    // and will PASS after the bug is fixed to show the actual card title
    expect(dialog).toHaveTextContent('Are you sure you want to delete "Fix login page styles"?')
  })

  it('should display correct title for different cards', () => {
    const anotherCard = {
      ...mockCard,
      id: 'card-2',
      title: 'Update documentation'
    }
    
    render(<CardItem card={anotherCard} />)
    
    // Click delete button
    const deleteButton = screen.getByTestId('delete-btn-card-2')
    fireEvent.click(deleteButton)
    
    // Verify the specific card title appears in dialog
    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toHaveTextContent('Are you sure you want to delete "Update documentation"?')
  })

  it('should close dialog when cancel is clicked', () => {
    render(<CardItem card={mockCard} />)
    
    // Open dialog
    const deleteButton = screen.getByTestId('delete-btn-card-1')
    fireEvent.click(deleteButton)
    
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    
    // Cancel dialog
    const cancelButton = screen.getByTestId('cancel-delete')
    fireEvent.click(cancelButton)
    
    // Dialog should be gone
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
  })
})
