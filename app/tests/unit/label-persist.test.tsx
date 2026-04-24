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
      cards: [],
      columns: [],
      users: [],
      sprints: [],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: null,
      sprintViewEnabled: false,
      boardName: 'Board',
    },
    dispatch: vi.fn(),
  }),
}))

describe('label-persist', () => {
  it('toggling an already-selected label removes it (does not duplicate)', () => {
    const onChange = vi.fn()
    // 'l1' is pre-selected
    render(<LabelPicker selected={['l1']} onChange={onChange} />)
    
    // Click the already-selected label
    fireEvent.click(screen.getByTestId('label-option-l1'))
    
    // Buggy: includes(labelObject) always false → adds 'l1' again → onChange(['l1','l1'])
    // Clean: includes('l1') true → removes → onChange([])
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('toggling an unselected label adds it', () => {
    const onChange = vi.fn()
    // No labels pre-selected
    render(<LabelPicker selected={[]} onChange={onChange} />)
    
    // Click an unselected label
    fireEvent.click(screen.getByTestId('label-option-l1'))
    
    // Should add the label
    expect(onChange).toHaveBeenCalledWith(['l1'])
  })
})
