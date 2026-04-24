import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BoardView } from '../../src/features/board/BoardView'

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id:'c1', title:'Hello World', description:'', columnId:'col-1',
          assigneeId:null, labelIds:[], dueDate:null, priority:'medium' as const,
          sprintId:null, createdAt:'2026-01-01', order:0 },
      ],
      columns: [{ id:'col-1', title:'Todo', order:0 }],
      users: [{ id:'u1', name:'Alice' }], labels: [], sprints: [],
      currentUserId: 'u1',
      searchQuery: 'hello',   // lowercase — title has uppercase 'H', won't match without toLowerCase
      activeSprintId: null,
      sprintViewEnabled: false,
      boardName: 'Board',
    },
    dispatch: vi.fn(),
  }),
}))
vi.mock('@dnd-kit/core', () => ({ DndContext: ({ children }: any) => <>{children}</>, closestCenter: {}, useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }) }))
vi.mock('@dnd-kit/sortable', () => ({ SortableContext: ({ children }: any) => <>{children}</>, useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }), verticalListSortingStrategy: {} }))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

describe('search-case', () => {
  it('search is case-insensitive: lowercase query matches uppercase title', () => {
    render(<BoardView />)
    // Buggy: 'Hello World'.includes('hello') → false → card hidden → FAILS
    // Clean: 'Hello World'.toLowerCase().includes('hello') → true → card shown → PASSES
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
