import { useState } from 'react'
import { saveScoreAsPdf } from '../saveScoreAsPdf.js'

function TuneInput({ abcString, onAbcChange, onClear }) {
  const [exportError, setExportError] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  async function handleSavePdf() {
    setExportError('')
    setIsExporting(true)

    try {
      const scoreSvg = document.querySelector('.score svg')
      if (!scoreSvg) {
        throw new Error('The sheet music is not ready to export.')
      }

      await saveScoreAsPdf(scoreSvg, abcString)
    } catch (error) {
      setExportError(
        `Could not save the PDF: ${
          error instanceof Error ? error.message : 'Please try again.'
        }`,
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className="editor-panel no-print" aria-labelledby="editor-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">YOUR SCORE</p>
          <h2 id="editor-title">ABC notation</h2>
        </div>
        <span className="live-indicator">
          <span /> Live
        </span>
      </div>

      <label className="sr-only" htmlFor="abc-input">
        Enter ABC music notation
      </label>
      <textarea
        id="abc-input"
        className="notation-input"
        value={abcString}
        onChange={(event) => onAbcChange(event.target.value)}
        spellCheck="false"
        autoCapitalize="off"
      />
      <div className="editor-footer">
        <span>{abcString.length} characters</span>
        <button
          className="clear-button"
          type="button"
          onClick={onClear}
          disabled={!abcString}
        >
          Clear
        </button>
      </div>
      <button
        className="print-button"
        type="button"
        onClick={handleSavePdf}
        disabled={!abcString.trim() || isExporting}
      >
        <span aria-hidden="true">↓</span>
        {isExporting ? 'Creating PDF…' : 'Save as PDF'}
      </button>
      {exportError && (
        <p className="render-error" role="alert">
          {exportError}
        </p>
      )}
    </section>
  )
}

export default TuneInput
