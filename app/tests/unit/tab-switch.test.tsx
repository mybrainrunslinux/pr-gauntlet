import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePreferences } from '../../src/hooks/usePreferences'
import * as storage from '../../src/utils/storage'

// Mock the storage utilities
vi.mock('../../src/utils/storage', () => ({
  loadPreferences: vi.fn(() => ({
    darkMode: true,
    compactView: false,
    sortOrder: 'created',
    notifications: true,
  })),
  savePreferences: vi.fn(),
}))

describe('tab-switch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset document visibility state
    Object.defineProperty(document, 'visibilityState', { 
      value: 'visible', 
      configurable: true, 
      writable: true 
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('visibilitychange does not call savePreferences (no active listener)', () => {
    const saveSpy = vi.spyOn(storage, 'savePreferences')
    
    renderHook(() => usePreferences())
    
    // Clear the initial save that might happen during mount
    saveSpy.mockClear()

    // Simulate tab switch by changing visibility state and firing event
    act(() => {
      Object.defineProperty(document, 'visibilityState', { 
        value: 'hidden', 
        configurable: true, 
        writable: true 
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    act(() => {
      Object.defineProperty(document, 'visibilityState', { 
        value: 'visible', 
        configurable: true, 
        writable: true 
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // BUGGY CODE: visibilitychange handler calls savePreferences → spy is called → TEST FAILS
    // FIXED CODE: no visibilitychange handler → savePreferences not called → TEST PASSES
    expect(saveSpy).not.toHaveBeenCalled()
  })

  it('demonstrates the stale closure bug with preference updates', () => {
    const saveSpy = vi.spyOn(storage, 'savePreferences')
    
    const { result } = renderHook(() => usePreferences())
    
    // Clear initial saves
    saveSpy.mockClear()

    // User makes a preference change
    act(() => {
      result.current.setPrefs({ darkMode: false })
    })

    // Verify the preference change was saved
    expect(saveSpy).toHaveBeenCalledWith('taskflow:prefs', {
      darkMode: false,
      compactView: false,
      sortOrder: 'created',
      notifications: true,
    })

    saveSpy.mockClear()

    // User switches tabs (visibility changes)
    act(() => {
      Object.defineProperty(document, 'visibilityState', { 
        value: 'visible', 
        configurable: true, 
        writable: true 
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // BUGGY CODE: This would overwrite with stale preferences from closure
    // FIXED CODE: No visibilitychange handler, so no additional save
    expect(saveSpy).not.toHaveBeenCalled()
  })
})
