import { useEffect, useRef } from 'react'
import abcjs from 'abcjs'

function TuneViewer({ abcString }) {
  const paperRef = useRef(null)
  const renderErrorRef = useRef(null)
  const hasScore = Boolean(abcString.trim())

  useEffect(() => {
    const paper = paperRef.current
    const renderError = renderErrorRef.current
    if (!paper || !renderError) return

    paper.replaceChildren()
    renderError.hidden = true
    renderError.textContent = ''

    if (!abcString.trim()) return

    try {
      abcjs.renderAbc(paper, abcString, { responsive: 'resize' })
    } catch (error) {
      renderError.textContent = `Could not render the score: ${
        error instanceof Error
          ? error.message
          : 'Could not render this ABC notation.'
      }`
      renderError.hidden = false
    }
  }, [abcString])

  return (
    <section className="preview-panel" aria-labelledby="preview-title">
      <div className="panel-heading preview-heading no-print">
        <div>
          <p className="eyebrow">INSTANT PREVIEW</p>
          <h2 id="preview-title">Sheet music</h2>
        </div>
        <span className="preview-badge">Score</span>
      </div>
      <div className="paper">
        {hasScore ? null : (
          <div className="empty-score">
            <span aria-hidden="true">♫</span>
            <p>Your sheet music will appear here.</p>
            <span>Enter some ABC notation to get started.</span>
          </div>
        )}
        <div
          className="score"
          ref={paperRef}
          hidden={!hasScore}
        />
        <p
          className="render-error"
          id="render-error"
          role="alert"
          ref={renderErrorRef}
          hidden
        />
      </div>
    </section>
  )
}

export default TuneViewer
