import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
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
})
