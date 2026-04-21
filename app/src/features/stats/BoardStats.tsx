import { useAppContext } from '../../store/AppContext'
import { useCardStats } from '../../hooks/useCardStats'

export function BoardStats() {
  const { state } = useAppContext()
  const stats = useCardStats(state.cards, state.columns)

  return (
    <div className="board-stats" data-testid="board-stats">
      <span className="stat-pct" data-testid="completion-pct">{stats.pct}% complete</span>
      <span className="stat-detail">{stats.done}/{stats.total} done</span>
    </div>
  )
}
