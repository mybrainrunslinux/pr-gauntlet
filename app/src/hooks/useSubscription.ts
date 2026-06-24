import { useEffect, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  const handlerRef = useRef<(data: T) => void>(handler)
  useEffect(() => { handlerRef.current = handler }, [handler])
  useEffect(() => {
    const stable = (data: T) => handlerRef.current(data)
    eventBus.subscribe(topic, stable)
    return () => eventBus.unsubscribe(topic, stable)
  }, [topic])
}
