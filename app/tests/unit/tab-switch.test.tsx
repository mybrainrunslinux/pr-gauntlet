import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('visibilitychange does not call savePreferences (no active listener)', () => {
    const saveSpy = vi.spyOn(storage, 'savePreferences')
    
    renderHook(() => usePreferences())
    
    // Clear any saves from initial mount/effects
    saveSpy.mockClear()

    // Simulate tab switch - set to hidden then back to visible
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

    // BUGGY CODE: visibilitychange handler calls savePreferences → test FAILS
    // FIXED CODE: no visibilitychange handler → savePreferences not called → test PASSES
    expect(saveSpy).not.toHaveBeenCalled()
  })

  it('demonstrates the bug - preferences get overwritten after tab switch', () => {
    const saveSpy = vi.spyOn(storage, 'savePreferences')
    
    const { result } = renderHook(() => usePreferences())
    
    // User makes changes to preferences
    act(() => {
      result.current.setPrefs({ darkMode: false, compactView: true })
    })

    // Verify the change was applied locally
    expect(result.current.prefs.darkMode).toBe(false)
    expect(result.current.prefs.compactView).toBe(true)

    // Clear save calls from the setPrefs operation
    saveSpy.mockClear()

    // Simulate returning to tab (visibilitychange to 'visible')
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
        writable: true
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // BUGGY CODE: This demonstrates how the stale closure overwrites recent changes
    // The visibilitychange handler captures old prefs values and saves them
    // In the fixed version, there should be no visibilitychange handler
    
    // This test will FAIL on buggy code (savePreferences gets called)
    // This test will PASS on fixed code (no visibilitychange handler)
    expect(saveSpy).not.toHaveBeenCalled()
  })
})
