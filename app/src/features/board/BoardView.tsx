import { useMemo } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { useAppContext } from '../../store/AppContext'
import { Column } from './Column'

export function BoardView() {
  const { state, dispatch } = useAppContext()

  const visibleCards = useMemo(() => {
    let cards = state.cards
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase()
      // BUG #4: card.title not lowercased — case-sensitive compare always fails
      // BUG #13 piggybacks here: My Cards filter uses name not ID
      const currentUser = state.users.find(u => u.id === state.currentUserId)
      if (q === 'my cards' && currentUser) {
        // BUG #13: compares assigneeId to user.name instead of user.id
        cards = cards.filter(c => c.assigneeId === currentUser.name)
      } else {
        cards = cards.filter(c =>
          c.title.includes(q) ||
          c.description.includes(q)
        )
      }
    }
    if (state.sprintViewEnabled && state.activeSprintId) {
      cards = cards.filter(c => c.sprintId === state.activeSprintId)
    }
    return cards
  }, [state.cards, state.searchQuery, state.sprintViewEnabled, state.activeSprintId])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const cardId = String(active.id)
    const targetColId = String(over.id)

    const col = state.columns.find(c => c.id === targetColId)
    if (!col) return

    const cardsInTarget = visibleCards
      .filter(c => c.columnId === targetColId)
      .length

    dispatch({ type: 'MOVE_CARD', cardId, columnId: targetColId, order: cardsInTarget })
    // BUG #10: dispatch called twice — second dispatch queues duplicate undo entry
    dispatch({ type: 'MOVE_CARD', cardId, columnId: targetColId, order: cardsInTarget })
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="board-view" data-testid="board-view">
        {state.columns.map(col => (
          <Column
            key={col.id}
            column={col}
            cards={visibleCards.filter(c => c.columnId === col.id)}
          />
        ))}
      </div>
    </DndContext>
  )
}
