import React, { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppProvider, useAppContext } from '../../src/store/AppContext'

// Ensure Date.now() always increments so the key ALWAYS changes in buggy code
let _counter = 1000
vi.spyOn(Date, 'now').mockImplementation(() => ++_counter)

function TestChild() {
  const { dispatch } = useAppContext()
  const [localCount, setLocalCount] = useState(0)
  return (
    <button
      data-testid="counter"
      onClick={() => {
        setLocalCount(c => c + 1)
        dispatch({ type: 'SET_BOARD_NAME', name: 'updated' })
      }}
    >
      {localCount}
    </button>
  )
}

describe('prefs-persist', () => {
  it('child local state survives dispatch (AppProvider does not remount subtree)', () => {
    render(<AppProvider><TestChild /></AppProvider>)
    fireEvent.click(screen.getByTestId('counter'))
    // Buggy: dispatch → AppProvider re-renders → key={Date.now()} changes
    //        → Context.Provider gets new key → subtree unmounts/remounts → localCount resets to 0
    // Clean: no key → subtree preserved → localCount = 1
    expect(screen.getByTestId('counter')).toHaveTextContent('1')
  })
})
