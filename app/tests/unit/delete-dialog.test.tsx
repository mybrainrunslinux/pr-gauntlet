import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardItem } from '../../src/features/board/Card'
import type { Card } from '../../src/types'

// Required mocks
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { 
          id: 'card-1', 
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
          id: 'card-2', 
          title: 'Add user authentication', 
          description: 'Implement JWT auth', 
          columnId: 'col-1', 
          assigneeId: null,
          labelIds: [], 
          dueDate: null, 
          priority: 'medium', 
          sprintId: null,
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
        { id: 'u1', name: 'Alice Johnson', avatar: 'avatar1.jpg' }, 
        { id: 'u2', name: 'Bob Smith', avatar: 'avatar2.jpg' }
      ],
      labels: [
        { id: 'l1', name: 'Bug Fix', color: '#ff4444' },
        { id: 'l2', name: 'Feature', color: '#44ff44' }
      ],
      sprints: [
        { id: 's0', name: 'Previous Sprint', active: false }, 
        { id: 's1', name: 'Current Sprint', active: true }
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
  DeleteDialog: ({ card, onConfirm, onCancel }: { card: Card; onConfirm: () => void; onCancel: () => void }) => (
    <div data-testid="delete-dialog">
      <p>Are you sure you want to delete "{card?.title}"?</p>
      <button onClick={onConfirm} data-testid="confirm-delete">Delete</button>
      <button onClick={onCancel} data-testid="cancel-delete">Cancel</button>
    </div>
  )
}))

vi.mock('../../src/features/card/CardEditModal', () => ({
  CardEditModal: ({ card, onClose }: { card: Card; onClose: () => void }) => (
    <div data-testid="edit-modal">
      <h3>Edit: {card.title}</h3>
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

vi.mock('../../src/utils/storage', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString()
}))

describe('delete-dialog', () => {
  const mockCard: Card = {
    id: 'card-1',
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
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show card title in delete confirmation dialog', () => {
    render(<CardItem card={mockCard} />)
    
    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-card-1')
    fireEvent.click(deleteButton)
    
    // Check that the delete dialog appears
    const deleteDialog = screen.getByTestId('delete-dialog')
    expect(deleteDialog).toBeInTheDocument()
    
    // The dialog should show the actual card title, not "undefined"
    expect(deleteDialog).toHaveTextContent('Are you sure you want to delete "Fix login page styles"?')
    expect(deleteDialog).not.toHaveTextContent('Are you sure you want to delete "undefined"?')
  })

  it('should show correct title for different cards', () => {
    const differentCard: Card = {
      id: 'card-2',
      title: 'Add user authentication',
      description: 'Implement JWT auth',
      columnId: 'col-1',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'medium',
      sprintId: null,
      createdAt: '2026-04-21',
      order: 1
    }

    render(<CardItem card={differentCard} />)
    
    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-card-2')
    fireEvent.click(deleteButton)
    
    // Check that the delete dialog shows the correct title
    const deleteDialog = screen.getByTestId('delete-dialog')
    expect(deleteDialog).toHaveTextContent('Are you sure you want to delete "Add user authentication"?')
  })
})
