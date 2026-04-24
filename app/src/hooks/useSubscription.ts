// src/hooks/useSubscription.ts
import { useEffect, useCallback } from 'react'
import { eventBus } from '../utils/eventBus'

/**
 * Subscribe to eventBus topics with proper cleanup and stable handler references.
 * Fixes memory leaks, stale closures, and performance issues in WebSocket event handling.
 */
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Memoize handler to prevent re-subscription on every render
  // This fixes the stale closure issue (#18) and prevents excessive re-registrations (#16)
  const stableHandler = useCallback(handler, [handler])
  
  useEffect(() => {
    eventBus.subscribe(topic, stableHandler)
    
    // Critical: Return cleanup function to prevent handler accumulation
    // This fixes the memory leak (#19) and cascade effects (#16, #17, #20)
    return () => {
      eventBus.unsubscribe(topic, stableHandler)
    }
  }, [topic, stableHandler]) // Use stableHandler instead of raw handler
}