// src/utils/storage.ts
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
  
  // Parse ISO date string (YYYY-MM-DD format) as local date, not UTC.
  // Split the date string to extract year, month, day components.
  // This avoids the Date constructor's UTC interpretation which causes
  // a one-day shift for users west of UTC.
  const [year, month, day] = isoDate.split('-').map(Number)
  
  // Create date using local timezone components
  const d = new Date(year, month - 1, day)
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}