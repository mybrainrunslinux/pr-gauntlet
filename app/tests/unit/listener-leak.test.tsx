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
      sprints: [{ id:'s1', name:'Active Sprint', active:true }],
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
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }) 
}))
vi.mock('@dnd-kit/sortable', () => ({ 
  SortableContext: ({ children }: any) => <>{children}</>, 
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }), 
  verticalListSortingStrategy: {} 
}))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))
vi.mock('../../src/hooks/useWebSocket', () => ({ useWebSocket: vi.fn() }))
vi.mock('../../src/features/board/BoardView', () => ({ BoardView: () => <div data-testid="board-view" /> }))
vi.mock('../../src/features/filters/SearchBar', () => ({ SearchBar: () => <div data-testid="search-bar" /> }))
vi.mock('../../src/features/filters/SprintSelector', () => ({ SprintSelector: () => <div data-testid="sprint-selector" /> }))
vi.mock('../../src/features/stats/BoardStats', () => ({ BoardStats: () => <div data-testid="board-stats" /> }))

describe('listener-leak', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    vi.clearAllMocks()
  })

  it('keydown listener is removed on unmount (no listener leak)', () => {
    // Track how many times our custom event is dispatched
    let undoEventCount = 0
    const undoListener = () => undoEventCount++
    document.addEventListener('taskflow:undo', undoListener)

    // Render and immediately unmount
    const { unmount } = render(<App />)
    unmount()

    // After unmount, trigger the keydown that would dispatch the custom event
    // Buggy: listener still attached → custom event dispatched → undoEventCount = 1
    // Clean: listener removed → no custom event → undoEventCount = 0
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', { 
        key: 'z', 
        ctrlKey: true, 
        bubbles: true 
      })
      document.dispatchEvent(keyEvent)
    })

    document.removeEventListener('taskflow:undo', undoListener)

    // Clean code: listener cleanup prevents the event, so count stays 0
    // Buggy code: no cleanup, so listener fires and count becomes 1
    expect(undoEventCount).toBe(0)
  })
})
