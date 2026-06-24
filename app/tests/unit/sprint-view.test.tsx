/**
 * Issue #7 — Sprint view shows wrong (first) sprint on initial load
 *
 * testFilter: sprint-view
 *
 * Root cause: SprintSelector initialises its local state AND dispatches
 * SET_ACTIVE_SPRINT with sprints[0] (the *first* sprint, which is
 * inactive/completed) instead of the sprint whose `active` flag is true.
 *
 * File:  src/features/filters/SprintSelector.tsx  lines 8 and 13-14
 *
 * Reproduction sequence from the issue:
 *   1. Two sprints: Sprint 1 (active:false, index 0), Sprint 2 (active:true, index 1)
 *   2. SprintSelector mounts → useEffect dispatches SET_ACTIVE_SPRINT('s1')
 *   3. User toggles "Sprint View" on
 *   4. BoardView.visibleCards filters by activeSprintId === 's1'
 *   5. Sprint 1 cards shown — wrong; Sprint 2 cards should be shown
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React, { useEffect } from 'react'

// ── Real source imports (rule: no inline copies) ──────────────────────────────
import { SprintSelector } from '../../src/features/filters/SprintSelector'
import { AppProvider, useAppContext } from '../../src/store/AppContext'

// ── Test spy component ────────────────────────────────────────────────────────
// Reads activeSprintId from the real store after SprintSelector mounts.
// This lets us assert the dispatch result without rendering BoardView (which
// drags in @dnd-kit and requires pointer-event APIs jsdom does not have).
function ActiveSprintReadout() {
  const { state } = useAppContext()
  return (
    <div data-testid="active-sprint-id">
      {state.activeSprintId ?? 'null'}
    </div>
  )
}

// Renders SprintSelector and the readout inside the real AppProvider.
// AppProvider seeds from data/seed.ts which has:
//   sprints[0] = { id: 's1', name: 'Sprint 1', active: false }
//   sprints[1] = { id: 's2', name: 'Sprint 2', active: true  }
// That is exactly the failing scenario described in the issue.
function TestHarness() {
  return (
    <AppProvider>
      <SprintSelector />
      <ActiveSprintReadout />
    </AppProvider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sprint-view', () => {
  it('sprint-view: on mount, SprintSelector sets activeSprintId to the sprint with active:true (not sprints[0])', () => {
    render(<TestHarness />)

    // After mounting, the SprintSelector useEffect should have dispatched
    // SET_ACTIVE_SPRINT with the ACTIVE sprint id ('s2'), not the first
    // sprint in the array ('s1').
    //
    // BUG: useEffect uses `sprints[0]` (index 0 = 's1', inactive), so the
    // store ends up with activeSprintId === 's1' instead of 's2'.
    const readout = screen.getByTestId('active-sprint-id')
    expect(readout.textContent).toBe('s2')
  })

  it('sprint-view: sprint selector dropdown value reflects the ACTIVE sprint after mount', () => {
    render(<TestHarness />)

    // Enable sprint view so the <select> is rendered
    const toggle = screen.getByTestId('sprint-view-toggle')
    fireEvent.click(toggle)

    const selector = screen.getByTestId('sprint-selector') as HTMLSelectElement

    // The dropdown value must match the active sprint (s2), not the first sprint (s1).
    // BUG: activeSprintId is set to 's1', so the dropdown shows Sprint 1 as selected.
    expect(selector.value).toBe('s2')
  })
})
