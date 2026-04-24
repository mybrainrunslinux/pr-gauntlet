import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LabelPicker } from '../../src/features/card/LabelPicker'

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      labels: [{ id: 'l1', name: 'Bug', color: '#f00' }],
      cards: [], columns: [], users: [], sprints: [],
      currentUserId: 'u1', searchQuery: '', activeSprintId: null,
      sprintViewEnabled: false, boardName: 'Board',
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
