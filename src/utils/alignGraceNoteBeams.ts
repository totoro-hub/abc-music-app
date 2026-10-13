interface GraceBeamGroup {
  beam: SVGPathElement;
  stems: SVGElement[];
}

function getStemCoordinates(stem: SVGElement): number[][] {
  if (stem.localName !== "path") return [];

  return [
    ...(stem.getAttribute("d") ?? "").matchAll(
      /[ML]\s*(-?(?:\d+(?:\.\d*)?|\.\d+))\s+(-?(?:\d+(?:\.\d*)?|\.\d+))/gi,
    ),
  ].map((match) => [Number(match[1]), Number(match[2])]);
}

function getStemEndpoints(
  stem: SVGElement,
): { startY: number; endY: number } | null {
  if (stem.localName === "line") {
    const y1Attribute = stem.getAttribute("y1");
    const y2Attribute = stem.getAttribute("y2");
    if (y1Attribute === null || y2Attribute === null) return null;

    const y1 = Number(y1Attribute);
    const y2 = Number(y2Attribute);
    if (!Number.isFinite(y1) || !Number.isFinite(y2)) return null;

    return { startY: y1, endY: y2 };
  }

  if (stem.localName !== "path") return null;
  const yPositions = getStemCoordinates(stem).map(([, y]) => y);
  if (yPositions.length < 2) return null;

  return { startY: Math.min(...yPositions), endY: Math.max(...yPositions) };
}

function setStemEndpoints(
  stem: SVGElement,
  startY: number,
  endY: number,
): void {
  if (stem.localName === "line") {
    const y1 = Number(stem.getAttribute("y1"));
    if (y1 <= Number(stem.getAttribute("y2"))) {
      stem.setAttribute("y1", String(startY));
      stem.setAttribute("y2", String(endY));
    } else {
      stem.setAttribute("y1", String(endY));
      stem.setAttribute("y2", String(startY));
    }
    return;
  }

  if (stem.localName !== "path") return;
  const pathData = stem.getAttribute("d");
  if (!pathData) return;
  const endpoints = getStemEndpoints(stem);
  if (!endpoints) return;

  const topY = Math.min(startY, endY);
  const bottomY = Math.max(startY, endY);
  const number = "-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
  stem.setAttribute(
    "d",
    pathData.replace(
      new RegExp(`([ML]\\s*${number}\\s+)(${number})`, "gi"),
      (_, prefix: string, y: string) => {
        const position = Number(y);
        if (position === endpoints.startY) return `${prefix}${topY}`;
        if (position === endpoints.endY) return `${prefix}${bottomY}`;
        return `${prefix}${y}`;
      },
    ),
  );
}

function setStemTop(stem: SVGElement, topY: number): void {
  const endpoints = getStemEndpoints(stem);
  if (!endpoints) return;

  if (endpoints.startY <= endpoints.endY) {
    setStemEndpoints(stem, topY, endpoints.endY);
  } else {
    setStemEndpoints(stem, endpoints.startY, topY);
  }
}

function getBeamBars(beam: SVGPathElement): RegExpMatchArray[] {
  const pathData = beam.getAttribute("d");
  if (!pathData) return [];

  const number = "-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
  const beamBarPattern = new RegExp(
    `M\\s*(${number})\\s+(${number})\\s*L\\s*(${number})\\s+(${number})\\s*L\\s*(${number})\\s+(${number})\\s*L\\s*(${number})\\s+(${number})\\s*z`,
    "gi",
  );
  return [...pathData.matchAll(beamBarPattern)];
}

function getPrimaryBeamTop(beam: SVGPathElement): number | null {
  const firstBar = getBeamBars(beam)[0];
  if (!firstBar) return null;

  const [, leftTopY, , rightTopY] = firstBar.slice(1).map(Number);
  return (leftTopY + rightTopY) / 2;
}

function flattenBeamBars(
  beam: SVGPathElement,
  sharedTopY: number,
): number | null {
  const pathData = beam.getAttribute("d");
  const beamBars = getBeamBars(beam);
  if (!pathData || !beamBars.length) return null;

  const primaryTopY = getPrimaryBeamTop(beam);
  if (primaryTopY === null) return null;
  const verticalShift = sharedTopY - primaryTopY;

  let flattenedPath = pathData;
  let primaryBeamBottomY: number | null = null;

  beamBars.forEach((bar, index) => {
    const [leftX, leftTopY, rightX, rightTopY, rightBottomX, rightBottomY, leftBottomX, leftBottomY] =
      bar.slice(1).map(Number);
    const topY = (leftTopY + rightTopY) / 2 + verticalShift;
    const bottomY = (leftBottomY + rightBottomY) / 2 + verticalShift;
    const flattenedBar = `M ${leftX} ${topY} L ${rightX} ${topY} L ${rightBottomX} ${bottomY} L ${leftBottomX} ${bottomY} z`;

    flattenedPath = flattenedPath.replace(bar[0], flattenedBar);
    if (index === 0) primaryBeamBottomY = bottomY;
  });

  beam.setAttribute("d", flattenedPath);
  return primaryBeamBottomY;
}

export function alignGraceNoteBeams(groups: GraceBeamGroup[]): void {
  const beamTops = groups
    .map(({ beam }) => getPrimaryBeamTop(beam))
    .filter((top): top is number => top !== null);
  if (!beamTops.length) return;

  const sharedTopY = Math.min(...beamTops);
  groups.forEach(({ beam, stems }) => {
    const stemTopY = flattenBeamBars(beam, sharedTopY);
    if (stemTopY === null) return;

    stems.forEach((stem) => setStemTop(stem, stemTopY));
  });
}

export type { GraceBeamGroup };
