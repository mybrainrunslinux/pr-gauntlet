import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Column as ColumnType, Card } from '../../types'
import { CardItem } from './Card'

interface Props {
  column: ColumnType
  cards: Card[]
}

export function Column({ column, cards }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id })

  // useMemo with [cards] dep — recomputes on every cards change
  const count = useMemo(() => cards.length, [cards])

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => a.order - b.order),
    [cards]
  )

  return (
    <div className="column" ref={setNodeRef} data-testid={`column-${column.id}`}>
      <div className="column-header">
        <span className="column-title">{column.title}</span>
        <span className="column-badge" data-testid={`badge-${column.id}`}>{count}</span>
      </div>
      <SortableContext items={sortedCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="column-cards">
          {sortedCards.map(card => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
