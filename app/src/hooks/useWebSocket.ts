import { useEffect, useRef } from 'react'
import { eventBus } from '../utils/eventBus'
import type { Card } from '../types'

export function useWebSocket(onCardUpdate: (card: Card) => void) {
  const onCardUpdateRef = useRef(onCardUpdate)
  onCardUpdateRef.current = onCardUpdate

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout>

    function connect() {
      try {
        ws = new WebSocket('ws://localhost:3001/ws')

        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data)
            if (msg.type === 'card:update') {
              // Emit to eventBus so useSubscription hooks pick it up
              eventBus.emit('ws:card-update', msg.card)
              onCardUpdateRef.current(msg.card)
            }
          } catch {
            // ignore malformed
          }
        }

        ws.onclose = () => {
          reconnectTimer = setTimeout(connect, 3000)
        }
      } catch {
        reconnectTimer = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [])
}
