import { describe, expect, it } from "vitest";
import type { VoiceItem } from "abcjs";
import abcjs from "abcjs";
import { compactGraceNoteSpacing } from "../src/utils/compactGraceNoteSpacing.js";
import { INITIAL_TUNE_BOOK } from "../src/data/initialTuneBook.js";

function requireValue<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Expected a value in the rendered score.");
  }

  return value;
}

function readFirstNumber(value: string | null, pattern: RegExp): number {
  const match = value?.match(pattern);
  if (!match) throw new Error("Expected numeric SVG coordinates.");

  return Number(match[1]);
}

function hasGraceNotes(
  item: VoiceItem,
): item is VoiceItem & { gracenotes: unknown[] } {
  return "gracenotes" in item && Array.isArray(item.gracenotes);
}

describe("INITIAL_TUNE_BOOK", () => {
  it("disables grace-note slurs for Scotland the Brave", () => {
    const scotlandTheBrave = requireValue(
      INITIAL_TUNE_BOOK.find((tune) => tune.title === "Scotland the Brave"),
    );

    expect(scotlandTheBrave.abcString).toContain("%%graceslurs 0");
  });

  it("enables bagpipe grace-note engraving", () => {
    const scotlandTheBrave = requireValue(
      INITIAL_TUNE_BOOK.find((tune) => tune.title === "Scotland the Brave"),
    );
    const parsedTune = requireValue(
      abcjs.parseOnly(scotlandTheBrave.abcString)[0],
    );
    const graceGroups = parsedTune.lines.flatMap(
      (line) =>
        line.staff?.flatMap(
          (staff) =>
            staff.voices?.flatMap((voice) =>
              voice.flatMap((item) =>
                item.el_type === "note" &&
                hasGraceNotes(item) &&
                item.gracenotes.length
                  ? [item.gracenotes]
                  : [],
              ),
            ) ?? [],
        ) ?? [],
    );

    expect(graceGroups).toHaveLength(46);
    expect(parsedTune.formatting.bagpipes).toBe(true);
  });

  it("renders every single grace note in the tune with three tails", () => {
    const output = document.createElement("div");
    const scotlandTheBrave = requireValue(
      INITIAL_TUNE_BOOK.find((tune) => tune.title === "Scotland the Brave"),
    );

    abcjs.renderAbc(output, scotlandTheBrave.abcString, { add_classes: true });
    const scoreSvg = requireValue(output.querySelector("svg"));
    compactGraceNoteSpacing(scoreSvg);

    const singleGraceNotes = [...scoreSvg.querySelectorAll(".abcjs-note")]
      .map((note) => ({
        note,
        graceHeadCount: note.querySelectorAll(".abcjs-notehead[transform]")
          .length,
      }))
      .filter(({ graceHeadCount }) => graceHeadCount === 1);

    expect(singleGraceNotes).toHaveLength(35);
    expect(
      singleGraceNotes.every(({ note }) =>
        [...note.children].some(
          (child) => child.getAttribute("d")?.match(/z/gi)?.length === 3,
        ),
      ),
    ).toBe(true);
  });

  it("renders grouped grace notes with three beams in bagpipe mode", () => {
    const output = document.createElement("div");
    const abcString = [
      "X:1",
      "T:Test",
      "M:4/4",
      "K:D",
      "%%bagpipes",
      "{GdGe}A>B|",
    ].join("\n");

    abcjs.renderAbc(output, abcString, { add_classes: true });

    expect(
      [...output.querySelectorAll(".abcjs-beam-elem")].some(
        (beam) => beam.getAttribute("d")?.match(/z/gi)?.length === 3,
      ),
    ).toBe(true);
  });

  it("compacts an ABCJS-rendered multi-note grace group", () => {
    const output = document.createElement("div");
    const abcString = [
      "X:1",
      "T:Test",
      "M:4/4",
      "K:D",
      "%%bagpipes",
      "{G/d/G/e/}A2|",
    ].join("\n");

    abcjs.renderAbc(output, abcString, { add_classes: true });

    const scoreSvg = requireValue(output.querySelector("svg"));
    const graceNote = requireValue(
      [...scoreSvg.querySelectorAll(".abcjs-note")].find(
        (note) =>
          note.querySelectorAll(".abcjs-notehead[transform]").length === 4,
      ),
    );
    const graceHeads = [
      ...graceNote.querySelectorAll(".abcjs-notehead[transform]"),
    ];
    const graceStems = [...graceNote.children]
      .filter((child) => child.classList.contains("abcjs-stem"))
      .sort(
        (firstStem, secondStem) =>
          readFirstNumber(firstStem.getAttribute("d"), /^M\s*(-?[\d.]+)/) -
          readFirstNumber(secondStem.getAttribute("d"), /^M\s*(-?[\d.]+)/),
      )
      .slice(0, 4);
    const getStemPositions = () =>
      graceStems.map((stem) =>
        readFirstNumber(stem.getAttribute("d"), /^M\s*(-?[\d.]+)/),
      );
    const graceBeam = requireValue(
      requireValue(graceNote.parentElement).querySelector(".abcjs-beam-elem"),
    );
    const getBeamBounds = () => {
      const beamCoordinates = [
        ...(graceBeam.getAttribute("d") ?? "").matchAll(/[ML]\s*(-?[\d.]+)/g),
      ].map((match) => Number(match[1]));

      return {
        left: Math.min(...beamCoordinates),
        right: Math.max(...beamCoordinates),
      };
    };
    const originalBeamBounds = getBeamBounds();
    const originalBeamWidth =
      originalBeamBounds.right - originalBeamBounds.left;
    const getHeadPositions = () =>
      graceHeads.map((head) => {
        const transform = requireValue(head.getAttribute("transform"));
        const [, currentTranslateX, scaleX, originalTranslateX] = requireValue(
          transform.match(
            /translate\(([\d.]+) [\d.]+\) scale\(([\d.]+)[^)]*\) translate\((-?[\d.]+)/,
          ),
        );
        const headPathX = readFirstNumber(
          head.getAttribute("d"),
          /^M\s*(-?[\d.]+)/,
        );
        const renderedHeadPosition =
          headPathX * Number(scaleX) +
          Number(currentTranslateX) +
          Number(scaleX) * Number(originalTranslateX);

        return renderedHeadPosition;
      });

    compactGraceNoteSpacing(scoreSvg);

    expect(
      getHeadPositions()
        .slice(1)
        .map((position, index) =>
          Number((position - getHeadPositions()[index]).toFixed(8)),
        ),
    ).toEqual([5.5, 5.5, 5.5]);
    expect(
      getStemPositions()
        .slice(1)
        .map((position, index) =>
          Number((position - getStemPositions()[index]).toFixed(8)),
        ),
    ).toEqual([5.5, 5.5, 5.5]);
    const compactedBeamBounds = getBeamBounds();
    const compactedStemPositions = getStemPositions();
    expect(compactedBeamBounds.left).toBeCloseTo(compactedStemPositions[0], 0);
    expect(compactedBeamBounds.right).toBeCloseTo(compactedStemPositions[3], 0);
    expect(compactedBeamBounds.right - compactedBeamBounds.left).toBeCloseTo(
      originalBeamWidth * 0.55,
    );
  });
});
