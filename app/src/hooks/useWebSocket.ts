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
              eventBus.emit('ws:card-update', msg.card)
              onCardUpdateRef.current(msg.card)
            }
            // BUG #15: on reconnect, re-fetches all cards and appends (creates duplicates)
            if (msg.type === 'connected' && msg.cards) {
              msg.cards.forEach((c: import('../types').Card) => onCardUpdateRef.current(c))
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
