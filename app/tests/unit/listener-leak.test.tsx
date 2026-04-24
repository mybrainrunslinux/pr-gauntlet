import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import App from '../../src/App'

// REQUIRED Mock patterns (vi.mock is hoisted — use inline literals only, no variables)
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'Test Card', description:'Test desc', columnId:'col-1', assigneeId:'u1',
                 labelIds:['l1'], dueDate:'2026-05-01', priority:'medium', sprintId:'s1',
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
    dispatch: vi.fn(),
  }),
  AppProvider: ({ children }: { children: any }) => children,
}))

vi.mock('@dnd-kit/core', () => ({ 
  DndContext: ({ children }: { children: any }) => <>{children}</>, 
  closestCenter: {}, 
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }) 
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
  SearchBar: () => <div data-testid="search-bar">Search</div>
}))

vi.mock('../../src/features/filters/SprintSelector', () => ({
  SprintSelector: () => <div data-testid="sprint-selector">Sprint</div>
}))

vi.mock('../../src/features/stats/BoardStats', () => ({
  BoardStats: () => <div data-testid="board-stats">Stats</div>
}))

vi.mock('../../src/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn()
}))

describe('listener-leak', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('should not accumulate keydown event listeners on re-renders', () => {
    // Render the App component
    const { rerender } = render(<App />)
    
    // Initial render should add one keydown listener
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    const initialAddCalls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'keydown').length
    expect(initialAddCalls).toBe(1)

    // Force multiple re-renders by re-rendering the component
    rerender(<App />)
    rerender(<App />)
    rerender(<App />)

    // Check how many keydown listeners were added vs removed
    const totalAddCalls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'keydown').length
    const totalRemoveCalls = removeEventListenerSpy.mock.calls.filter(call => call[0] === 'keydown').length

    // BUGGY CODE: Should fail because listeners accumulate (more adds than removes)
    // FIXED CODE: Should pass because each add has a corresponding remove
    expect(totalAddCalls - totalRemoveCalls).toBeLessThanOrEqual(1)
  })

  it('should clean up keydown listeners when component unmounts', () => {
    // Render and unmount the App component
    const { unmount } = render(<App />)
    
    // Verify initial listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    const addCallsBeforeUnmount = addEventListenerSpy.mock.calls.filter(call => call[0] === 'keydown').length
    
    // Unmount the component
    unmount()
    
    // Check that removeEventListener was called for cleanup
    const removeCallsAfterUnmount = removeEventListenerSpy.mock.calls.filter(call => call[0] === 'keydown').length
    
    // BUGGY CODE: Should fail because no cleanup happens (removeCallsAfterUnmount = 0)
    // FIXED CODE: Should pass because cleanup removes the listener (removeCallsAfterUnmount >= addCallsBeforeUnmount)
    expect(removeCallsAfterUnmount).toBeGreaterThanOrEqual(addCallsBeforeUnmount)
  })

  it('should prevent keyboard shortcut double-firing by proper listener management', () => {
    const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent')
    
    // Render component multiple times to simulate the bug condition
    const { rerender } = render(<App />)
    rerender(<App />)
    rerender(<App />)
    
    // Simulate the problematic keyboard shortcut
    const keyEvent = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true })
    document.dispatchEvent(keyEvent)
    
    // Count how many undo events were dispatched
    const undoEvents = dispatchEventSpy.mock.calls.filter(call => 
      call[0] instanceof CustomEvent && call[0].type === 'taskflow:undo'
    ).length
    
    // BUGGY CODE: Should fail because multiple listeners fire (undoEvents > 1)
    // FIXED CODE: Should pass because only one listener fires (undoEvents = 1)
    expect(undoEvents).toBe(1)
    
    vi.restoreAllMocks()
  })
})
