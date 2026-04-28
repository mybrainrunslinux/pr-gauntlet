/**
 * Issue #10 — Undo reverts one operation only
 *
 * Root cause: BoardView.tsx lines 46-48 calls dispatch({ type: 'MOVE_CARD', ... })
 * twice for a single drag event, which causes the undo stack to receive two entries
 * for one user action.  A single Ctrl+Z then undoes TWO operations instead of one.
 *
 * Test strategy: exercise the real useUndo hook.  Simulate the double-dispatch by
 * calling push() twice in sequence (exactly what the buggy handleDragEnd does).
 * Assert that the history stack contains exactly ONE entry — the expected behaviour.
 * On the buggy code the stack contains TWO entries, so the assertion fails.
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndo } from '../../src/hooks/useUndo'
import type { AppState } from '../../src/types'

// ---------------------------------------------------------------------------
// Minimal state fixtures
// ---------------------------------------------------------------------------
const STATE_A: AppState = {
  cards: [
    {
      id: 'c1',
      title: 'Card 1',
      description: '',
      columnId: 'col-todo',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'low',
      sprintId: null,
      createdAt: '2024-01-01',
      order: 0,
    },
  ],
  columns: [
    { id: 'col-todo', title: 'To Do', order: 0 },
    { id: 'col-done', title: 'Done', order: 1 },
  ],
  users: [],
  labels: [],
  sprints: [],
  currentUserId: 'u1',
  searchQuery: '',
  activeSprintId: null,
  sprintViewEnabled: false,
  boardName: 'Test Board',
}

// State after card c1 moved to col-done
const STATE_B: AppState = {
  ...STATE_A,
  cards: [{ ...STATE_A.cards[0], columnId: 'col-done', order: 0 }],
}

// ---------------------------------------------------------------------------
// Smoke — hook is importable and initialises with an empty history
// ---------------------------------------------------------------------------
describe('undo-single smoke', () => {
  it('undo-single: useUndo initialises with empty history and canUndo=false', () => {
    const { result } = renderHook(() => useUndo<AppState>(STATE_A))
    expect(result.current.current).toEqual(STATE_A)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Bug tests — double-push produces two history entries; undo only partially reverts
// ---------------------------------------------------------------------------
describe('undo-single', () => {
  it('undo-single: a single drag action pushes exactly ONE entry onto the history stack', () => {
    /**
     * The buggy BoardView.tsx calls dispatch twice for one drag.
     * We model that here by calling push() twice with the same payload.
     * Expected (after fix): history.length === 1
     * Actual (bugged code simulation): history.length === 2
     *
     * The assertion below verifies the CORRECT behaviour — it will FAIL
     * when the hook is driven with two pushes (as the bug produces).
     */
    const { result } = renderHook(() => useUndo<AppState>(STATE_A))

    act(() => {
      // First dispatch (legitimate)
      result.current.push(STATE_B)
    })
    act(() => {
      // Second dispatch — duplicate from BUG #10 in BoardView.tsx:47-48
      result.current.push(STATE_B)
    })

    // After ONE user action, history should have exactly 1 entry.
    // On the buggy code, history has 2 entries — this assertion fails.
    // Note: the 'history' array is internal; we infer its length via canUndo
    // and by counting undo steps needed to return to STATE_A.
    expect(result.current.current).toEqual(STATE_B)

    // Perform one undo — should fully restore STATE_A
    act(() => {
      result.current.undo()
    })

    // After a single undo following a single action, state must be STATE_A again.
    // BUG: because push() was called twice, one undo only reaches STATE_B (the
    // intermediate duplicate entry), NOT STATE_A.  This assertion exposes the bug.
    expect(result.current.current).toEqual(STATE_A)
  })

  it('undo-single: canUndo is false after undoing a single drag action', () => {
    /**
     * After one action and one undo, the history stack should be empty (canUndo=false).
     * With the double-dispatch bug, one undo leaves a residual entry (canUndo=true).
     */
    const { result } = renderHook(() => useUndo<AppState>(STATE_A))

    act(() => {
      result.current.push(STATE_B)
    })
    act(() => {
      // Second duplicate push — BUG #10
      result.current.push(STATE_B)
    })
    act(() => {
      result.current.undo()
    })

    // With the fix in place: history is empty, canUndo is false.
    // With the bug: one entry remains, canUndo is still true.
    expect(result.current.canUndo).toBe(false)
  })

  it('undo-single: redo is available after undo of a single drag (no phantom second redo)', () => {
    /**
     * After one action -> one undo, exactly one redo step should be available,
     * and performing it should return to STATE_B.  With the double-push bug, two
     * redo entries accumulate, causing redo to re-apply an extra duplicate step.
     */
    const { result } = renderHook(() => useUndo<AppState>(STATE_A))

    act(() => { result.current.push(STATE_B) })
    act(() => { result.current.undo() })

    expect(result.current.canRedo).toBe(true)
    act(() => { result.current.redo() })
    expect(result.current.current).toEqual(STATE_B)
    // Only ONE redo was available — canRedo is now false
    expect(result.current.canRedo).toBe(false)
  })
})
