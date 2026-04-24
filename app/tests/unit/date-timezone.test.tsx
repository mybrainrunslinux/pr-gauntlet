import { describe, it, expect, vi } from 'vitest'
import { formatDate } from '../../src/utils/storage'

// REQUIRED Mock patterns
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

  it('handles UTC users correctly', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => 0  // UTC
    
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('handles users east of UTC correctly', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => -60  // UTC+1
    
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('handles various western timezones', () => {
    const testCases = [
      { offset: 60, timezone: 'UTC-1' },    // UTC-1
      { offset: 480, timezone: 'UTC-8' },   // Pacific Time
      { offset: 720, timezone: 'UTC-12' },  // International Date Line West
    ]

    const origOffset = Date.prototype.getTimezoneOffset

    testCases.forEach(({ offset, timezone }) => {
      Date.prototype.getTimezoneOffset = () => offset
      
      try {
        const result = formatDate('2026-04-25')
        expect(result).toContain('25')
        expect(result).not.toContain('24')
      } finally {
        Date.prototype.getTimezoneOffset = origOffset
      }
    })
  })

  it('handles null date input', () => {
    const result = formatDate(null)
    expect(result).toBe('')
  })

  it('handles empty string input', () => {
    const result = formatDate('')
    expect(result).toBe('')
  })
})
