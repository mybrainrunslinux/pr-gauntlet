import { describe, it, expect, vi } from 'vitest'
import { formatDate } from '../../src/utils/storage'

// Mock required modules
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'Test Card', description:'', columnId:'col-1', assigneeId:null,
                 labelIds:[], dueDate:'2026-04-25', priority:'medium', sprintId:null,
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

describe('date-timezone', () => {
  it('does not shift date for UTC-offset users', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => 300  // UTC-5 (New York)
    
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')        // must show April 25
      expect(result).not.toContain('24')    // NOT April 24
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('handles UTC+0 correctly', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => 0  // UTC+0
    
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('handles UTC+8 correctly', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => -480  // UTC+8
    
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('handles null date', () => {
    const result = formatDate(null)
    expect(result).toBe('')
  })

  it('handles empty string date', () => {
    const result = formatDate('')
    expect(result).toBe('')
  })

  it('formats date correctly for various months', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => 300  // UTC-5
    
    try {
      expect(formatDate('2026-01-15')).toMatch(/Jan.*15.*2026/)
      expect(formatDate('2026-12-31')).toMatch(/Dec.*31.*2026/)
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })
})
