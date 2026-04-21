import type { Card } from '../../types'

interface Props {
  card: Card
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteDialog({ card, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-backdrop" data-testid="delete-dialog">
      <div className="modal dialog">
        <h2>Delete card?</h2>
        <p data-testid="delete-dialog-title">
          Are you sure you want to delete &ldquo;{card.title}&rdquo;?
        </p>
        <div className="dialog-actions">
          <button className="btn btn-danger" onClick={onConfirm} data-testid="confirm-delete">
            Delete
          </button>
          <button className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
