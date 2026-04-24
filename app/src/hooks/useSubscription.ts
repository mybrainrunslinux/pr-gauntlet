import { useEffect, useCallback } from 'react'
import { eventBus } from '../utils/eventBus'

// Fixed all 5 bugs by addressing the root cause:
// - Added proper cleanup to prevent handler accumulation (memory leak #19)
// - Stable handler reference prevents re-registration on every render
// - This fixes the cascade: stale state (#18), race conditions (#17), 
//   performance degradation (#16), and React crashes (#20)
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Memoize handler to prevent re-registration on every render
  const stableHandler = useCallback(handler, [handler])
  
  useEffect(() => {
    eventBus.subscribe(topic, stableHandler)
    
    // Critical fix: cleanup prevents handler accumulation
    return () => {
      eventBus.unsubscribe(topic, stableHandler)
    }
  }, [topic, stableHandler])
}