// src/hooks/useSubscription.ts
import { useEffect, useRef } from 'react'
import { eventBus } from '../utils/eventBus'

export function useSubscription<T>(
  topic: string,
  handler: (data: T) => void
): void {
  // Keep a stable reference to the latest handler
  const handlerRef = useRef(handler)
  
  // Always update ref to latest handler (no re-renders triggered)
  handlerRef.current = handler
  
  // Create a stable wrapper function that never changes reference
  const stableHandlerRef = useRef<(data: T) => void>()
  if (!stableHandlerRef.current) {
    stableHandlerRef.current = (data: T) => {
      handlerRef.current(data)
    }
  }
  
  useEffect(() => {
    const stableHandler = stableHandlerRef.current!
    
    // Subscribe with truly stable handler reference
    eventBus.subscribe(topic, stableHandler)
    
    // Cleanup subscription on topic change or unmount
    return () => {
      eventBus.unsubscribe(topic, stableHandler)
    }
  }, [topic]) // Only depend on topic, never on handler
}