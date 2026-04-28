import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { DndContext } from '@dnd-kit/core'
import type { Column as ColumnType, Card } from '../../src/types'

// ---------------------------------------------------------------------------
// Mock useAppContext so CardItem renders without needing a real AppProvider.
// AppContext has Bug #14 (key={Date.now()}) that remounts the entire subtree
// on every render — which would also reset Column's useMemo and hide Bug #2.
// By mocking the context directly we isolate Bug #2 cleanly.
// ---------------------------------------------------------------------------
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: { users: [], labels: [], cards: [], columns: [], sprints: [], currentUserId: 'u1', searchQuery: '', activeSprintId: null, sprintViewEnabled: false, boardName: 'Test' },
    dispatch: vi.fn(),
  }),
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Import Column AFTER the mock is registered
import { Column } from '../../src/features/board/Column'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COL: ColumnType = { id: 'col-1', title: 'In Progress', order: 1 }

function makeCard(id: string, order: number): Card {
  return {
    id,
    title: `Card ${id}`,
    description: '',
    columnId: COL.id,
    assigneeId: null,
    labelIds: [],
    dueDate: null,
    priority: 'medium',
    sprintId: null,
    createdAt: '2024-01-01T00:00:00Z',
    order,
  }
}

// Minimal wrapper — DndContext only (no AppProvider key-remount bug)
function DndWrapper({ children }: { children: React.ReactNode }) {
  return <DndContext>{children}</DndContext>
}

// ---------------------------------------------------------------------------
// column-badge: badge count must reflect the current cards prop after rerender
// ---------------------------------------------------------------------------

describe('column-badge', () => {
  it('column-badge shows initial card count', () => {
    const cards = [makeCard('c1', 0), makeCard('c2', 1), makeCard('c3', 2)]
    render(<Column column={COL} cards={cards} />, { wrapper: DndWrapper })
    expect(screen.getByTestId('badge-col-1').textContent).toBe('3')
  })

  it('column-badge updates after cards prop changes (bug: empty useMemo deps)', () => {
    // render() with { wrapper } mounts Column once inside a stable DndWrapper.
    // rerender() swaps props on the SAME mounted Column instance — useMemo with
    // empty deps [] returns stale initial value of 3 instead of recomputing to 2.
    const initialCards = [makeCard('c1', 0), makeCard('c2', 1), makeCard('c3', 2)]
    const { rerender } = render(<Column column={COL} cards={initialCards} />, { wrapper: DndWrapper })

    const fewerCards = [makeCard('c1', 0), makeCard('c2', 1)]
    rerender(<Column column={COL} cards={fewerCards} />)

    // Expected (correct): 2 — reflects fewerCards.length after prop change
    // Actual   (buggy):   3 — useMemo never recomputes, stale initial value
    expect(screen.getByTestId('badge-col-1').textContent).toBe('2')
  })

  it('column-badge updates when a card is added', () => {
    const initialCards = [makeCard('c1', 0), makeCard('c2', 1)]
    const { rerender } = render(<Column column={COL} cards={initialCards} />, { wrapper: DndWrapper })

    const moreCards = [makeCard('c1', 0), makeCard('c2', 1), makeCard('c3', 2)]
    rerender(<Column column={COL} cards={moreCards} />)

    // Expected: 3. Bug: badge stays at stale initial value of 2.
    expect(screen.getByTestId('badge-col-1').textContent).toBe('3')
  })

  it('column-badge shows zero when column is emptied', () => {
    const initialCards = [makeCard('c1', 0), makeCard('c2', 1), makeCard('c3', 2)]
    const { rerender } = render(<Column column={COL} cards={initialCards} />, { wrapper: DndWrapper })

    rerender(<Column column={COL} cards={[]} />)

    // Expected: 0. Bug: badge stays at stale initial value of 3.
    expect(screen.getByTestId('badge-col-1').textContent).toBe('0')
  })
})
