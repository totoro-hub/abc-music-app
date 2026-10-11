import { useEffect, useRef, useState } from 'react'
import abcjs from 'abcjs'
import './App.css'

const DEFAULT_ABC = `X:1
T:Twinkle, Twinkle, Little Star
M:4/4
L:1/4
K:C
C C G G | A A G2 | F F E E | D D C2 |
G G F F | E E D2 | G G F F | E E D2 |
C C G G | A A G2 | F F E E | D D C2 |]`

function App() {
  const [abcInput, setAbcInput] = useState(DEFAULT_ABC)
  const paperRef = useRef(null)
  const renderErrorRef = useRef(null)

  useEffect(() => {
    const paper = paperRef.current
    if (!paper) return

    paper.replaceChildren()
    renderErrorRef.current.hidden = true
    renderErrorRef.current.textContent = ''

    if (!abcInput.trim()) return

    try {
      abcjs.renderAbc(paper, abcInput, { responsive: 'resize' })
    } catch (error) {
      renderErrorRef.current.textContent = `Could not render the score: ${
        error instanceof Error
          ? error.message
          : 'Could not render this ABC notation.'
      }`
      renderErrorRef.current.hidden = false
    }
  }, [abcInput])

  return (
    <main className="app-shell">
      <header className="app-header no-print">
        <a className="brand" href="#" aria-label="Score Studio home">
          <span className="brand-mark" aria-hidden="true">♪</span>
          <span>Score Studio</span>
        </a>
        <span className="header-note">ABC notation, made visual</span>
      </header>

      <section className="workspace">
        <div className="page-intro no-print">
          <p className="eyebrow">MUSIC NOTATION WORKSPACE</p>
          <h1>Make your music readable.</h1>
          <p className="intro-copy">
            Write or paste ABC notation and see your score take shape instantly.
          </p>
        </div>

        <div className="work-area">
          <section className="editor-panel no-print" aria-labelledby="editor-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR SCORE</p>
                <h2 id="editor-title">ABC notation</h2>
              </div>
              <span className="live-indicator"><span /> Live</span>
            </div>

            <label className="sr-only" htmlFor="abc-input">
              Enter ABC music notation
            </label>
            <textarea
              id="abc-input"
              className="notation-input"
              value={abcInput}
              onChange={(event) => setAbcInput(event.target.value)}
              spellCheck="false"
              autoCapitalize="off"
              aria-describedby="render-error"
            />
            <p
              className="render-error"
              id="render-error"
              role="alert"
              ref={renderErrorRef}
              hidden
            />
            <div className="editor-footer">
              <span>{abcInput.length} characters</span>
              <button
                className="clear-button"
                type="button"
                onClick={() => setAbcInput('')}
                disabled={!abcInput}
              >
                Clear
              </button>
            </div>
            <button
              className="print-button"
              type="button"
              onClick={() => window.print()}
            >
              <span aria-hidden="true">↗</span>
              Print or save as PDF
            </button>
          </section>

          <section className="preview-panel" aria-labelledby="preview-title">
            <div className="panel-heading preview-heading no-print">
              <div>
                <p className="eyebrow">INSTANT PREVIEW</p>
                <h2 id="preview-title">Sheet music</h2>
              </div>
              <span className="preview-badge">Score</span>
            </div>
            <div className="paper">
              {abcInput.trim() ? (
                <div className="score" ref={paperRef} />
              ) : (
                <div className="empty-score">
                  <span aria-hidden="true">♫</span>
                  <p>Your sheet music will appear here.</p>
                  <span>Enter some ABC notation to get started.</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="workspace-footer no-print">
          <span>Edits are rendered in your browser as you type.</span>
          <span>Powered by abcjs</span>
        </footer>
      </section>
    </main>
  )
}

export default App
