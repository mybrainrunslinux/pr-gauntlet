import { useEffect, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const stableHandler = (data: T) => handlerRef.current(data)
    eventBus.subscribe(topic, stableHandler)
    return () => eventBus.unsubscribe(topic, stableHandler)
  }, [topic])
}
