import { describe, it, expect, vi } from 'vitest'
import { reducer } from '../../src/store/reducer'
import type { AppState, Card } from '../../src/types'

describe('no-duplicates', () => {
  it('UPDATE_CARD replaces existing card, not appends', () => {
    // Create initial card
    const card: Card = {
      id: 'c1',
      title: 'Old Title',
      description: 'Old description',
      columnId: 'col-1',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'medium',
      sprintId: null,
      createdAt: '2026-01-01',
      order: 0
    }

    // Initial state with one card
    const initialState: AppState = {
      cards: [card],
      columns: [],
      users: [],
      labels: [],
      sprints: [],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: null,
      sprintViewEnabled: false,
      boardName: 'Test Board'
    }

    // Update the same card (same ID, different title)
    const updatedCard: Card = {
      ...card,
      title: 'New Title'
    }

    // Dispatch UPDATE_CARD action
    const newState = reducer(initialState, {
      type: 'UPDATE_CARD',
      card: updatedCard
    })

    // CRITICAL: Should still have exactly 1 card (replacement, not append)
    expect(newState.cards).toHaveLength(1)
    expect(newState.cards[0].title).toBe('New Title')
    expect(newState.cards[0].id).toBe('c1')
  })

  it('multiple UPDATE_CARD actions with same ID should not duplicate', () => {
    // Create initial card
    const card: Card = {
      id: 'c1',
      title: 'Original',
      description: '',
      columnId: 'col-1',
      assigneeId: null,
      labelIds: [],
      dueDate: null,
      priority: 'medium',
      sprintId: null,
      createdAt: '2026-01-01',
      order: 0
    }

    const initialState: AppState = {
      cards: [card],
      columns: [],
      users: [],
      labels: [],
      sprints: [],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: null,
      sprintViewEnabled: false,
      boardName: 'Test Board'
    }

    // Simulate WebSocket reconnect scenario: multiple updates to same card
    let state = initialState

    // First update (like from WebSocket reconnect sending all cards)
    state = reducer(state, {
      type: 'UPDATE_CARD',
      card: { ...card, title: 'First Update' }
    })

    // Second update (another reconnect event)
    state = reducer(state, {
      type: 'UPDATE_CARD',
      card: { ...card, title: 'Second Update' }
    })

    // Should still have exactly 1 card, not 3 cards
    expect(state.cards).toHaveLength(1)
    expect(state.cards[0].title).toBe('Second Update')
    expect(state.cards[0].id).toBe('c1')
  })
})
