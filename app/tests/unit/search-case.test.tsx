import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BoardView } from '../../src/features/board/BoardView'

// Mock useAppContext with realistic data
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'c1', title: 'Login Feature', description: 'Implement user authentication', columnId: 'col-1', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 0 },
        { id: 'c2', title: 'Dashboard UI', description: 'Create main dashboard layout', columnId: 'col-1', assigneeId: null, labelIds: [], dueDate: null, priority: 'high', sprintId: null, createdAt: '2026-01-01', order: 1 },
        { id: 'c3', title: 'API Integration', description: 'Connect to backend LOGIN service', columnId: 'col-2', assigneeId: null, labelIds: [], dueDate: null, priority: 'low', sprintId: null, createdAt: '2026-01-01', order: 0 },
        { id: 'c4', title: 'Testing', description: 'Write unit tests', columnId: 'col-2', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium', sprintId: null, createdAt: '2026-01-01', order: 1 },
        { id: 'c5', title: 'Documentation', description: 'Update project docs', columnId: 'col-1', assigneeId: null, labelIds: [], dueDate: null, priority: 'low', sprintId: null, createdAt: '2026-01-01', order: 2 }
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
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({ 
  CSS: { Transform: { toString: () => '' } } 
}))

// Mock Column component to show card titles
vi.mock('../../src/features/board/Column', () => ({
  Column: ({ cards }: { cards: any[] }) => (
    <div data-testid={`column-${cards[0]?.columnId || 'empty'}`}>
      {cards.map((card: any) => (
        <div key={card.id} data-testid={`card-${card.id}`}>
          {card.title}
        </div>
      ))}
    </div>
  )
}))

describe('search-case', () => {
  it('should filter cards case-insensitively when searching by title', () => {
    // The mock has searchQuery: 'login' (lowercase)
    // Card 'c1' has title: 'Login Feature' (uppercase L)
    // Card 'c3' has description: 'Connect to backend LOGIN service' (uppercase LOGIN)
    
    render(<BoardView />)
    
    // In the BUGGY version: card.title.includes(q) where q='login' but card.title='Login Feature'
    // This should fail because 'Login Feature'.includes('login') is false (case-sensitive)
    // Only card c3 should match via description: 'Connect to backend LOGIN service'.includes('login') is false (also case-sensitive bug)
    
    // In the FIXED version: both should be lowercased, so both cards should be visible
    
    // Check that the Login Feature card is visible (should fail on buggy code)
    expect(screen.getByTestId('card-c1')).toBeInTheDocument()
    
    // Check that the API Integration card is visible (matches via description)
    expect(screen.getByTestId('card-c3')).toBeInTheDocument()
    
    // Check that non-matching cards are NOT visible
    expect(screen.queryByTestId('card-c2')).not.toBeInTheDocument() // Dashboard UI
    expect(screen.queryByTestId('card-c4')).not.toBeInTheDocument() // Testing
    expect(screen.queryByTestId('card-c5')).not.toBeInTheDocument() // Documentation
  })
})
