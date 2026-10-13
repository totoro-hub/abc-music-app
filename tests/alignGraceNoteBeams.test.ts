import { describe, expect, it } from "vitest";
import abcjs from "abcjs";
import { compactGraceNoteSpacing } from "../src/utils/compactGraceNoteSpacing.js";

function getStemTop(stem: SVGElement): number {
  if (stem.localName === "line") {
    return Math.min(
      Number(stem.getAttribute("y1")),
      Number(stem.getAttribute("y2")),
    );
  }

  const coordinates = [
    ...(stem.getAttribute("d") ?? "").matchAll(
      /[ML]\s*-?[\d.]+\s+(-?[\d.]+)/g,
    ),
  ].map((match) => Number(match[1]));

  return Math.min(...coordinates);
}

function getStemX(stem: SVGElement): number {
  if (stem.localName === "line") return Number(stem.getAttribute("x1"));

  return Number(stem.getAttribute("d")?.match(/^M\s*(-?[\d.]+)/)?.[1]);
}

describe("grace beam alignment", () => {
  it("aligns separate grouped grace-note beams on one staff", () => {
    const output = document.createElement("div");
    const abcString = [
      "X:1",
      "T:Test",
      "M:4/4",
      "K:D",
      "%%bagpipes",
      "{G/d/G/e/}A2 {g/d/g/e/}B2|",
    ].join("\n");
    abcjs.renderAbc(output, abcString, { add_classes: true });

    const scoreSvg = output.querySelector("svg");
    expect(scoreSvg).not.toBeNull();
    const groupedNotes = [
      ...scoreSvg!.querySelectorAll<SVGGElement>(".abcjs-note"),
    ].filter(
      (note) =>
        note.querySelectorAll(":scope > .abcjs-notehead[transform]").length > 1,
    );
    expect(groupedNotes).toHaveLength(2);

    compactGraceNoteSpacing(scoreSvg!);

    const stemTops = groupedNotes.flatMap((note) =>
      [...note.querySelectorAll<SVGElement>(".abcjs-stem")]
        .sort((first, second) => getStemX(first) - getStemX(second))
        .slice(0, 4)
        .map(getStemTop),
    );
    expect(new Set(stemTops).size).toBe(1);
  });
});
