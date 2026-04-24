// src/hooks/usePreferences.ts
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

  // Fixed: Save preferences whenever they change, without relying on visibilitychange
  useEffect(() => {
    savePreferences('taskflow:prefs', prefs)
  }, [prefs])

  function setPrefs(update: Partial<Preferences>) {
    // Fixed: Use functional update to ensure we're working with the latest state
    setPrefsState(prev => {
      const next = { ...prev, ...update }
      savePreferences('taskflow:prefs', next)
      return next
    })
  }

  return { prefs, setPrefs }
}