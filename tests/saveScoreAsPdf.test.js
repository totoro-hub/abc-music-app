import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveScoreAsPdf } from '../src/saveScoreAsPdf.js'

const { mockPdfSvg, mockSave } = vi.hoisted(() => ({
  mockPdfSvg: vi.fn(),
  mockSave: vi.fn(),
}))

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function () {
    this.internal = {
      pageSize: {
        getWidth: () => 595.28,
        getHeight: () => 841.89,
      },
    }
    this.svg = mockPdfSvg
    this.save = mockSave
  }),
}))

vi.mock('svg2pdf.js', () => ({}))

describe('saveScoreAsPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves the vector score with a filename based on its title', async () => {
    const scoreSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    Object.defineProperty(scoreSvg, 'viewBox', {
      value: { baseVal: { width: 200, height: 100 } },
    })
    scoreSvg.getBBox = () => ({ width: 200, height: 100 })

    await saveScoreAsPdf(scoreSvg, 'X:1\nT: A/Test Tune? \nK:C')

    expect(mockPdfSvg).toHaveBeenCalledWith(
      scoreSvg,
      expect.objectContaining({ width: 523.28 }),
    )
    expect(mockSave).toHaveBeenCalledWith('ATest-Tune.pdf')
  })

  it('rejects a score without printable dimensions', async () => {
    const scoreSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    Object.defineProperty(scoreSvg, 'viewBox', {
      value: { baseVal: { width: 0, height: 0 } },
    })
    scoreSvg.getBBox = () => ({ width: 0, height: 0 })

    await expect(saveScoreAsPdf(scoreSvg, 'T:Empty')).rejects.toThrow(
      'The rendered score has no printable dimensions.',
    )
  })
})
