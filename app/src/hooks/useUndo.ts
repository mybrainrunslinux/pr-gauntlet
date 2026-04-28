import { useState, useCallback } from 'react'

export function useUndo<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([])
  const [current, setCurrent] = useState<T>(initialState)
  const [future, setFuture] = useState<T[]>([])

  const push = useCallback((newState: T) => {
    if (JSON.stringify(newState) === JSON.stringify(current)) return
    setHistory(prev => [...prev, current])
    setCurrent(newState)
    setFuture([])
  }, [current])

  const undo = useCallback(() => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setFuture(f => [current, ...f])
    setCurrent(prev)
  }, [history, current])

  const redo = useCallback(() => {
    if (future.length === 0) return
    const next = future[0]
    setFuture(f => f.slice(1))
    setHistory(h => [...h, current])
    setCurrent(next)
  }, [future, current])

  return { current, push, undo, redo, canUndo: history.length > 0, canRedo: future.length > 0 }
}
