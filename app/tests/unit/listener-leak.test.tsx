import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import App from '../../src/App'

// Mock the AppContext with AppProvider export
vi.mock('../../src/store/AppContext', async () => {
  const actual = await vi.importActual('../../src/store/AppContext')
  return {
    ...actual,
    AppProvider: ({ children }: { children: any }) => children,
    useAppContext: () => ({
      state: {
        cards: [{ 
          id: 'c1', 
          title: 'Test Card', 
          description: 'Test Description', 
          columnId: 'col-1', 
          assigneeId: 'u1',
          labelIds: ['l1'], 
          dueDate: null, 
          priority: 'medium' as const, 
          sprintId: 's1',
          createdAt: '2026-01-01', 
          order: 0 
        }],
        columns: [
          { id: 'col-1', title: 'To Do', order: 0 }, 
          { id: 'col-2', title: 'Done', order: 1 }
        ],
        users: [
          { id: 'u1', name: 'Alice', avatar: 'alice.jpg' }, 
          { id: 'u2', name: 'Bob', avatar: 'bob.jpg' }
        ],
        labels: [{ id: 'l1', name: 'Bug', color: '#f00' }],
        sprints: [
          { id: 's0', name: 'Past Sprint', active: false }, 
          { id: 's1', name: 'Active Sprint', active: true }
        ],
        currentUserId: 'u1',
        searchQuery: '',
        activeSprintId: 's1',
        sprintViewEnabled: false,
        boardName: 'Test Board',
      },
      dispatch: vi.fn(),
    })
  }
})

// Mock dnd-kit
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

// Mock other components to isolate the bug
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
  let originalAddEventListener: typeof document.addEventListener
  let originalRemoveEventListener: typeof document.removeEventListener
  let addEventListenerSpy: ReturnType<typeof vi.fn>
  let removeEventListenerSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    originalAddEventListener = document.addEventListener
    originalRemoveEventListener = document.removeEventListener
    addEventListenerSpy = vi.fn(originalAddEventListener.bind(document))
    removeEventListenerSpy = vi.fn(originalRemoveEventListener.bind(document))
    document.addEventListener = addEventListenerSpy
    document.removeEventListener = removeEventListenerSpy
  })

  afterEach(() => {
    document.addEventListener = originalAddEventListener
    document.removeEventListener = originalRemoveEventListener
    vi.clearAllMocks()
  })

  it('should not accumulate duplicate event listeners on component re-renders', () => {
    // Initial render
    const { rerender } = render(<App />)
    
    // Get initial keydown listener count
    const initialKeydownCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length

    // Force multiple re-renders by changing props/context
    rerender(<App />)
    rerender(<App />)
    rerender(<App />)

    // Count total keydown listeners added
    const totalKeydownCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length

    // Count keydown listeners removed
    const removedKeydownCalls = removeEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length

    // In buggy code: listeners accumulate (more added than removed)
    // In fixed code: listeners are cleaned up (added === removed for re-renders)
    const netListeners = totalKeydownCalls - removedKeydownCalls

    // Should only have 1 active listener, not accumulating
    expect(netListeners).toBe(1)
    
    // Verify that cleanup is happening on re-renders
    if (totalKeydownCalls > initialKeydownCalls) {
      expect(removedKeydownCalls).toBeGreaterThan(0)
    }
  })

  it('should clean up event listener on component unmount', () => {
    const { unmount } = render(<App />)
    
    // Get keydown listeners added during mount
    const keydownListenersAdded = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length

    expect(keydownListenersAdded).toBeGreaterThan(0)

    // Clear the mock to focus on unmount behavior
    removeEventListenerSpy.mockClear()

    // Unmount component
    unmount()

    // Should have removed the keydown listener
    const keydownListenersRemoved = removeEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    ).length

    expect(keydownListenersRemoved).toBe(keydownListenersAdded)
  })
})
