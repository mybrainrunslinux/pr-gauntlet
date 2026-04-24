// src/features/card/AssigneePicker.tsx
import { useAppContext } from '../../store/AppContext'

interface Props {
  value: string | null
  onChange: (userId: string | null) => void
}

export function AssigneePicker({ value, onChange }: Props) {
  const { state } = useAppContext()

  return (
    <label>
      Assignee
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)} // FIXED: use value directly instead of index-based lookup
        data-testid="assignee-select"
      >
        <option value="">Unassigned</option>
        {state.users.map(u => (
          // Use user.id as value — not index
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </label>
  )
}