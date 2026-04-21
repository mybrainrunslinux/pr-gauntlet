import { useAppContext } from '../../store/AppContext'

export function SearchBar() {
  const { state, dispatch } = useAppContext()

  return (
    <input
      type="search"
      className="search-bar"
      placeholder="Search cards..."
      value={state.searchQuery}
      onChange={e => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
      data-testid="search-input"
    />
  )
}
