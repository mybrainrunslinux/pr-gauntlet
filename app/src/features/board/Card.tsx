import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card } from '../../types'
import { useAppContext } from '../../store/AppContext'
import { DeleteDialog } from '../card/DeleteDialog'
import { CardEditModal } from '../card/CardEditModal'
import { formatDate } from '../../utils/storage'

interface Props {
  card: Card
}

export function CardItem({ card }: Props) {
  const { state, dispatch } = useAppContext()
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null) // FIXED: store Card object instead of id
  const [editing, setEditing] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const assignee = card.assigneeId ? state.users.find(u => u.id === card.assigneeId) : null
  const cardLabels = state.labels.filter(l => card.labelIds.includes(l.id))

  function handleDelete() {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_CARD', cardId: deleteTarget.id })
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`card ${card.priority}`}
        data-testid={`card-${card.id}`}
        {...attributes}
        {...listeners}
      >
        <div className="card-title">{card.title}</div>
        {cardLabels.length > 0 && (
          <div className="card-labels">
            {cardLabels.map(l => (
              <span key={l.id} className="label" style={{ backgroundColor: l.color }}>
                {l.name}
              </span>
            ))}
          </div>
        )}
        <div className="card-meta">
          {assignee && <span className="assignee">{assignee.name}</span>}
          {card.dueDate && (
            <span className="due-date">{formatDate(card.dueDate)}</span>
          )}
        </div>
        <div className="card-actions">
          <button
            className="btn-icon"
            onClick={e => { e.stopPropagation(); setEditing(true) }}
            aria-label="Edit card"
          >✏</button>
          <button
            className="btn-icon btn-delete"
            onClick={e => { e.stopPropagation(); setDeleteTarget(card) }}
            aria-label="Delete card"
            data-testid={`delete-btn-${card.id}`}
          >🗑</button>
        </div>
      </div>

      {deleteTarget && (
        <DeleteDialog
          card={deleteTarget} // FIXED: pass the card object directly
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {editing && (
        <CardEditModal card={card} onClose={() => setEditing(false)} />
      )}
    </>
  )
}