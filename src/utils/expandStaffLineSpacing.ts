const STAFF_LINE_SPACING_SCALE = 1.25;
const APPLIED_ATTRIBUTE = "data-staff-line-spacing-expanded";
const NOTEHEAD_WIDTH_SCALE = 1.2;
const NOTEHEAD_WIDTH_ATTRIBUTE = "data-notehead-width-expanded";

export function expandStaffLineSpacing(scoreSvg: SVGSVGElement): void {
  let previousSystemsGrowth = 0;

  scoreSvg
    .querySelectorAll<SVGGElement>(".abcjs-staff-wrapper")
    .forEach((staffSystem) => {
      if (staffSystem.hasAttribute(APPLIED_ATTRIBUTE)) return;

      const bounds = staffSystem.getBBox();
      if (!bounds.height) return;

      const verticalShift = previousSystemsGrowth;
      const verticalTransform = `translate(0 ${verticalShift}) translate(0 ${bounds.y}) scale(1 ${STAFF_LINE_SPACING_SCALE}) translate(0 ${-bounds.y})`;
      const existingTransform = staffSystem.getAttribute("transform");

      staffSystem.setAttribute(
        "transform",
        existingTransform
          ? `${existingTransform} ${verticalTransform}`
          : verticalTransform,
      );
      staffSystem.setAttribute(APPLIED_ATTRIBUTE, "");
      previousSystemsGrowth += bounds.height * (STAFF_LINE_SPACING_SCALE - 1);
    });

  widenNoteheads(scoreSvg);
  expandViewBoxToFitScore(scoreSvg);
}

function widenNoteheads(scoreSvg: SVGSVGElement): void {
  scoreSvg
    .querySelectorAll<SVGGraphicsElement>(
      `.abcjs-notehead:not([${NOTEHEAD_WIDTH_ATTRIBUTE}])`,
    )
    .forEach((notehead) => {
      const bounds = notehead.getBBox();
      const parent = notehead.parentNode;
      if (!bounds.width || !parent) return;

      const wrapper = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      const existingTransform = notehead.getAttribute("transform");

      if (existingTransform) {
        wrapper.setAttribute("transform", existingTransform);
        notehead.removeAttribute("transform");
      }

      parent.insertBefore(wrapper, notehead);
      wrapper.appendChild(notehead);

      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      notehead.setAttribute(
        "transform",
        `translate(${centerX} ${centerY}) scale(${NOTEHEAD_WIDTH_SCALE} 1) translate(${-centerX} ${-centerY})`,
      );
      notehead.setAttribute(NOTEHEAD_WIDTH_ATTRIBUTE, "");
    });
}

function expandViewBoxToFitScore(scoreSvg: SVGSVGElement): void {
  const viewBoxAttribute = scoreSvg.getAttribute("viewBox");
  if (!viewBoxAttribute) return;

  const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] =
    viewBoxAttribute.trim().split(/[\s,]+/).map(Number);
  if (
    ![viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight].every(Number.isFinite) ||
    viewBoxWidth <= 0 ||
    viewBoxHeight <= 0
  ) {
    return;
  }

  const bounds = scoreSvg.getBBox();
  const expandedY = Math.min(viewBoxY, bounds.y);
  const expandedBottom = Math.max(
    viewBoxY + viewBoxHeight,
    bounds.y + bounds.height,
  );
  const expandedHeight = expandedBottom - expandedY;

  if (expandedY !== viewBoxY || expandedHeight !== viewBoxHeight) {
    scoreSvg.setAttribute(
      "viewBox",
      `${viewBoxX} ${expandedY} ${viewBoxWidth} ${expandedHeight}`,
    );
  }

  const scoreContainer = scoreSvg.parentElement;
  if (scoreContainer) {
    scoreContainer.style.paddingBottom = `${(expandedHeight / viewBoxWidth) * 100}%`;
  }
}
