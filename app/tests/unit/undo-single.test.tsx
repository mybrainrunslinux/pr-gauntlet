import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BoardView } from '../../src/features/board/BoardView'

const mockDispatch = vi.fn()
let capturedOnDragEnd: ((e: any) => void) | undefined

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [{ id: 'c1', title: 'T', description: '', columnId: 'col-1', assigneeId: null, labelIds: [], dueDate: null, priority: 'medium' as const, sprintId: null, createdAt: '2026-01-01', order: 0 }],
      columns: [{ id: 'col-1', title: 'Todo', order: 0 }, { id: 'col-2', title: 'Done', order: 1 }],
      users: [], labels: [], sprints: [], currentUserId: 'u1', searchQuery: '',
      activeSprintId: null, sprintViewEnabled: false, boardName: 'B',
    },
    dispatch: mockDispatch,
  }),
}))
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => { capturedOnDragEnd = onDragEnd; return <>{children}</> },
  closestCenter: {},
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}))
vi.mock('@dnd-kit/sortable', () => ({ SortableContext: ({ children }: any) => <>{children}</>, useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }), verticalListSortingStrategy: {} }))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

describe('undo-single', () => {
  beforeEach(() => { mockDispatch.mockClear(); capturedOnDragEnd = undefined })
  it('dispatches MOVE_CARD exactly once per drag, not twice', () => {
    render(<BoardView />)
    act(() => { capturedOnDragEnd?.({ active: { id: 'c1' }, over: { id: 'col-2' } }) })
    const moveCalls = mockDispatch.mock.calls.filter((c: any) => c[0]?.type === 'MOVE_CARD')
    // Buggy: 2 MOVE_CARD dispatches. Fixed: exactly 1.
    expect(moveCalls).toHaveLength(1)
  })
})
