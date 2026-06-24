// src/features/card/LabelPicker.tsx
import { useAppContext } from '../../store/AppContext'

interface Props {
  selected: string[]
  onChange: (ids: string[]) => void
}

export function LabelPicker({ selected, onChange }: Props) {
  const { state } = useAppContext()

  function toggle(labelId: string) {
    // BUG #6: passes label object to includes() — object ref never matches stored ID string
    // FIXED: compare labelId (string) with selected array (strings)
    if (selected.includes(labelId)) {
      onChange(selected.filter(id => id !== labelId))
    } else {
      onChange([...selected, labelId])
    }
  }

  return (
    <div className="label-picker" data-testid="label-picker">
      <span className="field-label">Labels</span>
      <div className="label-options">
        {state.labels.map(label => (
          <button
            key={label.id}
            className={`label-option ${selected.includes(label.id) ? 'selected' : ''}`}
            style={{ borderColor: label.color }}
            onClick={() => toggle(label.id)}
            data-testid={`label-option-${label.id}`}
          >
            <span className="label-dot" style={{ backgroundColor: label.color }} />
            {label.name}
          </button>
        ))}
      </div>
    </div>
  )
}