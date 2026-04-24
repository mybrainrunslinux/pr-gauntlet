import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../../src/App'

const mockDispatch = vi.fn()
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [], columns: [], users: [], labels: [], sprints: [],
      currentUserId: 'u1', searchQuery: '', activeSprintId: null,
      sprintViewEnabled: false, boardName: 'My Board',
    },
    dispatch: mockDispatch,
  }),
  AppProvider: ({ children }: any) => <>{children}</>,
}))
vi.mock('@dnd-kit/core', () => ({ DndContext: ({ children }: any) => <>{children}</>, closestCenter: {}, useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }) }))
vi.mock('@dnd-kit/sortable', () => ({ SortableContext: ({ children }: any) => <>{children}</>, useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }), verticalListSortingStrategy: {} }))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))
vi.mock('../../src/hooks/useWebSocket', () => ({ useWebSocket: vi.fn() }))

describe('listener-leak', () => {
  beforeEach(() => mockDispatch.mockClear())
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
