import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePreferences } from '../../src/hooks/usePreferences'
import * as storage from '../../src/utils/storage'

// Mock storage utilities
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

  it('visibilitychange does not call savePreferences (no active listener)', () => {
    const saveSpy = vi.spyOn(storage, 'savePreferences')
    
    renderHook(() => usePreferences())
    
    // Clear any saves from hook initialization
    saveSpy.mockClear()

    // Simulate tab switch (visibility change)
    act(() => {
      Object.defineProperty(document, 'visibilityState', { 
        value: 'visible', 
        configurable: true, 
        writable: true 
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // BUGGY: visibilitychange handler calls savePreferences → spy is called → FAILS
    // CLEAN: no visibilitychange handler → savePreferences not called → PASSES
    expect(saveSpy).not.toHaveBeenCalled()
  })

  it('demonstrates the stale closure bug when preferences are updated then tab is switched', () => {
    const saveSpy = vi.spyOn(storage, 'savePreferences')
    
    const { result } = renderHook(() => usePreferences())
    
    // Clear initial saves
    saveSpy.mockClear()
    
    // User makes a preference change
    act(() => {
      result.current.setPrefs({ darkMode: false })
    })
    
    // Verify the change was saved
    expect(saveSpy).toHaveBeenCalledWith('taskflow:prefs', {
      darkMode: false,
      compactView: false,
      sortOrder: 'created',
      notifications: true,
    })
    
    saveSpy.mockClear()
    
    // User switches tabs - this triggers visibilitychange
    act(() => {
      Object.defineProperty(document, 'visibilityState', { 
        value: 'hidden', 
        configurable: true, 
        writable: true 
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    
    // User switches back to tab
    act(() => {
      Object.defineProperty(document, 'visibilityState', { 
        value: 'visible', 
        configurable: true, 
        writable: true 
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // BUGGY: visibilitychange handler with stale closure overwrites with old prefs
    // This would save the stale prefs (darkMode: true) overwriting the user's change
    // CLEAN: no visibilitychange handler, so no stale data overwrite
    expect(saveSpy).not.toHaveBeenCalled()
  })
})
