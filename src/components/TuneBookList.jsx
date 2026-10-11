function TuneBookList({ tunes, activeTuneId, onSelectTune }) {
  return (
    <nav className="tunebook no-print" aria-labelledby="tunebook-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">TUNEBOOK</p>
          <h2 id="tunebook-title">Tunes</h2>
        </div>
        <span className="preview-badge">{tunes.length} in book</span>
      </div>
      {tunes.length === 0 ? (
        <p className="placeholder-copy">No tunes in this book yet.</p>
      ) : (
        <ul className="tunebook-list">
          {tunes.map((tune) => {
            const isActive = tune.id === activeTuneId
            return (
              <li key={tune.id}>
                <button
                  className={isActive ? 'tune-item is-active' : 'tune-item'}
                  type="button"
                  onClick={() => onSelectTune(tune.id)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="tune-item-title">{tune.title}</span>
                  <span className="tune-item-type">{tune.type}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )
}

export default TuneBookList
