import { useCallback, useEffect, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

/**
 * Subscribe to eventBus topics with automatic cleanup and stable references.
 * Fixes memory leaks and prevents stale closures in WebSocket handlers.
 */
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Stable reference to handler to prevent re-registration on every render
  const handlerRef = useRef(handler)
  
  // Update ref on each render to capture latest closure values
  handlerRef.current = handler
  
  // Stable wrapper that always calls the latest handler
  const stableHandler = useCallback((data: T) => {
    handlerRef.current(data)
  }, [])
  
  useEffect(() => {
    eventBus.subscribe(topic, stableHandler)
    
    // Critical cleanup: remove handler to prevent memory leaks
    return () => {
      eventBus.unsubscribe(topic, stableHandler)
    }
  }, [topic, stableHandler]) // stableHandler never changes, prevents re-registration
}