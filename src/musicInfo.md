# Music notation terms

When ABCJS renders ABC notation, it draws the score as separate SVG elements.
These are the names of the main parts of a note and its surrounding marks:

- **Notehead**: The oval-shaped part of a note. ABCJS draws it as an SVG
  `<path>` with the `abcjs-notehead` class.
- **Stem**: The straight line attached to a notehead. Depending on the browser,
  ABCJS may draw it as an SVG `<path>` or `<line>` with the `abcjs-stem` class.
- **Beam**: The thick bar connecting the stems of short notes, showing they
  belong together rhythmically. ABCJS draws it as a `<path>` with the
  `abcjs-beam-elem` class.
- **Ledger line**: A short line extending the staff for a note above or below
  it. A ledger line can pass through a notehead. ABCJS draws it as a `<path>`
  with the `abcjs-ledger` class.

These terms describe the visible music. In the browser, ABCJS represents the
parts as SVG elements so the app can adjust their positions for display and PDF
export.
