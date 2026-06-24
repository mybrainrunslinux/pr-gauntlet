import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../../src/App'

const mockDispatch = vi.fn()

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'Test Card', description:'', columnId:'col-1', assigneeId:null,
                 labelIds:[], dueDate:null, priority:'medium', sprintId:null,
                 createdAt:'2026-01-01', order:0 }],
      columns: [{ id:'col-1', title:'To Do', order:0 }, { id:'col-2', title:'Done', order:1 }],
      users: [{ id:'u1', name:'Alice' }, { id:'u2', name:'Bob' }],
      labels: [{ id:'l1', name:'Bug', color:'#f00' }],
      sprints: [{ id:'s0', name:'Past Sprint', active:false }, { id:'s1', name:'Active Sprint', active:true }],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: 's1',
      sprintViewEnabled: false,
      boardName: 'Test Board',
    },
    dispatch: mockDispatch,
  }),
  AppProvider: ({ children }: any) => <>{children}</>,
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <>{children}</>,
  closestCenter: {},
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: any) => children,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } }
}))

vi.mock('../../src/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn()
}))

vi.mock('../../src/features/board/BoardView', () => ({
  BoardView: () => <div data-testid="board-view">Board View</div>
}))

vi.mock('../../src/features/filters/SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar">Search</div>
}))

vi.mock('../../src/features/filters/SprintSelector', () => ({
  SprintSelector: () => <div data-testid="sprint-selector">Sprint</div>
}))

vi.mock('../../src/features/stats/BoardStats', () => ({
  BoardStats: () => <div data-testid="board-stats">Stats</div>
}))

describe('listener-leak', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('keydown listener is removed on unmount (no listener leak)', () => {
    let undoCount = 0
    const undoListener = () => undoCount++
    document.addEventListener('taskflow:undo', undoListener)

    const { unmount } = render(<App />)
    unmount()  // clean: cleanup runs → removeEventListener; buggy: nothing → handler stays

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }))
    })

    document.removeEventListener('taskflow:undo', undoListener)

    // Buggy: handler active after unmount → 'taskflow:undo' fires → undoCount=1 → FAILS
    // Clean: cleanup removes handler → no event → undoCount=0 → PASSES
    expect(undoCount).toBe(0)
  })
})
