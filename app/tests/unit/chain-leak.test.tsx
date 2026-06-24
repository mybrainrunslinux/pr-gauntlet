import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { eventBus } from '../../src/utils/eventBus'
import { useSubscription } from '../../src/hooks/useSubscription'

beforeEach(() => { ;(eventBus as any).listeners.clear() })

describe('chain-leak', () => {
  it('calls unsubscribe on unmount (cleanup runs)', () => {
    const spy = vi.spyOn(eventBus, 'unsubscribe')
    const { unmount } = renderHook(() => useSubscription('cleanup:test', vi.fn()))
    unmount()
    expect(spy).toHaveBeenCalledWith('cleanup:test', expect.any(Function))
  })
})

