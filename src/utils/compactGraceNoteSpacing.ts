import {
  alignGraceNoteBeams,
  type GraceBeamGroup,
} from "./alignGraceNoteBeams.js";

const DEFAULT_GRACE_NOTE_SPACING = 10;
const COMPACT_GRACE_NOTE_SPACING = 7;
const STEM_X_OFFSET = 6;
const LEDGER_ALIGNMENT_TOLERANCE = 4;

// These offsets match the current ABCJS SVG output for grace-note heads and beams.
function getTranslateX(element: SVGElement): number | null {
  const match = element
    .getAttribute("transform")
    ?.match(/translate\(\s*(-?[\d.]+)/);

  return match ? Number(match[1]) : null;
}

function getHorizontalBounds(element: SVGElement): {
  left: number;
  right: number;
} | null {
  if (element.localName === "line") {
    const x1Attribute = element.getAttribute("x1");
    const x2Attribute = element.getAttribute("x2");
    if (x1Attribute === null || x2Attribute === null) return null;

    const x1 = Number(x1Attribute);
    const x2 = Number(x2Attribute);
    if (!Number.isFinite(x1) || !Number.isFinite(x2)) return null;

    return { left: Math.min(x1, x2), right: Math.max(x1, x2) };
  }

  if (element.localName !== "path") return null;
  const pathData = element.getAttribute("d");
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

function shiftSvgElementHorizontally(
  element: SVGElement,
  amount: number,
): void {
  if (element.localName === "line") {
    for (const attribute of ["x1", "x2"]) {
      const attributeValue = element.getAttribute(attribute);
      if (attributeValue === null) continue;

      const value = Number(attributeValue);
      if (Number.isFinite(value))
        element.setAttribute(attribute, String(value + amount));
    }
    return;
  }

  if (element.localName === "path") {
    shiftPathHorizontally(element as SVGPathElement, amount);
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

function shiftGraceLedgerLines(
  note: SVGElement,
  headPosition: number,
  amount: number,
): void {
  if (!amount) return;

  note.querySelectorAll<SVGElement>(".abcjs-ledger").forEach((ledger) => {
    const bounds = getHorizontalBounds(ledger);
    if (!bounds) return;

    const center = (bounds.left + bounds.right) / 2;
    if (Math.abs(center - headPosition) <= LEDGER_ALIGNMENT_TOLERANCE) {
      shiftSvgElementHorizontally(ledger, amount);
    }
  });
}

function compactGraceGroup(
  note: SVGElement,
  graceHeads: SVGPathElement[],
): GraceBeamGroup | null {
  const stemElements = Array.from(
    note.querySelectorAll<SVGElement>(".abcjs-stem"),
  );
  const availableStems = stemElements.flatMap((element) => {
    const x = getStemX(element);
    return x === null ? [] : [{ element, x }];
  });

  if (availableStems.length < graceHeads.length) return null;

  const graceHeadPositions = graceHeads
    .map(getTranslateX)
    .filter((position): position is number => position !== null);
  if (graceHeadPositions.length !== graceHeads.length) return null;

  const unusedStems = new Set(availableStems);
  const graceStems: SVGElement[] = [];
  for (const headPosition of graceHeadPositions) {
    const expectedStemX = headPosition + STEM_X_OFFSET;
    const matchingStem = [...unusedStems].reduce((closestStem, stem) =>
      Math.abs(stem.x - expectedStemX) < Math.abs(closestStem.x - expectedStemX)
        ? stem
        : closestStem,
    );

    if (Math.abs(matchingStem.x - expectedStemX) > 2) return null;
    unusedStems.delete(matchingStem);
    graceStems.push(matchingStem.element);
  }
  if (graceStems.length !== graceHeads.length) return null;

  const horizontalStep =
    COMPACT_GRACE_NOTE_SPACING / DEFAULT_GRACE_NOTE_SPACING;

  graceHeads.forEach((head, index) => {
    const shift =
      (graceHeads.length - index - 1) *
      (DEFAULT_GRACE_NOTE_SPACING - COMPACT_GRACE_NOTE_SPACING);
    shiftGraceHead(head, shift);
    shiftSvgElementHorizontally(graceStems[index], shift);
    shiftGraceLedgerLines(note, graceHeadPositions[index], shift);
  });

  const parent = note.parentElement;
  if (!parent) return null;

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

  if (!beam) return null;

  scalePathHorizontally(beam.element, horizontalStep, lastGraceX);
  return { beam: beam.element, stems: graceStems };
}

export function compactGraceNoteSpacing(scoreSvg: SVGSVGElement): void {
  const staffGroups = new Map<Element, GraceBeamGroup[]>();

  scoreSvg.querySelectorAll<SVGElement>(".abcjs-note").forEach((note) => {
    const graceHeads = Array.from(
      note.querySelectorAll<SVGPathElement>(
        ":scope > .abcjs-notehead[transform]",
      ),
    );

    if (graceHeads.length < 2) return;

    const beamGroup = compactGraceGroup(note, graceHeads);
    if (!beamGroup) return;

    const staff = note.closest(".abcjs-staff-wrapper") ?? scoreSvg;
    staffGroups.set(staff, [...(staffGroups.get(staff) ?? []), beamGroup]);
  });

  staffGroups.forEach(alignGraceNoteBeams);
}
