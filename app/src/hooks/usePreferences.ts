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

  // BUG #11: visibilitychange handler captures stale prefs in closure
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'visible') {
        // Reads from closure — will overwrite newer changes with older prefs
        savePreferences('taskflow:prefs', prefs)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [prefs])

  function setPrefs(update: Partial<Preferences>) {
    // BUG #11: reads stale `prefs` from closure — tab switch triggers visibilitychange
    // which overwrites with stale saved value, reverting recent changes
    const next = { ...prefs, ...update }
    savePreferences('taskflow:prefs', next)
    setPrefsState(next)
  }

  return { prefs, setPrefs }
}
