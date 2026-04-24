import type { AppState, AppAction, Card } from '../types'

function mergeById(existing: Card[], incoming: Card[]): Card[] {
  const map = new Map(existing.map(c => [c.id, c]))
  incoming.forEach(c => map.set(c.id, c))
  return Array.from(map.values())
}

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CARDS':
      return { ...state, cards: action.cards }
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.card] }
    case 'UPDATE_CARD':
      // Fixed: replace existing card by ID instead of appending
      return { 
        ...state, 
        cards: state.cards.map(c => c.id === action.card.id ? action.card : c) 
      }
    case 'DELETE_CARD':
      return { ...state, cards: state.cards.filter(c => c.id !== action.cardId) }
    case 'MOVE_CARD':
      return {
        ...state,
        cards: state.cards.map(c =>
          c.id === action.cardId ? { ...c, columnId: action.columnId, order: action.order } : c
        ),
      }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query }
    case 'SET_ACTIVE_SPRINT':
      return { ...state, activeSprintId: action.sprintId }
    case 'TOGGLE_SPRINT_VIEW':
      return { ...state, sprintViewEnabled: action.enabled }
    case 'SET_BOARD_NAME':
      return { ...state, boardName: action.name }
    case 'MERGE_CARDS':
      return { ...state, cards: mergeById(state.cards, action.cards) }
    default:
      return state
  }
}