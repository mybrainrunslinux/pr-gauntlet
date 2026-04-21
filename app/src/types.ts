export interface User {
  id: string
  name: string
  avatar?: string
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface Sprint {
  id: string
  name: string
  active: boolean
  startDate?: string
  endDate?: string
}

export interface Card {
  id: string
  title: string
  description: string
  columnId: string
  assigneeId: string | null
  labelIds: string[]
  dueDate: string | null
  priority: 'low' | 'medium' | 'high'
  sprintId: string | null
  createdAt: string
  order: number
}

export interface Column {
  id: string
  title: string
  order: number
}

export interface AppState {
  cards: Card[]
  columns: Column[]
  users: User[]
  labels: Label[]
  sprints: Sprint[]
  currentUserId: string
  searchQuery: string
  activeSprintId: string | null
  sprintViewEnabled: boolean
  boardName: string
}

export type AppAction =
  | { type: 'SET_CARDS'; cards: Card[] }
  | { type: 'ADD_CARD'; card: Card }
  | { type: 'UPDATE_CARD'; card: Card }
  | { type: 'DELETE_CARD'; cardId: string }
  | { type: 'MOVE_CARD'; cardId: string; columnId: string; order: number }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_ACTIVE_SPRINT'; sprintId: string | null }
  | { type: 'TOGGLE_SPRINT_VIEW'; enabled: boolean }
  | { type: 'SET_BOARD_NAME'; name: string }
  | { type: 'MERGE_CARDS'; cards: Card[] }
