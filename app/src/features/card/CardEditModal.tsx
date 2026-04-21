import { useState } from 'react'
import type { Card } from '../../types'
import { useAppContext } from '../../store/AppContext'
import { LabelPicker } from './LabelPicker'
import { AssigneePicker } from './AssigneePicker'

interface Props {
  card: Card
  onClose: () => void
}

export function CardEditModal({ card, onClose }: Props) {
  const { dispatch } = useAppContext()
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [dueDate, setDueDate] = useState(card.dueDate ?? '')
  const [priority, setPriority] = useState(card.priority)
  const [assigneeId, setAssigneeId] = useState(card.assigneeId)
  const [labelIds, setLabelIds] = useState(card.labelIds)

  function handleSave() {
    const updated: Card = {
      ...card,
      title,
      description,
      dueDate: dueDate || null,
      priority,
      assigneeId,
      labelIds,
    }
    dispatch({ type: 'UPDATE_CARD', card: updated })
    onClose()
  }

  return (
    <div className="modal-backdrop" data-testid="card-edit-modal">
      <div className="modal card-modal">
        <div className="modal-header">
          <h2>Edit Card</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <label>
            Title
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              data-testid="card-title-input"
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <label>
            Due Date
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              data-testid="due-date-input"
            />
          </label>
          <label>
            Priority
            <select value={priority} onChange={e => setPriority(e.target.value as Card['priority'])}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <AssigneePicker value={assigneeId} onChange={setAssigneeId} />
          <LabelPicker selected={labelIds} onChange={setLabelIds} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave} data-testid="save-card">Save</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
