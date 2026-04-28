/**
 * label-persist: failing test for label disappearing after add (Issue #6)
 *
 * BUG #6 is in LabelPicker.tsx toggle():
 *   (selected as unknown[]).includes(label)
 * where `label` is a Label object and `selected` is string[].
 * Object-reference comparison against strings is always false, so the remove
 * branch never fires — a second click on an already-selected label appends
 * a duplicate ID instead of removing it, causing the label state to diverge
 * from what the user expects (deselect reverts the visual state but internally
 * keeps adding duplicates, meaning any attempt to remove a label silently fails).
 *
 * NOTE: AppContext is not exported from AppContext.tsx — only AppProvider and
 * useAppContext are exported. We use AppProvider as the context wrapper.
 * BUG #14 (key={Date.now()} on AppProvider) does not affect single-render
 * tests — it only causes issues across re-renders triggered by parent state.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { LabelPicker } from '../../src/features/card/LabelPicker'
import { AppProvider } from '../../src/store/AppContext'

// AppProvider uses real seed data (LABELS: l1='bug'/#ef4444, l2='feature'/#3b82f6, l3='docs'/#6b7280)
// LabelPicker reads state.labels via useAppContext() — real seed labels are sufficient.

function renderInProvider(ui: React.ReactElement) {
  return render(<AppProvider>{ui}</AppProvider>)
}

describe('label-persist', () => {
  it('label-persist: LabelPicker renders label options from context', () => {
    // Discovery / smoke test — verifies the component loads and seeds are visible
    renderInProvider(
      <LabelPicker selected={[]} onChange={vi.fn()} />
    )
    expect(screen.getByTestId('label-option-l1')).toBeTruthy()
    expect(screen.getByTestId('label-option-l2')).toBeTruthy()
    expect(screen.getByTestId('label-option-l3')).toBeTruthy()
  })

  it('label-persist: toggle removes a previously-selected label (deselect path)', () => {
    // Start with label 'l1' already in selected
    const onChange = vi.fn()

    renderInProvider(
      <LabelPicker selected={['l1']} onChange={onChange} />
    )

    // The 'bug' label (id=l1) should appear as selected in the picker UI
    const bugButton = screen.getByTestId('label-option-l1')
    expect(bugButton).toHaveClass('selected')

    // Click l1 again — expected: REMOVE it (deselect path) → onChange([])
    fireEvent.click(bugButton)

    // BUG #6: (selected as unknown[]).includes(label_object) is always false
    //   → else branch runs → onChange(['l1', 'l1'])  (duplicate appended)
    // Correct behavior: onChange([])
    expect(onChange).toHaveBeenCalledTimes(1)
    const result: string[] = onChange.mock.calls[0][0]

    expect(result).not.toContain('l1')
    expect(result).toHaveLength(0)
  })

  it('label-persist: second click on an added label removes it, not duplicates it', () => {
    const onChange = vi.fn()
    let selected: string[] = []

    const { rerender } = renderInProvider(
      <LabelPicker
        selected={selected}
        onChange={(ids) => { selected = ids; onChange(ids) }}
      />
    )

    // First click: add l2 (feature label) — this path works correctly
    fireEvent.click(screen.getByTestId('label-option-l2'))
    expect(onChange).toHaveBeenLastCalledWith(['l2'])
    selected = ['l2']

    rerender(
      <AppProvider>
        <LabelPicker
          selected={selected}
          onChange={(ids) => { selected = ids; onChange(ids) }}
        />
      </AppProvider>
    )

    // Second click on same label: expected deselect → onChange([])
    fireEvent.click(screen.getByTestId('label-option-l2'))
    const lastCall: string[] = onChange.mock.calls[onChange.mock.calls.length - 1][0]

    // BUG #6: includes(label_object) always false → appends again → ['l2', 'l2']
    expect(lastCall).not.toContain('l2')
    expect(lastCall).toHaveLength(0)
  })
})
