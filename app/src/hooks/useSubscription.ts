import { useEffect, useCallback, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Stabilize handler reference to prevent re-registering on every render
  const stableHandler = useCallback(handler, [handler])
  
  // Track if subscription is active to prevent double cleanup
  const subscriptionRef = useRef<boolean>(false)

  useEffect(() => {
    // Only subscribe if not already subscribed
    if (!subscriptionRef.current) {
      eventBus.subscribe(topic, stableHandler)
      subscriptionRef.current = true
    }

    // Cleanup: unsubscribe when topic changes or component unmounts
    return () => {
      if (subscriptionRef.current) {
        eventBus.unsubscribe(topic, stableHandler)
        subscriptionRef.current = false
      }
    }
  }, [topic, stableHandler])

  // Cleanup on unmount (defensive)
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        eventBus.unsubscribe(topic, stableHandler)
        subscriptionRef.current = false
      }
    }
  }, [])
}