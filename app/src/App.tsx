import { useEffect, useCallback } from 'react'
import { AppProvider, useAppContext } from './store/AppContext'
import { BoardView } from './features/board/BoardView'
import { SearchBar } from './features/filters/SearchBar'
import { SprintSelector } from './features/filters/SprintSelector'
import { BoardStats } from './features/stats/BoardStats'
import { useWebSocket } from './hooks/useWebSocket'
import type { Card } from './types'

function BoardHeader() {
  const { state, dispatch } = useAppContext()

  function handleNameEdit(e: React.FocusEvent<HTMLHeadingElement>) {
    const name = e.currentTarget.textContent ?? ''
    dispatch({ type: 'SET_BOARD_NAME', name })
    // Correctly use textContent not innerHTML
    e.currentTarget.textContent = name
  }

  return (
    <header className="board-header">
      <h1
        contentEditable
        suppressContentEditableWarning
        onBlur={handleNameEdit}
        data-testid="board-name"
      >
        {state.boardName}
      </h1>
      <div className="header-controls">
        <SearchBar />
        <SprintSelector />
        <BoardStats />
      </div>
    </header>
  )
}

function AppInner() {
  const { dispatch } = useAppContext()

  const handleCardUpdate = useCallback((card: Card) => {
    dispatch({ type: 'UPDATE_CARD', card })
  }, [dispatch])

  useWebSocket(handleCardUpdate)

  // Keyboard shortcut: N = new card (stable empty deps — added once)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        // Undo handled by BoardView
        document.dispatchEvent(new CustomEvent('taskflow:undo'))
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="app">
      <BoardHeader />
      <BoardView />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
