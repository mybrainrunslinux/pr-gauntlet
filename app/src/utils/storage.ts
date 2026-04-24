export function loadPreferences<T>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaults
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

export function savePreferences<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded or private browsing
  }
}

export function formatDate(isoDate: string | null): string {
  if (!isoDate) return ''
  
  // Parse ISO date string (YYYY-MM-DD) by extracting components
  // This avoids UTC midnight interpretation that shifts dates west of UTC
  const [yearStr, monthStr, dayStr] = isoDate.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1 // Date constructor uses 0-indexed months
  const day = parseInt(dayStr, 10)
  
  // Create date using local time (not UTC)
  const date = new Date(year, month, day)
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}