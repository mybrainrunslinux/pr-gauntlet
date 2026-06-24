import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BoardView } from '../../src/features/board/BoardView'

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id:'c1', title:'Hello World', description:'test description', columnId:'col-1',
          assigneeId:null, labelIds:[], dueDate:null, priority:'medium' as const,
          sprintId:null, createdAt:'2026-01-01', order:0 },
        { id:'c2', title:'Another Task', description:'other task', columnId:'col-1',
          assigneeId:null, labelIds:[], dueDate:null, priority:'medium' as const,
          sprintId:null, createdAt:'2026-01-01', order:1 },
      ],
      columns: [{ id:'col-1', title:'Todo', order:0 }],
      users: [{ id:'u1', name:'Alice' }], 
      labels: [], 
      sprints: [],
      currentUserId: 'u1',
      searchQuery: 'hello',
      activeSprintId: null,
      sprintViewEnabled: false,
      boardName: 'Board',
    },
    dispatch: vi.fn(),
  }),
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  closestCenter: {},
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false
  }),
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } }
}))

vi.mock('../../src/features/board/Column', () => ({
  Column: ({ column, cards }: { column: any, cards: any[] }) => (
    <div data-testid={`column-${column.id}`}>
      <h2>{column.title}</h2>
      {cards.map(card => (
        <div key={card.id} data-testid={`card-${card.id}`}>
          {card.title}
        </div>
      ))}
    </div>
  )
}))

describe('search-case', () => {
  it('search is case-insensitive: lowercase query matches uppercase title', () => {
    render(<BoardView />)
    
    // Buggy: 'Hello World'.includes('hello') → false → card filtered out → FAILS
    // Clean: 'Hello World'.toLowerCase().includes('hello') → true → card shown → PASSES
    expect(screen.getByTestId('card-c1')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
    
    // Card that doesn't match should not be visible
    expect(screen.queryByTestId('card-c2')).not.toBeInTheDocument()
  })
})
