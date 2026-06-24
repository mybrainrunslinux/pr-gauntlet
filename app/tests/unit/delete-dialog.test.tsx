import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// Mock dnd-kit so CardItem renders without a DndContext requirement
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}))

// Mock useAppContext so we can inject controlled state
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: vi.fn(),
}))

import { useAppContext } from '../../src/store/AppContext'
import { CardItem } from '../../src/features/board/Card'
import { DeleteDialog } from '../../src/features/card/DeleteDialog'
import type { Card, AppState } from '../../src/types'

const testCard: Card = {
  id: 'card-test-01',
  title: 'Fix login page styles',
  description: 'The login button is misaligned',
  columnId: 'col-1',
  assigneeId: null,
  labelIds: [],
  dueDate: null,
  priority: 'medium',
  sprintId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  order: 0,
}

const testState: Pick<AppState, 'cards' | 'users' | 'labels'> = {
  cards: [testCard],
  users: [],
  labels: [],
}

// ─── Smoke test: DeleteDialog component renders correctly when given a card ───
// This test PASSES (the component itself is fine; the bug is in the caller).
describe('delete-dialog: component renders correctly', () => {
  it('delete-dialog renders the card title when card prop is provided correctly', () => {
    render(
      <DeleteDialog
        card={testCard}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    )
    const dialogText = screen.getByTestId('delete-dialog-title')
    expect(dialogText).toHaveTextContent('Fix login page styles')
  })
})

// ─── Bug test: CardItem passes wrong card to DeleteDialog ─────────────────────
// This test FAILS because Card.tsx line 82 searches state.cards by title but
// deleteTarget holds card.id — so find() returns undefined, and card.title
// in DeleteDialog renders as "undefined".
describe('delete-dialog: confirmation shows card title', () => {
  it('delete-dialog displays the card title not undefined when delete is triggered', () => {
    const dispatch = vi.fn()

    vi.mocked(useAppContext).mockReturnValue({
      state: testState as AppState,
      dispatch,
    })

    // Suppress the expected React error from the undefined card prop crash
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    let thrownError: unknown = null
    try {
      render(<CardItem card={testCard} />)

      // Click the trash icon — sets deleteTarget to card.id ('card-test-01')
      const deleteBtn = screen.getByTestId(`delete-btn-${testCard.id}`)
      fireEvent.click(deleteBtn)

      // The dialog should show the real card title
      const dialogText = screen.getByTestId('delete-dialog-title')
      // BUG: find(c => c.title === deleteTarget) where deleteTarget = card.id
      // → returns undefined → card.title throws TypeError
      expect(dialogText).toHaveTextContent('Fix login page styles')
      expect(dialogText.textContent).not.toContain('undefined')
    } catch (e) {
      thrownError = e
    } finally {
      consoleError.mockRestore()
    }

    // If an error was thrown (TypeError: Cannot read properties of undefined),
    // fail the test with a clear message that proves the bug exists.
    if (thrownError !== null) {
      const msg = thrownError instanceof Error ? thrownError.message : String(thrownError)
      expect(msg, 'Delete dialog crashed because card prop was undefined — Card.tsx passes card.id to find() but searches by card.title').toBe('')
    }
  })
})
