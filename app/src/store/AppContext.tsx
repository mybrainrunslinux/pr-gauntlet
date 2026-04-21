import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { AppState, AppAction } from '../types'
import { reducer } from './reducer'
import { CARDS, COLUMNS, USERS, LABELS, SPRINTS } from '../data/seed'

const initialState: AppState = {
  cards: CARDS,
  columns: COLUMNS,
  users: USERS,
  labels: LABELS,
  sprints: SPRINTS,
  currentUserId: 'u1',
  searchQuery: '',
  activeSprintId: null,
  sprintViewEnabled: false,
  boardName: 'My Board',
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be inside AppProvider')
  return ctx
}
