import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Column } from '../../src/features/board/Column'
import type { Column as ColumnType, Card } from '../../src/types'

// ALWAYS mock useAppContext — components throw without it:
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [
        { id:'c1', title:'Task 1', description:'', columnId:'col-1', assigneeId:null,
          labelIds:[], dueDate:null, priority:'medium', sprintId:null,
          createdAt:'2026-01-01', order:0 },
        { id:'c2', title:'Task 2', description:'', columnId:'col-1', assigneeId:null,
          labelIds:[], dueDate:null, priority:'medium', sprintId:null,
          createdAt:'2026-01-01', order:1 }
      ],
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

// ALWAYS mock dnd-kit:
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn() })
}))
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

describe('column-badge', () => {
  const mockColumn: ColumnType = {
    id: 'col-1',
    title: 'To Do',
    order: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update badge count when cards prop changes', () => {
    // Initial cards array with 2 items
    const initialCards: Card[] = [
      { id:'c1', title:'Task 1', description:'', columnId:'col-1', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:0 },
      { id:'c2', title:'Task 2', description:'', columnId:'col-1', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:1 }
    ]

    // Render with initial cards
    const { rerender } = render(
      <Column column={mockColumn} cards={initialCards} />
    )

    // Should show count of 2
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('2')

    // Updated cards array with 3 items (simulate drag-drop adding a card)
    const updatedCards: Card[] = [
      ...initialCards,
      { id:'c3', title:'Task 3', description:'', columnId:'col-1', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:2 }
    ]

    // Re-render with updated cards
    rerender(<Column column={mockColumn} cards={updatedCards} />)

    // Badge should update to show count of 3
    // This test FAILS on buggy code (still shows 2) and PASSES after fix
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('3')
  })

  it('should update badge count when cards are removed', () => {
    // Initial cards array with 2 items
    const initialCards: Card[] = [
      { id:'c1', title:'Task 1', description:'', columnId:'col-1', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:0 },
      { id:'c2', title:'Task 2', description:'', columnId:'col-1', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:1 }
    ]

    // Render with initial cards
    const { rerender } = render(
      <Column column={mockColumn} cards={initialCards} />
    )

    // Should show count of 2
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('2')

    // Updated cards array with 1 item (simulate drag-drop removing a card)
    const updatedCards: Card[] = [
      { id:'c1', title:'Task 1', description:'', columnId:'col-1', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:0 }
    ]

    // Re-render with updated cards
    rerender(<Column column={mockColumn} cards={updatedCards} />)

    // Badge should update to show count of 1
    // This test FAILS on buggy code (still shows 2) and PASSES after fix
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('1')
  })

  it('should show 0 when all cards are removed', () => {
    // Initial cards array with 1 item
    const initialCards: Card[] = [
      { id:'c1', title:'Task 1', description:'', columnId:'col-1', assigneeId:null,
        labelIds:[], dueDate:null, priority:'medium', sprintId:null,
        createdAt:'2026-01-01', order:0 }
    ]

    // Render with initial cards
    const { rerender } = render(
      <Column column={mockColumn} cards={initialCards} />
    )

    // Should show count of 1
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('1')

    // Re-render with empty cards array
    rerender(<Column column={mockColumn} cards={[]} />)

    // Badge should update to show count of 0
    // This test FAILS on buggy code (still shows 1) and PASSES after fix
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('0')
  })
})
