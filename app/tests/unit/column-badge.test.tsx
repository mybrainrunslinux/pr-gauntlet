import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Column } from '../../src/features/board/Column'

vi.mock('@dnd-kit/core', () => ({ useDroppable: () => ({ setNodeRef: vi.fn() }) }))
vi.mock('@dnd-kit/sortable', () => ({ SortableContext: ({ children }: any) => <>{children}</>, useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }), verticalListSortingStrategy: {} }))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))
vi.mock('../../src/store/AppContext', () => ({ useAppContext: () => ({ state: { users: [], labels: [] }, dispatch: vi.fn() }) }))

describe('column-badge', () => {
  it('badge count updates when cards prop changes', () => {
    const col = { id: 'col-1', title: 'Todo', order: 0 }
    const card1 = { id:'c1', title:'Card 1', description:'', columnId:'col-1', assigneeId:null, labelIds:[], dueDate:null, priority:'medium' as const, sprintId:null, createdAt:'2026-01-01', order:0 }
    const card2 = { id:'c2', title:'Card 2', description:'', columnId:'col-1', assigneeId:null, labelIds:[], dueDate:null, priority:'medium' as const, sprintId:null, createdAt:'2026-01-01', order:1 }
    const { rerender } = render(<Column column={col} cards={[card1]} />)
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('1')
    rerender(<Column column={col} cards={[card1, card2]} />)
    // Buggy: useMemo([]) → count stuck at 1 → FAILS
    // Clean: useMemo([cards]) → count updates to 2 → PASSES
    expect(screen.getByTestId('badge-col-1')).toHaveTextContent('2')
  })
})
