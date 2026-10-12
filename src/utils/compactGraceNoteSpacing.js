const DEFAULT_GRACE_NOTE_SPACING = 10;
const COMPACT_GRACE_NOTE_SPACING = 5.5;
const STEM_X_OFFSET = 6;

// These offsets match the current ABCJS SVG output for grace-note heads and beams.
function getTranslateX(element) {
  const match = element
    .getAttribute("transform")
    ?.match(/translate\(\s*(-?[\d.]+)/);

  return match ? Number(match[1]) : null;
}

function getHorizontalBounds(path) {
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

function getStemX(stem) {
  const match = stem
    .getAttribute("d")
    ?.match(/^M\s*(-?(?:\d+(?:\.\d*)?|\.\d+))/);

  return match ? Number(match[1]) : null;
}

function shiftGraceHead(head, amount) {
  if (!amount) return;

  const transform = head.getAttribute("transform");
  const match = transform?.match(/^translate\(\s*(-?[\d.]+)/);
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

function shiftPathHorizontally(path, amount) {
  if (!amount) return;

  path.setAttribute(
    "d",
    path
      .getAttribute("d")
      .replace(
        /([ML])\s*(-?(?:\d+(?:\.\d*)?|\.\d+))(\s+-?(?:\d+(?:\.\d*)?|\.\d+))/g,
        (_, command, x, remainingCoordinates) =>
          `${command} ${Number(x) + amount}${remainingCoordinates}`,
      ),
  );
}

function scalePathHorizontally(path, scale, pivotX) {
  path.setAttribute(
    "d",
    path
      .getAttribute("d")
      .replace(
        /([ML])\s*(-?(?:\d+(?:\.\d*)?|\.\d+))(\s+-?(?:\d+(?:\.\d*)?|\.\d+))/g,
        (_, command, x, remainingCoordinates) =>
          `${command} ${pivotX + (Number(x) - pivotX) * scale}${remainingCoordinates}`,
      ),
  );
}

function compactGraceGroup(note, graceHeads) {
  const availableStems = [...note.children]
    .filter((child) => child.classList.contains("abcjs-stem"))
    .map((element) => ({ element, x: getStemX(element) }))
    .filter(({ x }) => x !== null);

  if (availableStems.length < graceHeads.length) return;

  const graceHeadPositions = graceHeads.map(getTranslateX);
  if (graceHeadPositions.some((position) => position === null)) return;

  const unusedStems = new Set(availableStems);
  const graceStems = graceHeadPositions.map((headPosition) => {
    const expectedStemX = headPosition + STEM_X_OFFSET;
    const matchingStem = [...unusedStems].reduce((closestStem, stem) =>
      Math.abs(stem.x - expectedStemX) < Math.abs(closestStem.x - expectedStemX)
        ? stem
        : closestStem,
    );

    if (Math.abs(matchingStem.x - expectedStemX) > 2) return null;
    unusedStems.delete(matchingStem);
    return matchingStem.element;
  });

  if (graceStems.some((stem) => stem === null)) return;

  const horizontalStep =
    COMPACT_GRACE_NOTE_SPACING / DEFAULT_GRACE_NOTE_SPACING;

  graceHeads.forEach((head, index) => {
    const shift =
      (graceHeads.length - index - 1) *
      (DEFAULT_GRACE_NOTE_SPACING - COMPACT_GRACE_NOTE_SPACING);
    shiftGraceHead(head, shift);
    shiftPathHorizontally(graceStems[index], shift);
  });

  const parent = note.parentElement;
  if (!parent) return;

  const firstGraceX = graceHeadPositions[0] + STEM_X_OFFSET;
  const lastGraceX =
    graceHeadPositions[graceHeadPositions.length - 1] + STEM_X_OFFSET;
  const expectedWidth = lastGraceX - firstGraceX;
  const beam = [...parent.querySelectorAll(".abcjs-beam-elem")]
    .map((element) => ({
      element,
      bounds: getHorizontalBounds(element),
    }))
    .filter(({ bounds }) => bounds)
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

export function compactGraceNoteSpacing(scoreSvg) {
  scoreSvg.querySelectorAll(".abcjs-note").forEach((note) => {
    const graceHeads = [...note.children].filter(
      (child) =>
        child.classList.contains("abcjs-notehead") &&
        child.hasAttribute("transform"),
    );

    if (graceHeads.length > 1) compactGraceGroup(note, graceHeads);
  });
}
