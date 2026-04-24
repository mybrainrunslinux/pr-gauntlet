import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BoardView } from '../../src/features/board/BoardView'

// Mock useAppContext
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'c1', title: 'Login Feature', description: 'User authentication', columnId: 'col-1', assigneeId: 'u1', labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
        { id: 'c2', title: 'Dashboard UI', description: 'Main dashboard interface', columnId: 'col-1', assigneeId: 'u2', labelIds: [], dueDate: null, priority: 'high', sprintId: null, createdAt: '2026-01-02', order: 1 },
        { id: 'c3', title: 'Payment Gateway', description: 'Integrate payment processing', columnId: 'col-2', assigneeId: null, labelIds: [], dueDate: null, priority: 'low', sprintId: null, createdAt: '2026-01-03', order: 0 },
        { id: 'c4', title: 'User Profile', description: 'User profile management', columnId: 'col-2', assigneeId: 'u1', labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-04', order: 1 },
        { id: 'c5', title: 'Settings Page', description: 'Application settings', columnId: 'col-1', assigneeId: 'u2', labelIds: [], dueDate: null, priority: 'low', sprintId: null, createdAt: '2026-01-05', order: 2 }
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
      searchQuery: 'login',
      activeSprintId: 's1',
      sprintViewEnabled: false,
      boardName: 'Test Board'
    },
    dispatch: vi.fn()
  })
}))

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: any }) => children,
  closestCenter: {},
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
  verticalListSortingStrategy: {}
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => ''
    }
  }
}))

// Mock Column component to show card titles for testing
vi.mock('../../src/features/board/Column', () => ({
  Column: ({ column, cards }: { column: any; cards: any[] }) => (
    <div data-testid={`column-${column.id}`}>
      <h3>{column.title}</h3>
      {cards.map((card: any) => (
        <div key={card.id} data-testid={`card-${card.id}`}>
          {card.title}
        </div>
      ))}
    </div>
  )
}))

describe('search-case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter cards by search query case-insensitively', () => {
    // Render the BoardView with searchQuery 'login' in the mocked state
    render(<BoardView />)

    // Only the card with title 'Login Feature' should be visible
    expect(screen.getByTestId('card-c1')).toBeInTheDocument()
    expect(screen.getByText('Login Feature')).toBeInTheDocument()

    // Other cards should NOT be visible
    expect(screen.queryByTestId('card-c2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-c3')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-c4')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-c5')).not.toBeInTheDocument()

    // Should not see other card titles
    expect(screen.queryByText('Dashboard UI')).not.toBeInTheDocument()
    expect(screen.queryByText('Payment Gateway')).not.toBeInTheDocument()
    expect(screen.queryByText('User Profile')).not.toBeInTheDocument()
    expect(screen.queryByText('Settings Page')).not.toBeInTheDocument()
  })

  it('should filter cards by description case-insensitively', () => {
    // Create a new mock with searchQuery matching description
    const mockWithDescriptionSearch = vi.mocked(vi.importActual('../../src/store/AppContext'))
    vi.doMock('../../src/store/AppContext', () => ({
      useAppContext: () => ({
        state: {
          cards: [
            { id: 'c1', title: 'Login Feature', description: 'User authentication', columnId: 'col-1', assigneeId: 'u1', labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
            { id: 'c2', title: 'Dashboard UI', description: 'Main dashboard interface', columnId: 'col-1', assigneeId: 'u2', labelIds: [], dueDate: null, priority: 'high', sprintId: null, createdAt: '2026-01-02', order: 1 },
            { id: 'c3', title: 'Payment Gateway', description: 'Integrate payment processing', columnId: 'col-2', assigneeId: null, labelIds: [], dueDate: null, priority: 'low', sprintId: null, createdAt: '2026-01-03', order: 0 }
          ],
          columns: [
            { id: 'col-1', title: 'To Do', order: 0 },
            { id: 'col-2', title: 'Done', order: 1 }
          ],
          users: [
            { id: 'u1', name: 'Alice' },
            { id: 'u2', name: 'Bob' }
          ],
          labels: [{ id: 'l1', name: 'Bug', color: '#f00' }],
          sprints: [{ id: 's1', name: 'Active Sprint', active: true }],
          currentUserId: 'u1',
          searchQuery: 'authentication',
          activeSprintId: 's1',
          sprintViewEnabled: false,
          boardName: 'Test Board'
        },
        dispatch: vi.fn()
      })
    }))

    render(<BoardView />)

    // Only the card with description containing 'authentication' should be visible
    expect(screen.getByTestId('card-c1')).toBeInTheDocument()
    expect(screen.queryByTestId('card-c2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-c3')).not.toBeInTheDocument()
  })
})
