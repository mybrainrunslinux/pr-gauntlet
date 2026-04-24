import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { eventBus } from '../../../src/utils/eventBus'
import { useSubscription } from '../../../src/hooks/useSubscription'

beforeEach(() => {
  // Clear all listeners between tests
  ;(eventBus as any).listeners.clear()
})

describe('useSubscription (chain primitive)', () => {
  it('fires handler exactly once per event emission', () => {
    const handler = vi.fn()
    renderHook(() => useSubscription('test:topic', handler))

    act(() => { eventBus.emit('test:topic', { value: 42 }) })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ value: 42 })
  })

  it('handler sees latest closure value after re-render (ref pattern)', () => {
    let counter = 0
    const { rerender } = renderHook(
      ({ count }: { count: number }) =>
        useSubscription('ref:test', () => { counter = count }),
      { initialProps: { count: 1 } }
    )

    rerender({ count: 99 })
    act(() => { eventBus.emit('ref:test', {}) })

    expect(counter).toBe(99) // not stale value 1
  })

  it('calls unsubscribe on unmount (cleanup runs)', () => {
    const spy = vi.spyOn(eventBus, 'unsubscribe')
    const { unmount } = renderHook(() => useSubscription('cleanup:test', vi.fn()))

    unmount()

    expect(spy).toHaveBeenCalledWith('cleanup:test', expect.any(Function))
  })

  it('re-render with new handler does not accumulate subscribers', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    const { rerender } = renderHook(
      ({ handler }: { handler: typeof h1 }) => useSubscription('nodup:test', handler),
      { initialProps: { handler: h1 } }
    )

    rerender({ handler: h2 })
    act(() => { eventBus.emit('nodup:test', 'data') })

    // Only one subscriber should exist — no accumulation
    expect(eventBus.subscriberCount('nodup:test')).toBe(1)
    // Latest handler called
    expect(h2).toHaveBeenCalledWith('data')
    expect(h1).not.toHaveBeenCalled()
  })

  it('unsubscribing one topic does not affect subscribers on another topic', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    const { unmount: unmount1 } = renderHook(() => useSubscription('topic:A', h1))
    renderHook(() => useSubscription('topic:B', h2))

    unmount1() // unsubscribe from topic:A

    act(() => { eventBus.emit('topic:B', 'hello') })

    expect(h2).toHaveBeenCalledWith('hello')
    expect(h1).not.toHaveBeenCalled()
  })
})

