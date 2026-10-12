import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { compactGraceNoteSpacing } from "../utils/compactGraceNoteSpacing.js";

interface TuneViewerProps {
  abcString: string;
}

function TuneViewer({ abcString }: TuneViewerProps): ReactElement {
  const paperRef = useRef<HTMLDivElement>(null);
  const renderErrorRef = useRef<HTMLParagraphElement>(null);
  const hasScore = Boolean(abcString.trim());

  useEffect(() => {
    const paper = paperRef.current;
    const renderError = renderErrorRef.current;
    if (!paper || !renderError) return;
    const scoreContainer = paper;
    const renderErrorElement = renderError;

    let isCurrentRender = true;
    scoreContainer.replaceChildren();
    renderErrorElement.hidden = true;
    renderErrorElement.textContent = "";

    if (!abcString.trim()) {
      return () => {
        isCurrentRender = false;
      };
    }

    async function renderScore(): Promise<void> {
      try {
        const { default: abcjs } = await import("abcjs");
        if (!isCurrentRender) return;

        abcjs.renderAbc(scoreContainer, abcString, {
          responsive: "resize",
          add_classes: true,
        });
        const scoreSvg = scoreContainer.querySelector<SVGSVGElement>("svg");
        if (scoreSvg) compactGraceNoteSpacing(scoreSvg);
      } catch (error) {
        if (!isCurrentRender) return;
        renderErrorElement.textContent = `Could not render the score: ${
          error instanceof Error
            ? error.message
            : "Could not render this ABC notation."
        }`;
        renderErrorElement.hidden = false;
      }
    }

    void renderScore();

    return () => {
      isCurrentRender = false;
    };
  }, [abcString]);

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
        <div className="score" ref={paperRef} hidden={!hasScore} />
        <p
          className="render-error"
          id="render-error"
          role="alert"
          ref={renderErrorRef}
          hidden
        />
      </div>
    </section>
  );
}

export default TuneViewer;
