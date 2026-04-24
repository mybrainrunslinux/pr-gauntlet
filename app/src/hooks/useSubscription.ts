// src/hooks/useSubscription.ts
import { useEffect, useCallback, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Stabilize handler reference to prevent re-subscription on every render
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  // Create stable callback that always calls the latest handler
  const stableHandler = useCallback((data: T) => {
    handlerRef.current(data)
  }, [])

  useEffect(() => {
    // Subscribe with stable handler reference
    eventBus.subscribe(topic, stableHandler)
    
    // Critical: Return cleanup function to prevent handler accumulation
    return () => {
      eventBus.unsubscribe(topic, stableHandler)
    }
  }, [topic, stableHandler]) // Only re-run when topic changes, not handler
}