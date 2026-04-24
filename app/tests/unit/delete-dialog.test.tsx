import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardItem } from '../../src/features/board/Card'

// Mock useAppContext
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { 
          id: 'c1', 
          title: 'Fix login page styles', 
          description: 'Update CSS for better UX', 
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
          id: 'c2', 
          title: 'Add user authentication', 
          description: 'Implement JWT auth', 
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
        { id: 'col-2', title: 'Done', order: 1 }
      ],
      users: [
        { id: 'u1', name: 'Alice' }, 
        { id: 'u2', name: 'Bob' }
      ],
      labels: [
        { id: 'l1', name: 'Bug', color: '#f00' }
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
  CSS: { 
    Transform: { 
      toString: () => '' 
    } 
  } 
}))

// Mock DeleteDialog component
vi.mock('../../src/features/card/DeleteDialog', () => ({
  DeleteDialog: ({ card, onConfirm, onCancel }: any) => (
    <div data-testid="delete-dialog">
      <p>Are you sure you want to delete "{card?.title}"?</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

// Mock CardEditModal component
vi.mock('../../src/features/card/CardEditModal', () => ({
  CardEditModal: ({ card, onClose }: any) => (
    <div data-testid="edit-modal">
      <p>Editing: {card.title}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

// Mock storage utils
vi.mock('../../src/utils/storage', () => ({
  formatDate: (date: string) => date
}))

describe('delete-dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show card title in delete confirmation dialog', () => {
    const card = {
      id: 'c1',
      title: 'Fix login page styles',
      description: 'Update CSS for better UX',
      columnId: 'col-1',
      assigneeId: 'u1',
      labelIds: ['l1'],
      dueDate: '2026-05-01',
      priority: 'high' as const,
      sprintId: 's1',
      createdAt: '2026-01-01',
      order: 0
    }

    render(<CardItem card={card} />)

    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-c1')
    fireEvent.click(deleteButton)

    // Check that the delete dialog appears with the correct card title
    const deleteDialog = screen.getByTestId('delete-dialog')
    expect(deleteDialog).toBeInTheDocument()
    
    // This should show the card title, not "undefined"
    expect(deleteDialog).toHaveTextContent('Are you sure you want to delete "Fix login page styles"?')
    expect(deleteDialog).not.toHaveTextContent('Are you sure you want to delete "undefined"?')
  })

  it('should show correct title for different cards', () => {
    const card = {
      id: 'c2',
      title: 'Add user authentication',
      description: 'Implement JWT auth',
      columnId: 'col-1',
      assigneeId: 'u2',
      labelIds: [],
      dueDate: null,
      priority: 'medium' as const,
      sprintId: 's1',
      createdAt: '2026-01-02',
      order: 1
    }

    render(<CardItem card={card} />)

    // Click the delete button
    const deleteButton = screen.getByTestId('delete-btn-c2')
    fireEvent.click(deleteButton)

    // Check that the delete dialog shows the correct card title
    const deleteDialog = screen.getByTestId('delete-dialog')
    expect(deleteDialog).toHaveTextContent('Are you sure you want to delete "Add user authentication"?')
  })
})
