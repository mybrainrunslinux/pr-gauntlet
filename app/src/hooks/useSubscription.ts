// src/hooks/useSubscription.ts
import { useEffect, useCallback, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

/**
 * Subscribe to eventBus topics with proper cleanup and stable handler reference
 * Fixes bugs #16-#20 by preventing handler accumulation and stale closures
 */
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Stable reference to prevent re-subscription on every render
  const handlerRef = useRef(handler)
  
  // Update ref on each render to capture latest closure
  handlerRef.current = handler
  
  // Stable wrapper that always calls the latest handler
  const stableHandler = useCallback((data: T) => {
    handlerRef.current(data)
  }, [])
  
  useEffect(() => {
    eventBus.subscribe(topic, stableHandler)
    
    // Critical: cleanup to prevent handler accumulation (fixes #19 memory leak)
    return () => {
      eventBus.unsubscribe(topic, stableHandler)
    }
  }, [topic, stableHandler]) // stableHandler never changes, prevents re-subscription
}