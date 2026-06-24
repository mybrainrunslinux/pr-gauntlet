import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { eventBus } from '../../src/utils/eventBus'
import { useSubscription } from '../../src/hooks/useSubscription'

beforeEach(() => { ;(eventBus as any).listeners.clear() })

describe('chain-crash', () => {
  it('unsubscribing one topic does not affect subscribers on another topic', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    const { unmount: unmount1 } = renderHook(() => useSubscription('topic:A', h1))
    renderHook(() => useSubscription('topic:B', h2))
    unmount1()
    act(() => { eventBus.emit('topic:B', 'hello') })
    expect(h2).toHaveBeenCalledWith('hello')
    expect(h1).not.toHaveBeenCalled()
  })
})

