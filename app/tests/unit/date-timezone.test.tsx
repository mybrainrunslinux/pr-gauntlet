import { describe, it, expect, vi } from 'vitest'
import { formatDate } from '../../src/utils/storage'

// ALWAYS mock useAppContext — components throw without it:
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'T', description:'', columnId:'col-1', assigneeId:null,
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

// ALWAYS mock dnd-kit:
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

describe('date-timezone', () => {
  it('does not shift date for UTC-offset users', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    // Mock UTC-5 timezone (New York)
    Date.prototype.getTimezoneOffset = () => 300  // UTC-5
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')        // must show April 25
      expect(result).not.toContain('24')    // NOT April 24
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('displays correct date for UTC+0 users', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    // Mock UTC timezone
    Date.prototype.getTimezoneOffset = () => 0  // UTC+0
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')        // should show April 25
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('displays correct date for UTC+ users', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    // Mock UTC+9 timezone (Tokyo)
    Date.prototype.getTimezoneOffset = () => -540  // UTC+9
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')        // should show April 25
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('handles null date input', () => {
    const result = formatDate(null)
    expect(result).toBe('')
  })

  it('handles empty string date input', () => {
    const result = formatDate('')
    expect(result).toBe('')
  })

  it('formats date in expected US format', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => 0  // UTC+0
    try {
      const result = formatDate('2026-12-31')
      expect(result).toMatch(/Dec 31, 2026/)
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })
})
