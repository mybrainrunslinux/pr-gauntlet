import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import App from '../../src/App'

// REQUIRED Mock patterns
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'Test Card', description:'Test description', columnId:'col-1', assigneeId:'u1',
                 labelIds:['l1'], dueDate:'2026-05-01', priority:'medium', sprintId:'s1',
                 createdAt:'2026-01-01', order:0 }],
      columns: [{ id:'col-1', title:'To Do', order:0 }, { id:'col-2', title:'In Progress', order:1 }, { id:'col-3', title:'Done', order:2 }],
      users: [{ id:'u1', name:'Alice Smith' }, { id:'u2', name:'Bob Johnson' }],
      labels: [{ id:'l1', name:'Bug', color:'#ff0000' }, { id:'l2', name:'Feature', color:'#00ff00' }],
      sprints: [{ id:'s0', name:'Past Sprint', active:false }, { id:'s1', name:'Current Sprint', active:true }],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: 's1',
      sprintViewEnabled: false,
      boardName: 'Project Board',
    },
    dispatch: vi.fn(),
  }),
  AppProvider: ({ children }: { children: any }) => children,
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

vi.mock('../../src/features/board/BoardView', () => ({
  BoardView: () => <div data-testid="board-view">Board View</div>
}))

vi.mock('../../src/features/filters/SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar">Search Bar</div>
}))

vi.mock('../../src/features/filters/SprintSelector', () => ({
  SprintSelector: () => <div data-testid="sprint-selector">Sprint Selector</div>
}))

vi.mock('../../src/features/stats/BoardStats', () => ({
  BoardStats: () => <div data-testid="board-stats">Board Stats</div>
}))

vi.mock('../../src/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn()
}))

describe('listener-leak', () => {
  let originalAddEventListener: typeof document.addEventListener
  let originalRemoveEventListener: typeof document.removeEventListener
  let addEventListenerSpy: ReturnType<typeof vi.fn>
  let removeEventListenerSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Spy on document event listener methods
    originalAddEventListener = document.addEventListener
    originalRemoveEventListener = document.removeEventListener
    addEventListenerSpy = vi.fn(originalAddEventListener.bind(document))
    removeEventListenerSpy = vi.fn(originalRemoveEventListener.bind(document))
    document.addEventListener = addEventListenerSpy
    document.removeEventListener = removeEventListenerSpy
  })

  afterEach(() => {
    // Restore original methods
    document.addEventListener = originalAddEventListener
    document.removeEventListener = originalRemoveEventListener
    cleanup()
    vi.clearAllMocks()
  })

  it('should not leak keyboard event listeners on multiple renders', () => {
    // First render
    const { rerender } = render(<App />)
    
    const initialAddCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length
    const initialRemoveCalls = removeEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length

    // Force multiple re-renders to trigger useEffect multiple times
    rerender(<App />)
    rerender(<App />)
    rerender(<App />)

    const finalAddCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length
    const finalRemoveCalls = removeEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length

    // Calculate net listeners added (add calls minus remove calls)
    const netListenersAdded = (finalAddCalls - finalRemoveCalls)

    // BUG: With the buggy code, listeners accumulate because useEffect
    // doesn't return a cleanup function. Each render adds a new listener
    // but never removes the old one.
    // FIXED: Should only have 1 net listener regardless of re-renders
    expect(netListenersAdded).toBe(1)
  })

  it('should clean up keyboard listeners when component unmounts', () => {
    const { unmount } = render(<App />)

    const addCallsBeforeUnmount = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length

    // Unmount component
    unmount()

    const removeCallsAfterUnmount = removeEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length

    // Should have equal number of add and remove calls after unmount
    expect(removeCallsAfterUnmount).toBe(addCallsBeforeUnmount)
  })

  it('should prevent duplicate keyboard shortcuts from firing', () => {
    render(<App />)

    // Get the actual handler function from the addEventListener call
    const keydownCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    )
    
    // With the bug, multiple handlers will be registered
    // After fix, should only have one handler
    expect(keydownCalls.length).toBe(1)

    // Simulate the problematic scenario: rapid key presses
    const mockEvent = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true
    })

    const customEventSpy = vi.spyOn(document, 'dispatchEvent')
    
    // Simulate the same key event multiple times (as if handlers accumulated)
    document.dispatchEvent(mockEvent)
    document.dispatchEvent(mockEvent)
    document.dispatchEvent(mockEvent)

    // Should only dispatch the custom event once per actual keypress
    // (This test verifies the handler behavior, but the real fix is preventing
    // multiple handlers from being registered in the first place)
    expect(customEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'taskflow:undo'
      })
    )
  })
})
