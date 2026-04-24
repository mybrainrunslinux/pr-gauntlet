import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AssigneePicker } from '../../src/features/card/AssigneePicker'

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      users: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }, { id: 'u3', name: 'Carol' }],
      cards: [], columns: [], labels: [], sprints: [],
      currentUserId: 'u1', searchQuery: '', activeSprintId: null,
      sprintViewEnabled: false, boardName: 'Board',
    },
    dispatch: vi.fn(),
  }),
}))

describe('user-assign', () => {
  it('onChange called with the selected option value (ID), not index-derived ID', () => {
    const onChange = vi.fn()
    render(<AssigneePicker value={null} onChange={onChange} />)
    const select = screen.getByTestId('assignee-select')
    // Simulate selecting Bob (u2) but with selectedIndex pointing to Carol (3)
    // This creates the critical mismatch between value and index
    Object.defineProperty(select, 'selectedIndex', { value: 3, writable: true })
    fireEvent.change(select, { target: { value: 'u2', selectedIndex: 3 } })
    // BUGGY: users[selectedIndex-1] = users[3-1] = users[2] = {id:'u3'} → onChange('u3')
    // CLEAN: e.target.value = 'u2' → onChange('u2')
    expect(onChange).toHaveBeenCalledWith('u2')
  })
})
