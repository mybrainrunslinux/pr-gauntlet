import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCardStats } from '../../src/hooks/useCardStats'
import type { Card, Column } from '../../src/types'

// Minimal column set matching real seed IDs
const COLUMNS: Column[] = [
  { id: 'col-backlog', title: 'Backlog',     order: 0 },
  { id: 'col-inprog',  title: 'In Progress', order: 1 },
  { id: 'col-done',    title: 'Done',        order: 3 },
]

function makeCard(id: string, columnId: string): Card {
  return {
    id,
    title: `Card ${id}`,
    description: '',
    columnId,
    assigneeId: null,
    labelIds: [],
    dueDate: null,
    priority: 'low',
    sprintId: null,
    createdAt: '2024-04-01',
    order: 0,
  }
}

// ---------------------------------------------------------------------------
// smoke test — hook is importable and returns a numeric pct
// ---------------------------------------------------------------------------
describe('completion-pct smoke', () => {
  it('useCardStats returns a numeric pct field', () => {
    const cards: Card[] = []
    const { result } = renderHook(() => useCardStats(cards, COLUMNS))
    expect(typeof result.current.pct).toBe('number')
  })
})

// ---------------------------------------------------------------------------
// bug test — pct must equal Math.round(done/total * 100)
// ---------------------------------------------------------------------------
describe('completion-pct', () => {
  it('calculates 40% when 2 of 5 cards are in the Done column', () => {
    // 2 done, 3 not done => expected 40%
    const cards: Card[] = [
      makeCard('c1', 'col-done'),
      makeCard('c2', 'col-done'),
      makeCard('c3', 'col-backlog'),
      makeCard('c4', 'col-backlog'),
      makeCard('c5', 'col-inprog'),
    ]
    const { result } = renderHook(() => useCardStats(cards, COLUMNS))
    expect(result.current.done).toBe(2)
    expect(result.current.total).toBe(5)
    expect(result.current.pct).toBe(40)
  })

  it('calculates 80% when 8 of 10 cards are in the Done column (issue example)', () => {
    const cards: Card[] = [
      makeCard('d1', 'col-done'),
      makeCard('d2', 'col-done'),
      makeCard('d3', 'col-done'),
      makeCard('d4', 'col-done'),
      makeCard('d5', 'col-done'),
      makeCard('d6', 'col-done'),
      makeCard('d7', 'col-done'),
      makeCard('d8', 'col-done'),
      makeCard('d9', 'col-backlog'),
      makeCard('d10', 'col-inprog'),
    ]
    const { result } = renderHook(() => useCardStats(cards, COLUMNS))
    expect(result.current.done).toBe(8)
    expect(result.current.total).toBe(10)
    expect(result.current.pct).toBe(80)
  })

  it('returns 0% when no cards are done', () => {
    const cards: Card[] = [
      makeCard('e1', 'col-backlog'),
      makeCard('e2', 'col-backlog'),
    ]
    const { result } = renderHook(() => useCardStats(cards, COLUMNS))
    expect(result.current.pct).toBe(0)
  })

  it('returns 100% when all cards are in the Done column', () => {
    const cards: Card[] = [
      makeCard('f1', 'col-done'),
      makeCard('f2', 'col-done'),
      makeCard('f3', 'col-done'),
    ]
    const { result } = renderHook(() => useCardStats(cards, COLUMNS))
    expect(result.current.pct).toBe(100)
  })

  it('returns 0% when the card list is empty (no division by zero)', () => {
    const { result } = renderHook(() => useCardStats([], COLUMNS))
    expect(result.current.pct).toBe(0)
  })
})
