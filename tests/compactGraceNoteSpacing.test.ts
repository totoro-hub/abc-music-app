import { describe, expect, it } from "vitest";
import { compactGraceNoteSpacing } from "../src/utils/compactGraceNoteSpacing.js";

function renderGraceNoteScore(graceNoteCount: number) {
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
    (graceNoteCount: number) => {
      const { scoreSvg, mainHead, graceHeads } =
        renderGraceNoteScore(graceNoteCount);
      compactGraceNoteSpacing(scoreSvg);

      expect({
        mainHeadTransform: mainHead!.getAttribute("transform"),
        graceHeadTransforms: graceHeads.map((head) =>
          head.getAttribute("transform"),
        ),
      }).toEqual({
        mainHeadTransform: null,
        graceHeadTransforms: graceHeads.map(
          (_, index) =>
            `translate(${100 + index * 10 + (graceNoteCount - index - 1) * 3} 10) scale(0.6,0.6) translate(-${100 + index * 10} -10)`,
        ),
      });
    },
  );

  it("compacts grace stems and their beam without moving the main stem", () => {
    const { scoreSvg, mainStem, graceStems, beam, lastGraceX } =
      renderGraceNoteScore(4);
    compactGraceNoteSpacing(scoreSvg);

    expect({
      mainStemTransform: mainStem!.getAttribute("transform"),
      graceStemPaths: graceStems.map((stem) => stem.getAttribute("d")),
      beamPath: beam!.getAttribute("d"),
    }).toEqual({
      mainStemTransform: null,
      graceStemPaths: [
        "M 115 7 L 115 40",
        "M 122 7 L 122 40",
        "M 129 7 L 129 40",
        "M136 7 L136 40",
      ],
      beamPath: `M ${lastGraceX - (lastGraceX - 106) * 0.7} 5 L ${lastGraceX} 5 L ${lastGraceX} 7 L ${lastGraceX - (lastGraceX - 106) * 0.7} 7 z`,
    });
  });

  it("compacts grace stems nested inside a group", () => {
    const { scoreSvg, graceHeads, graceStems } = renderGraceNoteScore(4);
    const note = scoreSvg.querySelector(".abcjs-note")!;
    const stemGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );

    graceStems.forEach((stem) => stemGroup.append(stem));
    note.insertBefore(stemGroup, note.lastElementChild);
    compactGraceNoteSpacing(scoreSvg);

    expect(graceHeads.map((head) => head.getAttribute("transform"))).toEqual(
      graceHeads.map(
        (_, index) =>
          `translate(${100 + index * 10 + (3 - index) * 3} 10) scale(0.6,0.6) translate(-${100 + index * 10} -10)`,
      ),
    );
    expect(graceStems.map((stem) => stem.getAttribute("d"))).toEqual([
      "M 115 7 L 115 40",
      "M 122 7 L 122 40",
      "M 129 7 L 129 40",
      "M136 7 L136 40",
    ]);
  });

  it("compacts grace stems rendered as SVG lines", () => {
    const { scoreSvg, graceHeads, graceStems } = renderGraceNoteScore(4);
    const graceLines = graceStems.map((stem) => {
      const stemX = Number(stem.getAttribute("d")?.match(/^M\s*([\d.]+)/)?.[1]);
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("class", "abcjs-stem");
      line.setAttribute("x1", String(stemX));
      line.setAttribute("x2", String(stemX));
      line.setAttribute("y1", "20");
      line.setAttribute("y2", "40");
      stem.replaceWith(line);
      return line;
    });

    compactGraceNoteSpacing(scoreSvg);

    expect(graceHeads.map((head) => head.getAttribute("transform"))).toEqual(
      graceHeads.map(
        (_, index) =>
          `translate(${100 + index * 10 + (3 - index) * 3} 10) scale(0.6,0.6) translate(-${100 + index * 10} -10)`,
      ),
    );
    expect(
      graceLines.map((line) => [
        line.getAttribute("x1"),
        line.getAttribute("x2"),
      ]),
    ).toEqual([
      ["115", "115"],
      ["122", "122"],
      ["129", "129"],
      ["136", "136"],
    ]);
  });

  it("levels the grace beam and connects stems without moving note pitches", () => {
    const { scoreSvg, graceHeads, graceStems } = renderGraceNoteScore(4);
    const originalHeadTransforms = graceHeads.map((head) =>
      head.getAttribute("transform"),
    );
    graceStems.forEach((stem, index) => {
      const x = 106 + index * 10;
      stem.setAttribute("d", `M${x} ${20 + index * 2} L${x} ${40 + index}`);
    });

    compactGraceNoteSpacing(scoreSvg);

    expect({
      stemPaths: graceStems.map((stem) => stem.getAttribute("d")),
      beamPath: scoreSvg
        .querySelector(".abcjs-beam-elem")
        ?.getAttribute("d"),
      headYPositions: graceHeads.map((head) =>
        head.getAttribute("transform")?.match(/translate\([^ ]+ ([^)]*)\)/)?.[1],
      ),
      originalHeadYPositions: originalHeadTransforms.map((transform) =>
        transform?.match(/translate\([^ ]+ ([^)]*)\)/)?.[1],
      ),
    }).toEqual({
      stemPaths: [
        "M 115 7 L 115 40",
        "M 122 7 L 122 41",
        "M 129 7 L 129 42",
        "M136 7 L136 43",
      ],
      beamPath: "M 115 5 L 136 5 L 136 7 L 115 7 z",
      headYPositions: ["10", "10", "10", "10"],
      originalHeadYPositions: ["10", "10", "10", "10"],
    });
  });

  it("connects SVG line stems to the level grace beam", () => {
    const { scoreSvg, graceStems } = renderGraceNoteScore(4);
    const graceLines = graceStems.map((stem, index) => {
      const x = 106 + index * 10;
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("class", "abcjs-stem");
      line.setAttribute("x1", String(x));
      line.setAttribute("x2", String(x));
      line.setAttribute("y1", String(20 + index * 2));
      line.setAttribute("y2", String(40 + index));
      stem.replaceWith(line);
      return line;
    });

    compactGraceNoteSpacing(scoreSvg);

    expect(
      graceLines.map((line) => [
        line.getAttribute("y1"),
        line.getAttribute("y2"),
      ]),
    ).toEqual([
      ["7", "40"],
      ["7", "41"],
      ["7", "42"],
      ["7", "43"],
    ]);
  });

  it("levels each beam bar and connects stems to the primary beam", () => {
    const { scoreSvg, graceStems } = renderGraceNoteScore(3);
    const beam = scoreSvg.querySelector(".abcjs-beam-elem")!;
    beam.setAttribute(
      "d",
      "M106 10 L126 0 L126 2 L106 12 z M106 16 L126 6 L126 8 L106 18 z",
    );

    compactGraceNoteSpacing(scoreSvg);

    const beamPath = beam.getAttribute("d");
    expect(beamPath).toBe(
      "M 112 5 L 126 5 L 126 7 L 112 7 z M 112 11 L 126 11 L 126 13 L 112 13 z",
    );
    expect(graceStems.map((stem) => stem.getAttribute("d"))).toEqual([
      "M 112 7 L 112 40",
      "M 119 7 L 119 40",
      "M126 7 L126 40",
    ]);
  });

  it("aligns beam tops across grace groups on the same staff", () => {
    const scoreSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    scoreSvg.innerHTML = `
      <g class="abcjs-staff-wrapper">
        <g class="abcjs-note">
          <path class="abcjs-notehead" transform="translate(100 10) scale(0.6,0.6) translate(-100 -10)" />
          <path class="abcjs-notehead" transform="translate(110 20) scale(0.6,0.6) translate(-110 -20)" />
          <line class="abcjs-stem" x1="106" x2="106" y1="10" y2="40" />
          <line class="abcjs-stem" x1="116" x2="116" y1="20" y2="40" />
        </g>
        <path class="abcjs-beam-elem" d="M106 10 L116 0 L116 2 L106 12 z" />
        <g class="abcjs-note">
          <path class="abcjs-notehead" transform="translate(200 30) scale(0.6,0.6) translate(-200 -30)" />
          <path class="abcjs-notehead" transform="translate(210 40) scale(0.6,0.6) translate(-210 -40)" />
          <line class="abcjs-stem" x1="206" x2="206" y1="30" y2="60" />
          <line class="abcjs-stem" x1="216" x2="216" y1="40" y2="60" />
        </g>
        <path class="abcjs-beam-elem" d="M206 30 L216 20 L216 22 L206 32 z" />
      </g>
    `;
    const stems = [...scoreSvg.querySelectorAll(".abcjs-stem")];
    const beams = [...scoreSvg.querySelectorAll(".abcjs-beam-elem")];

    compactGraceNoteSpacing(scoreSvg);

    expect(stems.map((stem) => stem.getAttribute("y1"))).toEqual([
      "7",
      "7",
      "7",
      "7",
    ]);
    expect(beams.map((beam) => beam.getAttribute("d"))).toEqual([
      "M 109 5 L 116 5 L 116 7 L 109 7 z",
      "M 209 5 L 216 5 L 216 7 L 209 7 z",
    ]);
  });
});
