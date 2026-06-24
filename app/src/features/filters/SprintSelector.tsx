// src/features/filters/SprintSelector.tsx
import { useEffect, useState } from 'react'
import { useAppContext } from '../../store/AppContext'
import type { Sprint } from '../../types'

export function SprintSelector() {
  const { state, dispatch } = useAppContext()
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)

  useEffect(() => {
    // Find the active sprint, fallback to first sprint if none is active
    const activeSprint = state.sprints.find(sprint => sprint.active) || state.sprints[0] || null
    setActiveSprint(activeSprint)
    
    if (activeSprint) {
      dispatch({ type: 'SET_ACTIVE_SPRINT', sprintId: activeSprint.id })
    }
  }, [state.sprints]) // Depend on sprints array to react to changes

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