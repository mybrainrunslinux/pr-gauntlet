import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import type { Card, AppState } from '../../src/types'

const mockCard: Card = {
  id: 'c-test',
  title: 'Fix login page styles',
  description: '',
  columnId: 'col1',
  assigneeId: null,
  labelIds: [],
  dueDate: null,
  priority: 'medium',
  sprintId: null,
  createdAt: '2024-01-01T00:00:00Z',
  order: 0,
}

const mockState: AppState = {
  cards: [mockCard],
  columns: [{ id: 'col1', title: 'To Do', order: 0 }],
  users: [],
  labels: [],
  sprints: [],
  currentUserId: 'u1',
  searchQuery: '',
  activeSprintId: null,
  sprintViewEnabled: false,
  boardName: 'Test Board',
}

vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({ state: mockState, dispatch: vi.fn() }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

// Static imports must come after vi.mock (hoisting handles ordering)
import { DeleteDialog } from '../../src/features/card/DeleteDialog'
import { CardItem } from '../../src/features/board/Card'

describe('delete-dialog', () => {
  it('DeleteDialog renders the card title in the confirmation message', () => {
    render(
      <DeleteDialog
        card={mockCard}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const text = screen.getByTestId('delete-dialog-title').textContent
    expect(text).toContain('Fix login page styles')
    expect(text).not.toContain('undefined')
  })

  it('CardItem delete button opens dialog with correct card title (not "undefined")', () => {
    render(<CardItem card={mockCard} />)

    fireEvent.click(screen.getByTestId('delete-btn-c-test'))

    const dialogText = screen.getByTestId('delete-dialog-title').textContent
    expect(dialogText).toContain('Fix login page styles')
    expect(dialogText).not.toContain('undefined')
  })
})
