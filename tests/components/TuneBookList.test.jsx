import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TuneBookList from '../../src/components/TuneBookList.jsx'

const tunes = [
  { id: 'first', title: 'First Tune', type: 'Reel' },
  { id: 'second', title: 'Second Tune', type: 'Jig' },
]

describe('TuneBookList', () => {
  it('shows each tune and marks the active one', () => {
    render(
      <TuneBookList
        tunes={tunes}
        activeTuneId="first"
        onSelectTune={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /First Tune/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    screen.getByRole('button', { name: /Second Tune/ })
  })

  it('selects a tune when its button is clicked', () => {
    const onSelectTune = vi.fn()
    render(
      <TuneBookList
        tunes={tunes}
        activeTuneId="first"
        onSelectTune={onSelectTune}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Second Tune/ }))

    expect(onSelectTune).toHaveBeenCalledWith('second')
  })

  it('shows an empty state when the book has no tunes', () => {
    render(
      <TuneBookList
        tunes={[]}
        activeTuneId={undefined}
        onSelectTune={vi.fn()}
      />,
    )

    expect(screen.getByText('No tunes in this book yet.')).toBeInTheDocument()
  })
})
