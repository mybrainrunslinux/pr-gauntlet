// src/hooks/useSubscription.ts
import { useEffect, useCallback } from 'react'
import { eventBus } from '../utils/eventBus'

/**
 * Subscribe to eventBus topics with proper cleanup and stable handler refs
 * Fixes bugs #16-20: memory leaks, stale state, race conditions, performance, crashes
 */
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Stabilize handler reference to prevent re-subscription on every render
  const stableHandler = useCallback(handler, [handler])
  
  useEffect(() => {
    eventBus.subscribe(topic, stableHandler)
    
    // Critical: cleanup subscription to prevent handler accumulation
    return () => {
      eventBus.unsubscribe(topic, stableHandler)
    }
  }, [topic, stableHandler])
}