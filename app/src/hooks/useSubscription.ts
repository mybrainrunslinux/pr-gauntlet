import { useEffect } from 'react'
import { eventBus } from '../utils/eventBus'

// BUG #19 (root of chain 16–20):
// 1. No cleanup return — handlers accumulate every call (memory leak)
// 2. handler is a new ref each render — re-registers on every render
// This single bug causes: #19 heap growth, #18 stale state, #17 race, #16 perf, #20 crash
export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  useEffect(() => {
    eventBus.subscribe(topic, handler)
    // MISSING: return () => eventBus.unsubscribe(topic, handler)
  }, [topic, handler])
}
