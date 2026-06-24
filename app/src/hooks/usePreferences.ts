import { useState, useEffect } from 'react'
import { loadPreferences, savePreferences } from '../utils/storage'

interface Preferences {
  darkMode: boolean
  compactView: boolean
  sortOrder: 'created' | 'priority' | 'dueDate'
  notifications: boolean
}

const DEFAULTS: Preferences = {
  darkMode: true,
  compactView: false,
  sortOrder: 'created',
  notifications: true,
}

export function usePreferences() {
  const [prefs, setPrefsState] = useState<Preferences>(() =>
    loadPreferences('taskflow:prefs', DEFAULTS)
  )

  function setPrefs(update: Partial<Preferences>) {
    // BUG #11: reads stale `prefs` from closure — tab switch triggers visibilitychange
    // which overwrites with stale saved value, reverting recent changes
    const next = { ...prefs, ...update }
    savePreferences('taskflow:prefs', next)
    setPrefsState(next)
  }

  return { prefs, setPrefs }
}
