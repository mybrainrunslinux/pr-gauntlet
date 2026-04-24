import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { eventBus } from '../../src/utils/eventBus'
import { useSubscription } from '../../src/hooks/useSubscription'

beforeEach(() => { ;(eventBus as any).listeners.clear() })

describe('chain-stats', () => {
  it('fires handler exactly once per event emission', () => {
    const handler = vi.fn()
    renderHook(() => useSubscription('test:topic', handler))
    act(() => { eventBus.emit('test:topic', { value: 42 }) })
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ value: 42 })
  })
})

