import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LabelPicker } from '../../src/features/card/LabelPicker'

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      labels: [
        { id: 'l1', name: 'Bug', color: '#f00' },
        { id: 'l2', name: 'Feature', color: '#0f0' }
      ],
      cards: [{ id: 'c1', title: 'Test Card', description: '', columnId: 'col-1', assigneeId: null,
                labelIds: [], dueDate: null, priority: 'medium', sprintId: null,
                createdAt: '2026-01-01', order: 0 }],
      columns: [{ id: 'col-1', title: 'To Do', order: 0 }],
      users: [{ id: 'u1', name: 'Alice' }],
      sprints: [{ id: 's1', name: 'Active Sprint', active: true }],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: 's1',
      sprintViewEnabled: false,
      boardName: 'Test Board',
    },
    dispatch: vi.fn(),
  }),
}))

describe('label-persist', () => {
  it('toggling an already-selected label removes it (does not duplicate)', () => {
    const onChange = vi.fn()
    // 'l1' is pre-selected
    render(<LabelPicker selected={['l1']} onChange={onChange} />)
    
    fireEvent.click(screen.getByTestId('label-option-l1'))
    
    // Buggy: includes(labelObject) always false → adds 'l1' again → onChange(['l1','l1'])
    // Clean: includes('l1') true → removes → onChange([])
    expect(onChange).toHaveBeenCalledWith([])
  })
})
