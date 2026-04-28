/**
 * issue-05: board name special character handling
 *
 * Bug location: src/App.tsx line 14
 *   const name = e.currentTarget.innerHTML ?? ''
 * Problem: innerHTML returns HTML-escaped text, e.g. "R&amp;D Projects" instead
 * of "R&D Projects". This escaped value is dispatched as the board name and
 * re-rendered, causing the header to display "R&amp;D Projects".
 *
 * Fix: use innerText or textContent instead of innerHTML.
 *
 * Test strategy:
 *   - Mocks AppContext to provide a controlled dispatch spy (avoids BUG #14's
 *     key={Date.now()} infinite re-render loop in jsdom) and stable state.
 *   - Mocks useWebSocket to prevent jsdom WebSocket connection hangs.
 *   - Renders the real App component, exercises the real handleNameEdit handler.
 *   - Asserts that SET_BOARD_NAME is dispatched with the unescaped string.
 *
 * Import lines prove no inline copies:
 *   import App from '../../src/App'
 *   vi.mock('../../src/store/AppContext', ...)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import App from '../../src/App'

// Track dispatched actions across tests
const dispatchSpy = vi.fn()

// Replace AppContext with a stable mock that:
//   1. Provides a fixed boardName in state (no reducer loops)
//   2. Records dispatched actions so we can assert what handleNameEdit sends
//   3. Avoids BUG #14's key={Date.now()} infinite re-render
vi.mock('../../src/store/AppContext', () => {
  const mockState = {
    cards: [],
    columns: [],
    users: [],
    labels: [],
    sprints: [],
    currentUserId: 'u1',
    searchQuery: '',
    activeSprintId: null,
    sprintViewEnabled: false,
    boardName: 'My Board',
  }

  return {
    AppProvider: ({ children }: { children: import('react').ReactNode }) => children,
    useAppContext: () => ({
      state: mockState,
      dispatch: dispatchSpy,
    }),
  }
})

// Mock useWebSocket to prevent jsdom WebSocket connection hang
vi.mock('../../src/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(),
}))

beforeEach(() => {
  dispatchSpy.mockClear()
})

describe('board-name special character handling', () => {
  it('board-name: ampersand in board name dispatches unescaped text', () => {
    render(<App />)

    const heading = screen.getByTestId('board-name') as HTMLHeadingElement

    // Simulate what the browser does when a user types "R&D Projects" in a
    // contenteditable: the browser stores & as &amp; in innerHTML.
    // When handleNameEdit reads innerHTML on blur, it gets "R&amp;D Projects".
    heading.innerHTML = 'R&amp;D Projects'

    act(() => {
      fireEvent.blur(heading)
    })

    // The dispatch should be called with the real string the user typed,
    // NOT the HTML-escaped version.
    // Bug: handleNameEdit reads innerHTML so it dispatches "R&amp;D Projects"
    // Fix: should dispatch "R&D Projects" (using innerText/textContent)
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'SET_BOARD_NAME',
      name: 'R&D Projects',  // unescaped — what the user actually typed
    })
  })

  it('board-name: angle brackets in board name dispatch unescaped text', () => {
    render(<App />)

    const heading = screen.getByTestId('board-name') as HTMLHeadingElement

    // Browser encodes < as &lt; and > as &gt; in innerHTML of a contenteditable
    heading.innerHTML = '&lt;backend&gt;'

    act(() => {
      fireEvent.blur(heading)
    })

    // Bug: dispatches "&lt;backend&gt;" (the innerHTML-escaped form)
    // Fix: should dispatch "<backend>" (using innerText/textContent)
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'SET_BOARD_NAME',
      name: '<backend>',  // unescaped — what the user actually typed
    })
  })

  it('board-name: plain names without special chars are dispatched unchanged', () => {
    render(<App />)

    const heading = screen.getByTestId('board-name') as HTMLHeadingElement

    heading.innerHTML = 'My Board'

    act(() => {
      fireEvent.blur(heading)
    })

    // Plain text: innerHTML and textContent are identical — no escaping occurs
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'SET_BOARD_NAME',
      name: 'My Board',
    })
  })
})
