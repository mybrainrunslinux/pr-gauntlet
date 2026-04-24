import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import App from '../../src/App'

// REQUIRED Mock patterns (vi.mock is hoisted — use inline literals only, no variables)
vi.mock('../../src/store/AppContext', () => ({
  AppProvider: ({ children }: { children: any }) => children,
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'Test Card', description:'A test card', columnId:'col-1', assigneeId:null,
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
    dispatch: vi.fn(),
  })
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
  let addEventListenerSpy: any
  let removeEventListenerSpy: any
  let originalAddEventListener: any
  let originalRemoveEventListener: any

  beforeEach(() => {
    // Spy on document.addEventListener and removeEventListener to track listener management
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
  })

  it('should clean up keyboard event listeners on component unmount to prevent memory leaks', () => {
    // Render the App component multiple times to simulate re-renders/remounts
    const { unmount: unmount1 } = render(<App />)
    const { unmount: unmount2 } = render(<App />)
    const { unmount: unmount3 } = render(<App />)

    // Verify that keydown listeners were added
    const keydownAddCalls = addEventListenerSpy.mock.calls.filter(
      (call: any[]) => call[0] === 'keydown'
    )
    expect(keydownAddCalls.length).toBe(3) // One for each render

    // Unmount all components
    unmount1()
    unmount2()
    unmount3()

    // Verify that listeners were properly removed
    const keydownRemoveCalls = removeEventListenerSpy.mock.calls.filter(
      (call: any[]) => call[0] === 'keydown'
    )

    // This test FAILS on buggy code (no cleanup) and PASSES after fix
    expect(keydownRemoveCalls.length).toBe(3) // Should match the number of add calls
  })

  it('should not accumulate event listeners on re-renders', () => {
    const { rerender } = render(<App />)
    
    // Simulate multiple re-renders
    rerender(<App />)
    rerender(<App />)
    rerender(<App />)

    // Count keydown listeners added
    const keydownAddCalls = addEventListenerSpy.mock.calls.filter(
      (call: any[]) => call[0] === 'keydown'
    )

    // With proper cleanup, we should only have the current active listener
    // Without cleanup (buggy code), this will accumulate listeners on each render
    // This test will FAIL on buggy code and PASS after fix
    expect(keydownAddCalls.length).toBe(1) // Only one active listener should exist
  })

  it('should maintain listener cleanup balance over multiple mount/unmount cycles', () => {
    // Simulate multiple mount/unmount cycles
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<App />)
      unmount()
    }

    const keydownAddCalls = addEventListenerSpy.mock.calls.filter(
      (call: any[]) => call[0] === 'keydown'
    )
    const keydownRemoveCalls = removeEventListenerSpy.mock.calls.filter(
      (call: any[]) => call[0] === 'keydown'
    )

    // Every addEventListener should have a corresponding removeEventListener
    // This will FAIL on buggy code (no cleanup) and PASS after fix
    expect(keydownAddCalls.length).toBe(keydownRemoveCalls.length)
    expect(keydownAddCalls.length).toBe(5)
  })
})
