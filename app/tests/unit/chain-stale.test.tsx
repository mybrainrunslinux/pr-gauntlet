import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { eventBus } from '../../src/utils/eventBus'
import { useSubscription } from '../../src/hooks/useSubscription'

beforeEach(() => { ;(eventBus as any).listeners.clear() })

describe('chain-stale', () => {
  it('handler sees latest closure value after re-render (ref pattern)', () => {
    let counter = 0
    const { rerender } = renderHook(
      ({ count }: { count: number }) =>
        useSubscription('ref:test', () => { counter = count }),
      { initialProps: { count: 1 } }
    )
    rerender({ count: 99 })
    act(() => { eventBus.emit('ref:test', {}) })
    expect(counter).toBe(99)
  })
})

