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
  
  // Parse as a date without time component to avoid timezone shifting
  const [year, month, day] = isoDate.split('-')
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}