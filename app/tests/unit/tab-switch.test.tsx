import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePreferences } from '../../src/hooks/usePreferences'
import * as storage from '../../src/utils/storage'

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
  })

  it('visibilitychange does not call savePreferences (no active listener)', () => {
    const saveSpy = vi.spyOn(storage, 'savePreferences')
    renderHook(() => usePreferences())
    saveSpy.mockClear()  // clear initial save triggered by mount effect

    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true, writable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Buggy: visibilitychange handler calls savePreferences → spy is called → FAILS
    // Clean: no handler → savePreferences not called → PASSES
    expect(saveSpy).not.toHaveBeenCalled()
  })

  it('preference changes still save correctly without visibilitychange handler', () => {
    const saveSpy = vi.spyOn(storage, 'savePreferences')
    const { result } = renderHook(() => usePreferences())
    saveSpy.mockClear()

    act(() => {
      result.current.setPrefs({ darkMode: false })
    })

    // Should still save when preferences are updated directly
    expect(saveSpy).toHaveBeenCalledWith('taskflow:prefs', {
      darkMode: false,
      compactView: false,
      sortOrder: 'created',
      notifications: true,
    })
  })
})
