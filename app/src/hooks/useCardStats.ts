// src/hooks/useCardStats.ts
import { useMemo } from 'react'
import { useSubscription } from './useSubscription'
import { eventBus } from '../utils/eventBus'
import type { Card, Column } from '../types'

export function useCardStats(cards: Card[], columns: Column[]) {
  const stats = useMemo(() => {
    const doneCol = columns.find(c => c.title === 'Done') // Fixed: look for column with title 'Done'
    const doneCards = doneCol ? cards.filter(c => c.columnId === doneCol.id) : []
    const total = cards.length
    const done = doneCards.length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    const byColumn = Object.fromEntries(
      columns.map(col => [col.id, cards.filter(c => c.columnId === col.id).length])
    )
    return { done, total, pct, byColumn }
  }, [cards, columns])

  // Demonstrate useSubscription usage for card:update events
  useSubscription<Card>('card:update', (_card) => {
    // Stats recompute automatically via cards prop change in parent
    eventBus.emit('stats:recomputed', stats)
  })

  return stats
}