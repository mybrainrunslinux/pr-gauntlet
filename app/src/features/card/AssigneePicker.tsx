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
        onChange={e => onChange(state.users[e.target.selectedIndex - 1]?.id ?? null)} // BUG #8: uses index not value
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
