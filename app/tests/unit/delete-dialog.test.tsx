import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardItem } from '../../src/features/board/Card'
import type { Card } from '../../src/types'

// Mock dependencies
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { 
          id: 'c1', 
          title: 'Fix login page styles', 
          description: 'Update CSS for login form', 
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
          title: 'Add user authentication', 
          description: 'Implement OAuth2 login', 
          columnId: 'col-1', 
          assigneeId: 'u1',
          labelIds: ['l1'], 
          dueDate: '2026-05-01', 
          priority: 'high', 
          sprintId: 's1',
          createdAt: '2026-01-02', 
          order: 1 
        }
      ],
      columns: [
        { id: 'col-1', title: 'To Do', order: 0 }, 
        { id: 'col-2', title: 'Done', order: 1 }
      ],
      users: [
        { id: 'u1', name: 'Alice Smith' }, 
        { id: 'u2', name: 'Bob Johnson' }
      ],
      labels: [
        { id: 'l1', name: 'Bug', color: '#ff0000' },
        { id: 'l2', name: 'Feature', color: '#00ff00' }
      ],
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
  CardEditModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="edit-modal">
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

vi.mock('../../src/utils/storage', () => ({
  formatDate: (date: string) => date
}))

describe('delete-dialog', () => {
  const mockCard: Card = {
    id: 'c1',
    title: 'Fix login page styles',
    description: 'Update CSS for login form',
    columnId: 'col-1',
    assigneeId: null,
    labelIds: [],
    dueDate: null,
    priority: 'medium',
    sprintId: null,
    createdAt: '2026-01-01',
    order: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display the actual card title in delete confirmation dialog', () => {
    render(<CardItem card={mockCard} />)
    
    // Click the delete button to open the dialog
    const deleteButton = screen.getByTestId('delete-btn-c1')
    fireEvent.click(deleteButton)
    
    // Check that the dialog shows the correct card title
    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toBeInTheDocument()
    
    // This test will FAIL on buggy code because it shows "undefined"
    // and PASS after fix when it shows the actual card title
    expect(dialog).toHaveTextContent('Are you sure you want to delete "Fix login page styles"?')
  })

  it('should display correct title for different cards', () => {
    const anotherCard: Card = {
      id: 'c2',
      title: 'Add user authentication',
      description: 'Implement OAuth2 login',
      columnId: 'col-1',
      assigneeId: 'u1',
      labelIds: ['l1'],
      dueDate: '2026-05-01',
      priority: 'high',
      sprintId: 's1',
      createdAt: '2026-01-02',
      order: 1
    }

    render(<CardItem card={anotherCard} />)
    
    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-c2')
    fireEvent.click(deleteButton)
    
    // Verify the correct title is shown
    const dialog = screen.getByTestId('delete-dialog')
    expect(dialog).toHaveTextContent('Are you sure you want to delete "Add user authentication"?')
  })

  it('should close dialog when cancel is clicked', () => {
    render(<CardItem card={mockCard} />)
    
    // Open dialog
    const deleteButton = screen.getByTestId('delete-btn-c1')
    fireEvent.click(deleteButton)
    
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    
    // Cancel deletion
    const cancelButton = screen.getByTestId('cancel-delete')
    fireEvent.click(cancelButton)
    
    // Dialog should be closed
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
  })
})
