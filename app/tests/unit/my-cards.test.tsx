import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BoardView } from '../../src/features/board/BoardView'

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id: 'c1', title: 'My Task', description: '', columnId: 'col-1',
          assigneeId: 'Alice',  // CRITICAL: set to the user's NAME not ID 'u1'
          labelIds: [], dueDate: null, priority: 'medium' as const,
          sprintId: null, createdAt: '2026-01-01', order: 0 },
      ],
      columns: [{ id: 'col-1', title: 'Todo', order: 0 }],
      users: [{ id: 'u1', name: 'Alice' }],
      labels: [], sprints: [],
      currentUserId: 'u1',
      searchQuery: 'my cards',  // triggers the filter path
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

describe('my-cards', () => {
  it('My Cards filter does not match when assigneeId is user name instead of user ID', () => {
    render(<BoardView />)
    // Buggy: assigns using name comparison 'Alice'==='Alice' → card SHOWN → test FAILS
    // Clean: plain text search, 'My Task' doesn't include 'my cards' → NOT shown → test PASSES
    expect(screen.queryByText('My Task')).not.toBeInTheDocument()
  })
})
