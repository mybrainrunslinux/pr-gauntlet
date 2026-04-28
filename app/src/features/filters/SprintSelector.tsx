import { useEffect, useState } from 'react'
import { useAppContext } from '../../store/AppContext'
import type { Sprint } from '../../types'

export function SprintSelector() {
  const { state, dispatch } = useAppContext()
  // BUG #7: initialized from sprints[0] (first sprint, not active); useEffect never fires when same ref
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(state.sprints.find(s => s.active) ?? state.sprints[0] ?? null)

  useEffect(() => {
    // Bug: only runs if sprints reference changes, but seed data is stable
    const found = state.sprints.find(s => s.active) ?? state.sprints[0] ?? null
    setActiveSprint(found)
    if (found) dispatch({ type: 'SET_ACTIVE_SPRINT', sprintId: found.id })
  }, [])

  return (
    <div className="sprint-controls">
      <label className="sprint-toggle">
        <input
          type="checkbox"
          checked={state.sprintViewEnabled}
          onChange={e => dispatch({ type: 'TOGGLE_SPRINT_VIEW', enabled: e.target.checked })}
          data-testid="sprint-view-toggle"
        />
        Sprint View
      </label>
      {state.sprintViewEnabled && (
        <select
          value={state.activeSprintId ?? ''}
          onChange={e => dispatch({ type: 'SET_ACTIVE_SPRINT', sprintId: e.target.value || null })}
          data-testid="sprint-selector"
        >
          {state.sprints.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}{s.active ? ' (active)' : ''}
            </option>
          ))}
        </select>
      )}
      {activeSprint && (
        <span className="active-sprint-label" data-testid="active-sprint-name">
          {activeSprint.name}
        </span>
      )}
    </div>
  )
}
