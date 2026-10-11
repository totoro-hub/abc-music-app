import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import abcjs from 'abcjs'
import TuneViewer from '../../src/components/TuneViewer.jsx'

vi.mock('abcjs', () => ({
  default: {
    renderAbc: vi.fn(),
  },
}))

describe('TuneViewer', () => {
  it('shows the empty state when notation is blank', () => {
    render(<TuneViewer abcString="  " />)

    expect(
      screen.getByText('Your sheet music will appear here.'),
    ).toBeInTheDocument()
    expect(abcjs.renderAbc).not.toHaveBeenCalled()
  })

  it('renders a score for non-empty notation', () => {
    vi.mocked(abcjs.renderAbc).mockImplementation((container) => {
      container.innerHTML = '<svg aria-label="Rendered score"></svg>'
    })
    render(<TuneViewer abcString="X:1\nT:Test Tune\nK:C\nCDEF" />)

    expect(screen.getByLabelText('Rendered score')).toBeInTheDocument()
  })

  it('shows an error when rendering fails', () => {
    vi.mocked(abcjs.renderAbc).mockImplementation(() => {
      throw new Error('Invalid notation')
    })
    render(<TuneViewer abcString="invalid" />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not render the score: Invalid notation',
    )
  })
})
