import { useEffect, useCallback, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

// Fixed: Root cause of bugs #16-20 was missing cleanup and handler re-registration
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Stable handler reference to prevent re-subscription on every render
  const handlerRef = useRef(handler)
  
  // Keep handler ref current
  useEffect(() => {
    handlerRef.current = handler
  })
  
  // Stable wrapper that calls the current handler
  const stableHandler = useCallback((data: T) => {
    handlerRef.current(data)
  }, [])
  
  useEffect(() => {
    eventBus.subscribe(topic, stableHandler)
    
    // Critical: cleanup prevents handler accumulation (fixes #19 memory leak)
    return () => {
      eventBus.unsubscribe(topic, stableHandler)
    }
  }, [topic, stableHandler]) // stableHandler never changes, prevents re-subscription
}