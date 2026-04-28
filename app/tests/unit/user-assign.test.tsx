/**
 * Tests for issue #08: user-assign — AssigneePicker uses selectedIndex instead of value
 *
 * BUG (AssigneePicker.tsx line 16):
 *   onChange(state.users[e.target.selectedIndex - 1]?.id ?? null)
 *
 * The handler resolves the chosen user by DOM selectedIndex (position) rather
 * than by e.target.value (the option's value attribute, which holds the user id).
 *
 * Deterministic test strategy:
 *   state.users = [Carol(u3), Bob(u2), Alice(u1)]
 *   Rendered options:
 *     index 0 = Unassigned (value="")
 *     index 1 = Carol      (value="u3")
 *     index 2 = Bob        (value="u2")
 *     index 3 = Alice      (value="u1")
 *
 *   We force selectedIndex to a DIFFERENT value than what `value` implies,
 *   then fire a native DOM change event. The buggy handler reads selectedIndex;
 *   the correct handler reads e.target.value.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AssigneePicker } from '../../src/features/card/AssigneePicker'

// ---------------------------------------------------------------------------
// Context mock — scaffolding only; AssigneePicker is real source.
// Users are in reverse alphabetical state order to make index divergence clear.
// ---------------------------------------------------------------------------
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      users: [
        { id: 'u3', name: 'Carol' },   // state index 0, DOM index 1
        { id: 'u2', name: 'Bob' },     // state index 1, DOM index 2
        { id: 'u1', name: 'Alice' },   // state index 2, DOM index 3
      ],
    },
    dispatch: vi.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Helper: fire a change event where select.value and select.selectedIndex
// deliberately disagree — exposing the selectedIndex-vs-value bug.
// jsdom blocks property assignment via its proxy, so we set selectedIndex
// directly on the HTMLSelectElement instance before dispatching a native event.
// ---------------------------------------------------------------------------
function changeSelectWithIndexOverride(
  select: HTMLSelectElement,
  value: string,
  forcedSelectedIndex: number
): void {
  // Override selectedIndex on the instance so the handler reads our value
  Object.defineProperty(select, 'selectedIndex', {
    configurable: true,
    writable: true,
    value: forcedSelectedIndex,
  })

  // Set select.value via the prototype setter (bypasses jsdom proxy)
  const valuePropDescriptor = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'value'
  )
  if (valuePropDescriptor?.set) {
    valuePropDescriptor.set.call(select, value)
  } else {
    ;(select as any).value = value
  }

  // Dispatch native change event (React's synthetic handler fires via bubbling)
  select.dispatchEvent(new Event('change', { bubbles: true }))

  // Restore native selectedIndex descriptor
  const nativeDescriptor = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'selectedIndex'
  )
  if (nativeDescriptor) {
    Object.defineProperty(select, 'selectedIndex', nativeDescriptor)
  }
}

// ---------------------------------------------------------------------------
// Smoke tests — always PASS
// ---------------------------------------------------------------------------
describe('user-assign AssigneePicker smoke', () => {
  it('user-assign: renders the assignee select element', () => {
    render(<AssigneePicker value={null} onChange={vi.fn()} />)
    expect(screen.getByTestId('assignee-select')).toBeInTheDocument()
  })

  it('user-assign: shows Unassigned plus all users as options', () => {
    render(<AssigneePicker value={null} onChange={vi.fn()} />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4) // Unassigned + Carol + Bob + Alice
    expect(options[0]).toHaveTextContent('Unassigned')
    expect(options[1]).toHaveTextContent('Carol')
    expect(options[2]).toHaveTextContent('Bob')
    expect(options[3]).toHaveTextContent('Alice')
  })
})

// ---------------------------------------------------------------------------
// Bug tests — FAIL on bugged code, PASS after fix
// ---------------------------------------------------------------------------
describe('user-assign AssigneePicker assigns correct user by id', () => {
  /**
   * Scenario: option value="u1" (Alice) but selectedIndex=2 (Bob's slot)
   * BUG:  onChange(state.users[2-1].id) = state.users[1].id = "u2" (Bob)
   * FIX:  onChange(e.target.value)       = "u1" (Alice)
   */
  it('user-assign: onChange receives the selected option value not the index-based id', () => {
    const onChange = vi.fn()
    render(<AssigneePicker value={null} onChange={onChange} />)
    const select = screen.getByTestId('assignee-select') as HTMLSelectElement

    changeSelectWithIndexOverride(select, 'u1', 2)

    expect(onChange).toHaveBeenCalledWith('u1')
  })

  /**
   * Issue description scenario: "selecting Carol saves a different user"
   * option value="u3" (Carol) but selectedIndex=3 (Alice's slot)
   * BUG:  onChange(state.users[3-1].id) = state.users[2].id = "u1" (Alice)
   * FIX:  onChange(e.target.value)       = "u3" (Carol)
   */
  it('user-assign: selecting Carol returns Carols id not a different users id', () => {
    const onChange = vi.fn()
    render(<AssigneePicker value={null} onChange={onChange} />)
    const select = screen.getByTestId('assignee-select') as HTMLSelectElement

    changeSelectWithIndexOverride(select, 'u3', 3)

    expect(onChange).toHaveBeenCalledWith('u3')
  })

  /**
   * Unassigned selection should always yield null.
   * selectedIndex=0 → users[-1] = undefined → null (bug accidentally correct)
   */
  it('user-assign: selecting Unassigned calls onChange with null', () => {
    const onChange = vi.fn()
    render(<AssigneePicker value="u3" onChange={onChange} />)
    const select = screen.getByTestId('assignee-select') as HTMLSelectElement

    changeSelectWithIndexOverride(select, '', 0)

    expect(onChange).toHaveBeenCalledWith(null)
  })
})
