import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate } from '../../src/utils/storage'

// Required mocks for components (even though we're testing utils)
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
  let originalGetTimezoneOffset: () => number

  beforeEach(() => {
    originalGetTimezoneOffset = Date.prototype.getTimezoneOffset
  })

  afterEach(() => {
    Date.prototype.getTimezoneOffset = originalGetTimezoneOffset
  })

  it('does not shift date for UTC-offset users', () => {
    // Mock UTC-5 timezone (New York)
    Date.prototype.getTimezoneOffset = vi.fn(() => 300) // UTC-5 = +300 minutes

    const result = formatDate('2026-04-25')
    
    // Should display April 25, not April 24
    expect(result).toContain('25')
    expect(result).not.toContain('24')
    expect(result).toMatch(/Apr\s+25,\s+2026/)
  })

  it('works correctly for UTC users', () => {
    // Mock UTC timezone
    Date.prototype.getTimezoneOffset = vi.fn(() => 0) // UTC = 0 minutes

    const result = formatDate('2026-04-25')
    
    expect(result).toContain('25')
    expect(result).toMatch(/Apr\s+25,\s+2026/)
  })

  it('works correctly for users east of UTC', () => {
    // Mock UTC+3 timezone
    Date.prototype.getTimezoneOffset = vi.fn(() => -180) // UTC+3 = -180 minutes

    const result = formatDate('2026-04-25')
    
    expect(result).toContain('25')
    expect(result).toMatch(/Apr\s+25,\s+2026/)
  })

  it('works correctly for users far west of UTC', () => {
    // Mock UTC-12 timezone (extreme case)
    Date.prototype.getTimezoneOffset = vi.fn(() => 720) // UTC-12 = +720 minutes

    const result = formatDate('2026-04-25')
    
    // Should still display April 25, not April 24
    expect(result).toContain('25')
    expect(result).not.toContain('24')
    expect(result).toMatch(/Apr\s+25,\s+2026/)
  })

  it('handles null date input', () => {
    Date.prototype.getTimezoneOffset = vi.fn(() => 300) // UTC-5

    const result = formatDate(null)
    
    expect(result).toBe('')
  })

  it('handles empty string date input', () => {
    Date.prototype.getTimezoneOffset = vi.fn(() => 300) // UTC-5

    const result = formatDate('')
    
    expect(result).toBe('')
  })
})
