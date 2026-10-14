import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import type { TuneObject } from "abcjs";
import { compactGraceNoteSpacing } from "../utils/compactGraceNoteSpacing.js";
import { expandStaffLineSpacing } from "../utils/expandStaffLineSpacing.js";

const FONT_FAMILY = "Verdana, Geneva, sans-serif";

interface TuneViewerProps {
  abcString: string;
  onTuneRendered?: (abcString: string, tune: TuneObject | null) => void;
}

function TuneViewer({
  abcString,
  onTuneRendered,
}: TuneViewerProps): ReactElement {
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
    onTuneRendered?.(abcString, null);
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

        const globalPipingConfig = `
%%bagpipes
%%graceslurs 0
`;

        const tunes = abcjs.renderAbc(
          scoreContainer,
          globalPipingConfig + abcString,
          {
            responsive: "resize",
            add_classes: true,
            expandToWidest: true, // Ensures the score takes up the full width of the container
            paddingleft: 0,
            paddingright: 0,
            lineThickness: 0.6,
            format: {
              titlefont: `${FONT_FAMILY} 32 bold`,
              composerfont: `${FONT_FAMILY} 20`,
              subtitlefont: `${FONT_FAMILY} 20`,
              headerfont: `${FONT_FAMILY} 20`,
              footerfont: `${FONT_FAMILY} 20`,
              infofont: `${FONT_FAMILY} 20`,
            },
          },
        );
        if (isCurrentRender) onTuneRendered?.(abcString, tunes[0] ?? null);
        const scoreSvg = scoreContainer.querySelector<SVGSVGElement>("svg");
        if (scoreSvg) {
          compactGraceNoteSpacing(scoreSvg);
          expandStaffLineSpacing(scoreSvg);
        }
      } catch (error) {
        if (!isCurrentRender) return;
        onTuneRendered?.(abcString, null);
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
  }, [abcString, onTuneRendered]);

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
