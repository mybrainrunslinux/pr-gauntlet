import { useEffect, useState } from 'react'
import { useAppContext } from '../../store/AppContext'
import type { Sprint } from '../../types'

export function SprintSelector() {
  const { state, dispatch } = useAppContext()
  // Correct init: null until sprints are available
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)

  useEffect(() => {
    const found = state.sprints.find(s => s.active) ?? null
    setActiveSprint(found)
    if (found) dispatch({ type: 'SET_ACTIVE_SPRINT', sprintId: found.id })
  }, [state.sprints, dispatch])

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
