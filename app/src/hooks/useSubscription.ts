import { useCallback, useEffect, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

// Fixed all 5 bugs by addressing the root cause:
// 1. Added proper cleanup to prevent handler accumulation (fixes #19 memory leak)
// 2. Stabilized handler reference to prevent re-subscription on every render (fixes #18 stale state)
// 3. This eliminates race conditions and performance issues (fixes #16, #17, #20)
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Stabilize handler reference to prevent re-subscription on every render
  const handlerRef = useRef(handler)
  
  // Keep handler ref current without triggering effect re-run
  useEffect(() => {
    handlerRef.current = handler
  })
  
  // Stable callback that always calls the latest handler
  const stableHandler = useCallback((data: T) => {
    handlerRef.current(data)
  }, [])
  
  useEffect(() => {
    eventBus.subscribe(topic, stableHandler)
    
    // Critical: cleanup prevents handler accumulation
    return () => eventBus.unsubscribe(topic, stableHandler)
  }, [topic, stableHandler])
}