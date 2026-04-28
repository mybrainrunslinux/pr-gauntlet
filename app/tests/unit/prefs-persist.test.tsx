/**
 * Issue #14: Preferences survive navigation
 * testFilter: prefs-persist
 *
 * Bug: AppProvider wraps AppContext.Provider with key={Date.now()}.
 * Every time AppProvider's parent re-renders, the key changes, which
 * forces React to unmount and remount the entire Provider subtree —
 * resetting all child state to its initial values.
 *
 * Test shape: Shape A
 * A small inline test-harness child (not code under test) holds local
 * useState. We render it inside the REAL AppProvider imported from source.
 * We force a re-render of AppProvider's parent wrapper and assert the
 * child's state is preserved. On v1-bugged this assertion fails because
 * the unstable key causes a remount.
 */

import React, { useState } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
// IMPORT real AppProvider — not mocked, not inlined
import { AppProvider } from '../../src/store/AppContext'

// ---------------------------------------------------------------------------
// Harness child — scaffolding only, NOT code under test.
// Holds a simple counter in local useState so we can observe remount resets.
// ---------------------------------------------------------------------------
function CounterChild() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button data-testid="inc" onClick={() => setCount(c => c + 1)}>
        +
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Parent wrapper — lets us force a re-render of AppProvider's parent.
// ---------------------------------------------------------------------------
function ParentWrapper() {
  const [tick, setTick] = useState(0)
  return (
    <div>
      <button data-testid="rerender" onClick={() => setTick(t => t + 1)}>
        rerender ({tick})
      </button>
      <AppProvider>
        <CounterChild />
      </AppProvider>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('prefs-persist — AppProvider key stability', () => {
  // Smoke 1: initial render shows initial state (count starts at 0)
  it('[smoke] child renders with initial state (count = 0)', () => {
    render(
      <AppProvider>
        <CounterChild />
      </AppProvider>
    )
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  // Smoke 2: child state mutates correctly when parent does NOT re-render
  it('[smoke] child state increments when parent is not re-rendered', () => {
    render(
      <AppProvider>
        <CounterChild />
      </AppProvider>
    )

    fireEvent.click(screen.getByTestId('inc'))
    expect(screen.getByTestId('count').textContent).toBe('1')

    fireEvent.click(screen.getByTestId('inc'))
    expect(screen.getByTestId('count').textContent).toBe('2')
  })

  // Bug test: child state MUST survive when AppProvider's parent re-renders.
  // On v1-bugged: key={Date.now()} changes each render → subtree remounts →
  // count resets to 0 → assertion fails.
  it('[bug] child state survives re-render of AppProvider parent (prefs-persist)', () => {
    render(<ParentWrapper />)

    // Increment the counter to 3
    fireEvent.click(screen.getByTestId('inc'))
    fireEvent.click(screen.getByTestId('inc'))
    fireEvent.click(screen.getByTestId('inc'))
    expect(screen.getByTestId('count').textContent).toBe('3')

    // Force AppProvider's parent to re-render (simulates navigation / context change)
    fireEvent.click(screen.getByTestId('rerender'))

    // State must be preserved — remounting would reset count to 0
    expect(screen.getByTestId('count').textContent).toBe('3')
  })
})
