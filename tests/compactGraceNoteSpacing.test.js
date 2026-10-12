import { describe, expect, it } from "vitest";
import { compactGraceNoteSpacing } from "../src/utils/compactGraceNoteSpacing.js";

function renderGraceNoteScore(graceNoteCount) {
  const scoreSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  const graceNotes = Array.from(
    { length: graceNoteCount },
    (_, index) => `
      <path class="abcjs-notehead" transform="translate(${100 + index * 10} 10) scale(0.6,0.6) translate(-${100 + index * 10} -10)" />
    `,
  ).join("");
  const graceStems = Array.from(
    { length: graceNoteCount },
    (_, index) =>
      `<path class="abcjs-stem" d="M${106 + index * 10} 20 L${106 + index * 10} 40" />`,
  ).join("");
  const mainStemX = 106 + graceNoteCount * 10;
  const lastGraceX = 106 + (graceNoteCount - 1) * 10;
  scoreSvg.innerHTML = `
      <g class="abcjs-staff-wrapper">
        <g class="abcjs-note">
          <path class="abcjs-notehead" />
          ${graceNotes}
          ${graceStems}
          <path class="abcjs-stem" d="M${mainStemX} 20 L${mainStemX} 40" />
        </g>
        <path class="abcjs-beam-elem" d="M106 10 L${lastGraceX} 0 L${lastGraceX} 2 L106 12 z" />
      </g>
    `;

  return {
    scoreSvg,
    mainHead: scoreSvg.querySelector(".abcjs-notehead"),
    mainStem: [...scoreSvg.querySelectorAll(".abcjs-stem")].at(-1),
    graceHeads: [...scoreSvg.querySelectorAll(".abcjs-notehead[transform]")],
    graceStems: [...scoreSvg.querySelectorAll(".abcjs-stem")].slice(
      0,
      graceNoteCount,
    ),
    beam: scoreSvg.querySelector(".abcjs-beam-elem"),
    lastGraceX,
  };
}

describe("compactGraceNoteSpacing", () => {
  it.each([2, 3, 4])(
    "compacts a group of %i grace notes without moving the main note",
    (graceNoteCount) => {
      const { scoreSvg, mainHead, graceHeads } =
        renderGraceNoteScore(graceNoteCount);
      compactGraceNoteSpacing(scoreSvg);

      expect({
        mainHeadTransform: mainHead.getAttribute("transform"),
        graceHeadTransforms: graceHeads.map((head) =>
          head.getAttribute("transform"),
        ),
      }).toEqual({
        mainHeadTransform: null,
        graceHeadTransforms: graceHeads.map(
          (_, index) =>
            `translate(${100 + index * 10 + (graceNoteCount - index - 1) * 4.5} 10) scale(0.6,0.6) translate(-${100 + index * 10} -10)`,
        ),
      });
    },
  );

  it("compacts grace stems and their beam without moving the main stem", () => {
    const { scoreSvg, mainStem, graceStems, beam, lastGraceX } =
      renderGraceNoteScore(4);
    compactGraceNoteSpacing(scoreSvg);

    expect({
      mainStemTransform: mainStem.getAttribute("transform"),
      graceStemPaths: graceStems.map((stem) => stem.getAttribute("d")),
      beamPath: beam.getAttribute("d"),
    }).toEqual({
      mainStemTransform: null,
      graceStemPaths: [
        "M 119.5 20 L 119.5 40",
        "M 125 20 L 125 40",
        "M 130.5 20 L 130.5 40",
        "M136 20 L136 40",
      ],
      beamPath: `M ${lastGraceX - (lastGraceX - 106) * 0.55} 10 L ${lastGraceX} 0 L ${lastGraceX} 2 L ${lastGraceX - (lastGraceX - 106) * 0.55} 12 z`,
    });
  });
});
