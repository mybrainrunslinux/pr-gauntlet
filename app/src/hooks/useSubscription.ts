// src/hooks/useSubscription.ts
import { useEffect, useCallback, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Stable reference to handler to prevent re-subscription on every render
  const handlerRef = useRef(handler)
  
  // Update ref when handler changes without triggering effect
  handlerRef.current = handler
  
  // Stable wrapper that always calls the latest handler
  const stableHandler = useCallback((data: T) => {
    handlerRef.current(data)
  }, [])
  
  useEffect(() => {
    // Subscribe with stable handler reference
    eventBus.subscribe(topic, stableHandler)
    
    // Critical: cleanup subscription to prevent memory leaks
    return () => {
      eventBus.unsubscribe(topic, stableHandler)
    }
  }, [topic, stableHandler]) // Only re-run when topic changes, not handler
}