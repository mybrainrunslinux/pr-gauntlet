import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import App from '../../src/App'

// ALWAYS mock useAppContext — components throw without it
vi.mock('../../src/store/AppContext', () => ({
  AppProvider: ({ children }: { children: any }) => children,
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'Task 1', description:'Test task', columnId:'col-1', assigneeId:'u1',
                 labelIds:['l1'], dueDate:'2026-05-01', priority:'medium', sprintId:'s1',
                 createdAt:'2026-01-01', order:0 }],
      columns: [{ id:'col-1', title:'To Do', order:0 }, { id:'col-2', title:'In Progress', order:1 }, { id:'col-3', title:'Done', order:2 }],
      users: [{ id:'u1', name:'Alice' }, { id:'u2', name:'Bob' }],
      labels: [{ id:'l1', name:'Bug', color:'#f00' }, { id:'l2', name:'Feature', color:'#0f0' }],
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

// ALWAYS mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

// Mock other dependencies
vi.mock('../../src/features/board/BoardView', () => ({
  BoardView: () => <div data-testid="board-view">Board View</div>
}))
vi.mock('../../src/features/filters/SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar">Search</div>
}))
vi.mock('../../src/features/filters/SprintSelector', () => ({
  SprintSelector: () => <div data-testid="sprint-selector">Sprint Selector</div>
}))
vi.mock('../../src/features/stats/BoardStats', () => ({
  BoardStats: () => <div data-testid="board-stats">Stats</div>
}))
vi.mock('../../src/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn()
}))

describe('listener-leak', () => {
  let initialListenerCount: number

  beforeEach(() => {
    // Count initial event listeners on document
    const proto = EventTarget.prototype
    const originalAddEventListener = proto.addEventListener
    const originalRemoveEventListener = proto.removeEventListener
    
    let listenerCount = 0
    
    proto.addEventListener = function(type: string, listener: any, options?: any) {
      if (this === document && type === 'keydown') {
        listenerCount++
      }
      return originalAddEventListener.call(this, type, listener, options)
    }
    
    proto.removeEventListener = function(type: string, listener: any, options?: any) {
      if (this === document && type === 'keydown') {
        listenerCount--
      }
      return originalRemoveEventListener.call(this, type, listener, options)
    }
    
    // Store reference to check listener count
    ;(globalThis as any).getKeydownListenerCount = () => listenerCount
    initialListenerCount = listenerCount
  })

  afterEach(() => {
    // Restore original methods
    const proto = EventTarget.prototype
    const originalAddEventListener = document.addEventListener
    const originalRemoveEventListener = document.removeEventListener
    proto.addEventListener = originalAddEventListener
    proto.removeEventListener = originalRemoveEventListener
    delete (globalThis as any).getKeydownListenerCount
  })

  it('should not accumulate keydown event listeners on re-renders', () => {
    // Render the App component
    const { rerender } = render(<App />)
    
    const getListenerCount = (globalThis as any).getKeydownListenerCount
    
    // After initial render, should have exactly 1 keydown listener
    const afterFirstRender = getListenerCount()
    expect(afterFirstRender).toBe(initialListenerCount + 1)
    
    // Force re-renders by calling rerender multiple times
    rerender(<App />)
    rerender(<App />)
    rerender(<App />)
    rerender(<App />)
    
    // After multiple re-renders, listener count should remain the same
    // BUG: This will fail because the useEffect has no cleanup function
    // and adds a new listener on every render due to missing dependency array
    const afterMultipleRenders = getListenerCount()
    expect(afterMultipleRenders).toBe(initialListenerCount + 1)
  })

  it('should clean up keydown listeners when component unmounts', () => {
    const getListenerCount = (globalThis as any).getKeydownListenerCount
    
    // Render and then unmount
    const { unmount } = render(<App />)
    
    // Should have added 1 listener
    const afterMount = getListenerCount()
    expect(afterMount).toBe(initialListenerCount + 1)
    
    // Unmount should remove the listener
    unmount()
    
    // BUG: This will fail because there's no cleanup function to remove the listener
    const afterUnmount = getListenerCount()
    expect(afterUnmount).toBe(initialListenerCount)
  })

  it('should not create duplicate undo events when re-rendering', () => {
    const mockUndoListener = vi.fn()
    
    // Listen for the custom undo events
    document.addEventListener('taskflow:undo', mockUndoListener)
    
    const { rerender } = render(<App />)
    
    // Force multiple re-renders
    rerender(<App />)
    rerender(<App />)
    
    // Simulate ctrl+z keypress
    const ctrlZEvent = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true
    })
    document.dispatchEvent(ctrlZEvent)
    
    // BUG: This will fail because multiple listeners are attached,
    // causing the undo event to fire multiple times
    expect(mockUndoListener).toHaveBeenCalledTimes(1)
    
    document.removeEventListener('taskflow:undo', mockUndoListener)
  })
})
