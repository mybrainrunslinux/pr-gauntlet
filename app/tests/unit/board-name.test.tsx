import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../../src/App'

const mockDispatch = vi.fn()
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [],
      columns: [],
      users: [],
      labels: [],
      sprints: [],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: null,
      sprintViewEnabled: false,
      boardName: 'My Board',
    },
    dispatch: mockDispatch,
  }),
  AppProvider: ({ children }: any) => <>{children}</>,
}))

vi.mock('../../src/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(),
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <>{children}</>,
  closestCenter: {},
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <>{children}</>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

describe('board-name', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('dispatches decoded board name, not HTML entity encoded string', () => {
    render(<App />)
    const h1 = screen.getByTestId('board-name')
    
    // Set innerHTML to contain HTML entities - this is what would happen
    // when a user types special characters in contentEditable
    h1.innerHTML = 'R&amp;D Projects'
    
    fireEvent.blur(h1)
    
    // BUGGY code: reads innerHTML → dispatches 'R&amp;D Projects' (HTML entities)
    // FIXED code: reads textContent → dispatches 'R&D Projects' (decoded)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_BOARD_NAME',
      name: 'R&D Projects'  // Should be decoded, not 'R&amp;D Projects'
    })
  })
})
