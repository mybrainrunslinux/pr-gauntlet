import { render, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SprintSelector } from '../../src/features/filters/SprintSelector'

const mockSprints = [
  { id: 's0', name: 'Past Sprint', active: false },
  { id: 's1', name: 'Active Sprint', active: true },
]
const mockDispatch = vi.fn()

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'Test Card', description:'', columnId:'col-1', assigneeId:null,
                 labelIds:[], dueDate:null, priority:'medium', sprintId:'s1',
                 createdAt:'2026-01-01', order:0 }],
      columns: [{ id:'col-1', title:'To Do', order:0 }, { id:'col-2', title:'Done', order:1 }],
      users: [{ id:'u1', name:'Alice' }, { id:'u2', name:'Bob' }],
      labels: [{ id:'l1', name:'Bug', color:'#f00' }],
      sprints: mockSprints,
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: null,
      sprintViewEnabled: false,
      boardName: 'Test Board',
    },
    dispatch: mockDispatch,
  }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

describe('sprint-view', () => {
  beforeEach(() => mockDispatch.mockClear())
  
  it('dispatches active sprint ID on mount, not first sprint ID', async () => {
    render(<SprintSelector />)
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_ACTIVE_SPRINT', sprintId: 's1' })
    })
    // Buggy: dispatches sprintId:'s0' (sprints[0]). Clean: dispatches sprintId:'s1' (active)
    const calls = mockDispatch.mock.calls.filter((c: any) => c[0].type === 'SET_ACTIVE_SPRINT')
    expect(calls.every((c: any) => c[0].sprintId !== 's0')).toBe(true)
  })
})
