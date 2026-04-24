import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LabelPicker } from '../../src/features/card/LabelPicker'

// Mock useAppContext
vi.mock('../../src/store/AppContext', () => ({
  useAppContext: () => ({
    state: {
      cards: [{ id:'c1', title:'Test Card', description:'', columnId:'col-1', assigneeId:null,
                 labelIds:[], dueDate:null, priority:'medium', sprintId:null,
                 createdAt:'2026-01-01', order:0 }],
      columns: [{ id:'col-1', title:'To Do', order:0 }, { id:'col-2', title:'Done', order:1 }],
      users: [{ id:'u1', name:'Alice' }, { id:'u2', name:'Bob' }],
      labels: [
        { id:'l1', name:'Bug', color:'#ff0000' },
        { id:'l2', name:'Feature', color:'#00ff00' },
        { id:'l3', name:'Enhancement', color:'#0000ff' }
      ],
      sprints: [{ id:'s0', name:'Past Sprint', active:false }, { id:'s1', name:'Active Sprint', active:true }],
      currentUserId: 'u1',
      searchQuery: '',
      activeSprintId: 's1',
      sprintViewEnabled: false,
      boardName: 'Test Board',
    },
    dispatch: vi.fn(),
  })
}))

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }),
  SortableContext: ({ children }: { children: any }) => children,
  verticalListSortingStrategy: {},
}))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))

describe('label-persist', () => {
  let onChangeMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onChangeMock = vi.fn()
  })

  it('should correctly toggle label selection when clicking label options', () => {
    // Start with no labels selected
    const initialSelected: string[] = []
    
    render(
      <LabelPicker 
        selected={initialSelected} 
        onChange={onChangeMock} 
      />
    )

    // Find and click the "Bug" label option
    const bugLabelOption = screen.getByTestId('label-option-l1')
    expect(bugLabelOption).toBeInTheDocument()
    
    // Initially the bug label should not be selected
    expect(bugLabelOption).not.toHaveClass('selected')
    
    // Click to select the bug label
    fireEvent.click(bugLabelOption)
    
    // Verify onChange was called with the correct label ID added
    expect(onChangeMock).toHaveBeenCalledWith(['l1'])
  })

  it('should correctly remove label when clicking already selected label', () => {
    // Start with bug label already selected
    const initialSelected: string[] = ['l1']
    
    render(
      <LabelPicker 
        selected={initialSelected} 
        onChange={onChangeMock} 
      />
    )

    const bugLabelOption = screen.getByTestId('label-option-l1')
    
    // Initially the bug label should be selected
    expect(bugLabelOption).toHaveClass('selected')
    
    // Click to deselect the bug label
    fireEvent.click(bugLabelOption)
    
    // Verify onChange was called with the label ID removed
    expect(onChangeMock).toHaveBeenCalledWith([])
  })

  it('should handle multiple label selections correctly', () => {
    // Start with bug label selected
    const initialSelected: string[] = ['l1']
    
    render(
      <LabelPicker 
        selected={initialSelected} 
        onChange={onChangeMock} 
      />
    )

    // Click the feature label to add it
    const featureLabelOption = screen.getByTestId('label-option-l2')
    fireEvent.click(featureLabelOption)
    
    // Verify onChange was called with both labels
    expect(onChangeMock).toHaveBeenCalledWith(['l1', 'l2'])
  })

  it('should show correct visual state for selected labels', () => {
    const selectedLabels: string[] = ['l1', 'l3']
    
    render(
      <LabelPicker 
        selected={selectedLabels} 
        onChange={onChangeMock} 
      />
    )

    // Bug label should be selected
    expect(screen.getByTestId('label-option-l1')).toHaveClass('selected')
    
    // Feature label should not be selected
    expect(screen.getByTestId('label-option-l2')).not.toHaveClass('selected')
    
    // Enhancement label should be selected
    expect(screen.getByTestId('label-option-l3')).toHaveClass('selected')
  })
})
