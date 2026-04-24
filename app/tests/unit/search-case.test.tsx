import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BoardView } from '../../src/features/board/BoardView'

// Mock useAppContext - hoisted
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'c1', title: 'Login Feature', description: 'Implement user authentication', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
        { id: 'c2', title: 'Dashboard Setup', description: 'Create main dashboard view', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'high', sprintId: null, createdAt: '2026-01-02', order: 1 },
        { id: 'c3', title: 'User Profile', description: 'Design profile page', columnId: 'col-2', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'low', sprintId: null, createdAt: '2026-01-03', order: 0 },
        { id: 'c4', title: 'API Integration', description: 'Connect to backend services', columnId: 'col-2', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-04', order: 1 },
        { id: 'c5', title: 'Testing Suite', description: 'Setup automated testing', columnId: 'col-1', assigneeId: null,
          labelIds: [], dueDate: null, priority: 'high', sprintId: null, createdAt: '2026-01-05', order: 2 }
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

// Mock Column component
vi.mock('../../src/features/board/Column', () => ({
  Column: ({ column, cards }: { column: any, cards: any[] }) => (
    <div data-testid={`column-${column.id}`}>
      <h3>{column.title}</h3>
      {cards.map(card => (
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

  it('should filter cards case-insensitively when search query is provided', () => {
    // The mock has searchQuery: 'login' and one card with title 'Login Feature'
    // Bug: case-sensitive comparison fails, so all cards show instead of just the matching one
    
    render(<BoardView />)

    // With the bug: all 5 cards are visible because case-sensitive comparison fails
    // Expected behavior: only the 'Login Feature' card should be visible
    
    // Check that only the matching card is rendered
    expect(screen.getByTestId('card-c1')).toBeInTheDocument() // Login Feature - should match
    
    // These should NOT be present when search is working correctly
    expect(screen.queryByTestId('card-c2')).not.toBeInTheDocument() // Dashboard Setup
    expect(screen.queryByTestId('card-c3')).not.toBeInTheDocument() // User Profile  
    expect(screen.queryByTestId('card-c4')).not.toBeInTheDocument() // API Integration
    expect(screen.queryByTestId('card-c5')).not.toBeInTheDocument() // Testing Suite
  })
})
