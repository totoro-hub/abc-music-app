const DEFAULT_GRACE_NOTE_SPACING = 10;
const COMPACT_GRACE_NOTE_SPACING = 5.5;
const STEM_X_OFFSET = 6;

// These offsets match the current ABCJS SVG output for grace-note heads and beams.
function getTranslateX(element: SVGElement): number | null {
  const match = element
    .getAttribute("transform")
    ?.match(/translate\(\s*(-?[\d.]+)/);

  return match ? Number(match[1]) : null;
}

function getHorizontalBounds(path: SVGPathElement): {
  left: number;
  right: number;
} | null {
  const pathData = path.getAttribute("d");
  if (!pathData) return null;

  const coordinates = [
    ...pathData.matchAll(/[MmLl]\s*(-?(?:\d+(?:\.\d*)?|\.\d+))/g),
  ].map((match) => Number(match[1]));

  if (coordinates.length < 2) return null;

  return {
    left: Math.min(...coordinates),
    right: Math.max(...coordinates),
  };
}

function getStemX(stem: SVGElement): number | null {
  if (stem.localName === "line") {
    const x1Attribute = stem.getAttribute("x1");
    const x2Attribute = stem.getAttribute("x2");
    if (x1Attribute === null || x2Attribute === null) return null;

    const x1 = Number(x1Attribute);
    const x2 = Number(x2Attribute);
    return Number.isFinite(x1) && Number.isFinite(x2) ? (x1 + x2) / 2 : null;
  }

  const match = stem
    .getAttribute("d")
    ?.match(/^M\s*(-?(?:\d+(?:\.\d*)?|\.\d+))/);

  return match ? Number(match[1]) : null;
}

function shiftGraceStemHorizontally(stem: SVGElement, amount: number): void {
  if (stem.localName === "line") {
    for (const attribute of ["x1", "x2"]) {
      const attributeValue = stem.getAttribute(attribute);
      if (attributeValue === null) continue;

      const value = Number(attributeValue);
      if (Number.isFinite(value))
        stem.setAttribute(attribute, String(value + amount));
    }
    return;
  }

  if (stem.localName === "path") {
    shiftPathHorizontally(stem as SVGPathElement, amount);
  }
}

function shiftGraceHead(head: SVGPathElement, amount: number): void {
  if (!amount) return;

  const transform = head.getAttribute("transform");
  if (!transform) return;

  const match = transform.match(/^translate\(\s*(-?[\d.]+)/);
  if (!match) return;

  const adjustedTranslateX = Number(match[1]) + amount;
  head.setAttribute(
    "transform",
    transform.replace(
      /^translate\(\s*-?[\d.]+/,
      `translate(${adjustedTranslateX}`,
    ),
  );
}

function shiftPathHorizontally(path: SVGPathElement, amount: number): void {
  if (!amount) return;

  const pathData = path.getAttribute("d");
  if (!pathData) return;

  path.setAttribute(
    "d",
    pathData.replace(
      /([ML])\s*(-?(?:\d+(?:\.\d*)?|\.\d+))(\s+-?(?:\d+(?:\.\d*)?|\.\d+))/g,
      (_, command, x, remainingCoordinates) =>
        `${command} ${Number(x) + amount}${remainingCoordinates}`,
    ),
  );
}

function scalePathHorizontally(
  path: SVGPathElement,
  scale: number,
  pivotX: number,
): void {
  const pathData = path.getAttribute("d");
  if (!pathData) return;

  path.setAttribute(
    "d",
    pathData.replace(
      /([ML])\s*(-?(?:\d+(?:\.\d*)?|\.\d+))(\s+-?(?:\d+(?:\.\d*)?|\.\d+))/g,
      (_, command, x, remainingCoordinates) =>
        `${command} ${pivotX + (Number(x) - pivotX) * scale}${remainingCoordinates}`,
    ),
  );
}

function compactGraceGroup(
  note: SVGElement,
  graceHeads: SVGPathElement[],
): void {
  const stemElements = Array.from(
    note.querySelectorAll<SVGElement>(".abcjs-stem"),
  );
  const availableStems = stemElements.flatMap((element) => {
    const x = getStemX(element);
    return x === null ? [] : [{ element, x }];
  });

  if (availableStems.length < graceHeads.length) return;

  const graceHeadPositions = graceHeads
    .map(getTranslateX)
    .filter((position): position is number => position !== null);
  if (graceHeadPositions.length !== graceHeads.length) return;

  const unusedStems = new Set(availableStems);
  const graceStems: SVGElement[] = [];
  for (const headPosition of graceHeadPositions) {
    const expectedStemX = headPosition + STEM_X_OFFSET;
    const matchingStem = [...unusedStems].reduce((closestStem, stem) =>
      Math.abs(stem.x - expectedStemX) < Math.abs(closestStem.x - expectedStemX)
        ? stem
        : closestStem,
    );

    if (Math.abs(matchingStem.x - expectedStemX) > 2) return;
    unusedStems.delete(matchingStem);
    graceStems.push(matchingStem.element);
  }
  if (graceStems.length !== graceHeads.length) return;

  const horizontalStep =
    COMPACT_GRACE_NOTE_SPACING / DEFAULT_GRACE_NOTE_SPACING;

  graceHeads.forEach((head, index) => {
    const shift =
      (graceHeads.length - index - 1) *
      (DEFAULT_GRACE_NOTE_SPACING - COMPACT_GRACE_NOTE_SPACING);
    shiftGraceHead(head, shift);
    shiftGraceStemHorizontally(graceStems[index], shift);
  });

  const parent = note.parentElement;
  if (!parent) return;

  const firstGraceX = graceHeadPositions[0] + STEM_X_OFFSET;
  const lastGraceX =
    graceHeadPositions[graceHeadPositions.length - 1] + STEM_X_OFFSET;
  const expectedWidth = lastGraceX - firstGraceX;
  const beam = Array.from(
    parent.querySelectorAll<SVGPathElement>(".abcjs-beam-elem"),
  )
    .flatMap((element) => {
      const bounds = getHorizontalBounds(element);
      return bounds ? [{ element, bounds }] : [];
    })
    .find(
      ({ bounds }) =>
        Math.abs(bounds.left - firstGraceX) < 4 &&
        Math.abs(bounds.right - lastGraceX) < 4 &&
        Math.abs(bounds.right - bounds.left - expectedWidth) < 4,
    );

  if (beam) {
    scalePathHorizontally(beam.element, horizontalStep, lastGraceX);
  }
}

export function compactGraceNoteSpacing(scoreSvg: SVGSVGElement): void {
  scoreSvg.querySelectorAll<SVGElement>(".abcjs-note").forEach((note) => {
    const graceHeads = Array.from(
      note.querySelectorAll<SVGPathElement>(
        ":scope > .abcjs-notehead[transform]",
      ),
    );

    if (graceHeads.length > 1) compactGraceGroup(note, graceHeads);
  });
}
