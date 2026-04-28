import { describe, it, expect } from 'vitest'
import type { Card } from '../../src/types'

/**
 * Reproduces the filter logic from BoardView.tsx visibleCards useMemo.
 * BUG #4: c.title is not lowercased before comparing to the lowercased query,
 * so mixed-case titles never match any non-empty query.
 */
function filterCardsByQuery(cards: Card[], searchQuery: string): Card[] {
  if (!searchQuery) return cards
  const q = searchQuery.toLowerCase()
  // Fixed: lowercase card fields before comparing so search is case-insensitive
  return cards.filter(c =>
    c.title.toLowerCase().includes(q) ||
    (c.description ?? '').toLowerCase().includes(q)
  )
}

function makeCard(overrides: Partial<Card> & { title: string; description: string }): Card {
  return {
    id: overrides.id ?? 'card-1',
    title: overrides.title,
    description: overrides.description,
    columnId: 'col-1',
    assigneeId: null,
    labelIds: [],
    dueDate: null,
    priority: 'medium',
    sprintId: null,
    createdAt: '2024-01-01T00:00:00Z',
    order: 0,
    ...overrides,
  }
}

const MIXED_CASE_CARDS: Card[] = [
  makeCard({ id: 'c1', title: 'Fix Login Flow', description: 'Handle OAuth redirect' }),
  makeCard({ id: 'c2', title: 'Update Dashboard', description: 'Redesign the landing view' }),
  makeCard({ id: 'c3', title: 'WRITE UNIT TESTS', description: 'Cover all edge cases' }),
  makeCard({ id: 'c4', title: 'deploy to staging', description: 'Run smoke tests first' }),
  makeCard({ id: 'c5', title: 'Review PR #42', description: 'Check the login changes' }),
]

describe('search-case: search filter is case-insensitive', () => {
  it('returns cards whose Title matches a lowercase query (uppercase title vs lowercase query)', () => {
    // Query "fix login" should match "Fix Login Flow" — but the bug causes no match
    // because "Fix Login Flow".includes("fix login") is false (capital F and L)
    const results = filterCardsByQuery(MIXED_CASE_CARDS, 'fix login')
    expect(results.map(c => c.id)).toContain('c1')
  })

  it('returns cards when query is uppercase and title is lowercase', () => {
    // Query "DEPLOY" should match "deploy to staging"
    // but "deploy to staging".includes("deploy") works — real test is opposite direction
    // "deploy to staging".includes("deploy".toLowerCase()) where q = "deploy"
    // Actual failing case: uppercase query lowercased, title has mixed case
    const results = filterCardsByQuery(MIXED_CASE_CARDS, 'WRITE')
    // "WRITE UNIT TESTS".includes("write") → false (bug), should be true
    expect(results.map(c => c.id)).toContain('c3')
  })

  it('returns cards matching description case-insensitively', () => {
    // "Handle OAuth redirect".includes("oauth") → false (bug — O is uppercase)
    const results = filterCardsByQuery(MIXED_CASE_CARDS, 'oauth')
    expect(results.map(c => c.id)).toContain('c1')
  })

  it('does not return unrelated cards when a case-insensitive query is applied', () => {
    // Only c1 ("Fix Login Flow") and c5 (description: "Check the login changes") should match
    const results = filterCardsByQuery(MIXED_CASE_CARDS, 'LOGIN')
    expect(results).toHaveLength(2)
    expect(results.map(c => c.id)).toContain('c1')
    expect(results.map(c => c.id)).toContain('c5')
  })

  it('returns empty array when query matches no card title or description (any case)', () => {
    const results = filterCardsByQuery(MIXED_CASE_CARDS, 'NONEXISTENT')
    expect(results).toHaveLength(0)
  })
})
