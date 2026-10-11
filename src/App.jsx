import { useState } from 'react'
import TuneAudio from './components/TuneAudio.jsx'
import TuneBookList from './components/TuneBookList.jsx'
import TuneInput from './components/TuneInput.jsx'
import TuneViewer from './components/TuneViewer.jsx'
import {
  INITIAL_ACTIVE_TUNE_ID,
  INITIAL_TUNE_BOOK,
} from './initialTuneBook.js'
import { readAbcHeader } from './readAbcHeader.js'
import './App.css'

function App() {
  const [tuneBook, setTuneBook] = useState(INITIAL_TUNE_BOOK)
  const [activeTuneId, setActiveTuneId] = useState(INITIAL_ACTIVE_TUNE_ID)

  const activeTune =
    tuneBook.find((tune) => tune.id === activeTuneId) ?? tuneBook[0]
  const abcString = activeTune?.abcString ?? ''

  function updateActiveAbc(nextAbcString) {
    if (!activeTune) return

    setTuneBook((tunes) =>
      tunes.map((tune) => {
        if (tune.id !== activeTune.id) return tune

        return {
          ...tune,
          abcString: nextAbcString,
          title: readAbcHeader(nextAbcString, 'T') || tune.title,
          type: readAbcHeader(nextAbcString, 'R') || tune.type,
        }
      }),
    )
  }

  return (
    <main className="app-shell">
      <header className="app-header no-print">
        <a className="brand" href="#" aria-label="Score Studio home">
          <span className="brand-mark" aria-hidden="true">
            ♪
          </span>
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

        <TuneBookList
          tunes={tuneBook}
          activeTuneId={activeTune?.id}
          onSelectTune={setActiveTuneId}
        />

        <div className="work-area">
          <div className="editor-column">
            <TuneInput
              abcString={abcString}
              onAbcChange={updateActiveAbc}
              onClear={() => updateActiveAbc('')}
            />
            <TuneAudio />
          </div>
          <TuneViewer abcString={abcString} />
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
