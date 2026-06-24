import { describe, it, expect } from 'vitest'
import { reducer } from '../../src/store/reducer'
import type { AppState } from '../../src/types'

describe('no-duplicates', () => {
  it('UPDATE_CARD replaces existing card, not appends', () => {
    const card = { id:'c1', title:'Old Title', description:'', columnId:'col-1',
      assigneeId:null, labelIds:[], dueDate:null, priority:'medium' as const,
      sprintId:null, createdAt:'2026-01-01', order:0 }
    const state = { cards:[card], columns:[], users:[], labels:[],
      sprints:[], currentUserId:'u1', searchQuery:'', activeSprintId:null,
      sprintViewEnabled:false, boardName:'Board' } as AppState
    const updated = { ...card, title:'New Title' }
    const next = reducer(state, { type:'UPDATE_CARD', card:updated })
    // Buggy: [...state.cards, action.card] → appends → length=2 → FAILS
    // Clean: map replace by id → length=1, title updated → PASSES
    expect(next.cards).toHaveLength(1)
    expect(next.cards[0].title).toBe('New Title')
  })
})
