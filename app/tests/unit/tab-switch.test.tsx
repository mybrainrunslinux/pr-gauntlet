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

    act(() => {
      // Simulate tab switch - document becomes hidden then visible
      Object.defineProperty(document, 'visibilityState', { 
        value: 'hidden', 
        configurable: true, 
        writable: true 
      })
      document.dispatchEvent(new Event('visibilitychange'))
      
      Object.defineProperty(document, 'visibilityState', { 
        value: 'visible', 
        configurable: true, 
        writable: true 
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Buggy: visibilitychange handler calls savePreferences → spy is called → FAILS
    // Clean: no visibilitychange handler → savePreferences not called → PASSES
    expect(saveSpy).not.toHaveBeenCalled()
  })

  it('preferences are saved immediately when changed, not on tab switch', () => {
    const saveSpy = vi.spyOn(storage, 'savePreferences')
    
    const { result } = renderHook(() => usePreferences())
    
    // Clear any saves from hook initialization
    saveSpy.mockClear()

    act(() => {
      // Make a preference change
      result.current.setPrefs({ darkMode: false })
    })

    // Should save immediately when preference changes
    expect(saveSpy).toHaveBeenCalledWith('taskflow:prefs', {
      darkMode: false,
      compactView: false,
      sortOrder: 'created',
      notifications: true,
    })

    saveSpy.mockClear()

    act(() => {
      // Simulate tab switch after preference change
      Object.defineProperty(document, 'visibilityState', { 
        value: 'visible', 
        configurable: true, 
        writable: true 
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Should NOT save again on tab switch
    expect(saveSpy).not.toHaveBeenCalled()
  })
})
