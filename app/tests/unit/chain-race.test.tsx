import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { eventBus } from '../../src/utils/eventBus'
import { useSubscription } from '../../src/hooks/useSubscription'

beforeEach(() => { ;(eventBus as any).listeners.clear() })

describe('chain-race', () => {
  it('re-render with new handler does not accumulate subscribers', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    const { rerender } = renderHook(
      ({ handler }: { handler: typeof h1 }) => useSubscription('nodup:test', handler),
      { initialProps: { handler: h1 } }
    )
    rerender({ handler: h2 })
    act(() => { eventBus.emit('nodup:test', 'data') })
    expect(eventBus.subscriberCount('nodup:test')).toBe(1)
    expect(h2).toHaveBeenCalledWith('data')
    expect(h1).not.toHaveBeenCalled()
  })
})

