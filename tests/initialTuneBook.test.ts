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
    ).toEqual([7, 7, 7]);
    expect(
      getStemPositions()
        .slice(1)
        .map((position, index) =>
          Number((position - getStemPositions()[index]).toFixed(8)),
        ),
    ).toEqual([7, 7, 7]);
    const compactedBeamBounds = getBeamBounds();
    const compactedStemPositions = getStemPositions();
    expect(compactedBeamBounds.left).toBeCloseTo(compactedStemPositions[0], 0);
    expect(compactedBeamBounds.right).toBeCloseTo(compactedStemPositions[3], 0);
    expect(compactedBeamBounds.right - compactedBeamBounds.left).toBeCloseTo(
      originalBeamWidth * 0.7,
    );
    const beamTopEdges = [
      ...(graceBeam.getAttribute("d") ?? "").matchAll(
        /M\s*-?[\d.]+\s+(-?[\d.]+)\s+L\s*-?[\d.]+\s+(-?[\d.]+)/g,
      ),
    ];
    expect(beamTopEdges.length).toBeGreaterThan(0);
    expect(
      beamTopEdges.every(
        (match) => Number(match[1]) === Number(match[2]),
      ),
    ).toBe(true);
  });

  it("moves the ledger line with a high grace-note head", () => {
    const output = document.createElement("div");
    const abcString = [
      "X:1",
      "T:Test",
      "M:4/4",
      "K:D",
      "%%bagpipes",
      "{ag}a2|",
    ].join("\n");

    abcjs.renderAbc(output, abcString, { add_classes: true });

    const scoreSvg = requireValue(output.querySelector("svg"));
    const graceNote = requireValue(
      [...scoreSvg.querySelectorAll(".abcjs-note")].find(
        (note) =>
          note.querySelectorAll(".abcjs-notehead[transform]").length === 2,
      ),
    );
    const graceHeads = [
      ...graceNote.querySelectorAll<SVGPathElement>(
        ".abcjs-notehead[transform]",
      ),
    ];
    const firstHeadPosition = readFirstNumber(
      graceHeads[0].getAttribute("transform"),
      /^translate\(\s*(-?[\d.]+)/,
    );
    const firstHeadTranslate = firstHeadPosition;
    const ledgerLines = [
      ...graceNote.querySelectorAll<SVGPathElement>(".abcjs-ledger"),
    ];
    const highNoteLedger = requireValue(
      ledgerLines
        .map((ledger) => {
          const positions = [
            ...(ledger.getAttribute("d") ?? "").matchAll(/[ML]\s*(-?[\d.]+)/g),
          ].map((match) => Number(match[1]));

          return {
            ledger,
            center: (Math.min(...positions) + Math.max(...positions)) / 2,
          };
        })
        .filter(({ center }) => Math.abs(center - firstHeadPosition) < 4)
        .sort(
          (firstLedger, secondLedger) =>
            Math.abs(firstLedger.center - firstHeadPosition) -
            Math.abs(secondLedger.center - firstHeadPosition),
        )[0],
    );
    const initialLedgerX = readFirstNumber(
      highNoteLedger.ledger.getAttribute("d"),
      /^M\s*(-?[\d.]+)/,
    );

    compactGraceNoteSpacing(scoreSvg);

    const compactedHeadTranslate = readFirstNumber(
      graceHeads[0].getAttribute("transform"),
      /^translate\(\s*(-?[\d.]+)/,
    );
    const compactedLedgerX = readFirstNumber(
      highNoteLedger.ledger.getAttribute("d"),
      /^M\s*(-?[\d.]+)/,
    );

    expect(compactedLedgerX - initialLedgerX).toBeCloseTo(
      compactedHeadTranslate - firstHeadTranslate,
    );
  });

  it("moves a line-rendered ledger with its high grace-note head", () => {
    const output = document.createElement("div");
    const abcString = [
      "X:1",
      "T:Test",
      "M:4/4",
      "K:D",
      "%%bagpipes",
      "{ag}a2|",
    ].join("\n");

    abcjs.renderAbc(output, abcString, { add_classes: true });

    const scoreSvg = requireValue(output.querySelector("svg"));
    const graceNote = requireValue(
      [...scoreSvg.querySelectorAll(".abcjs-note")].find(
        (note) =>
          note.querySelectorAll(".abcjs-notehead[transform]").length === 2,
      ),
    );
    const graceHead = requireValue(
      graceNote.querySelector<SVGPathElement>(
        ".abcjs-notehead[transform][data-name='a']",
      ),
    );
    const headTranslateBefore = readFirstNumber(
      graceHead.getAttribute("transform"),
      /^translate\(\s*(-?[\d.]+)/,
    );
    const ledgerPath = requireValue(
      [...graceNote.querySelectorAll<SVGPathElement>(".abcjs-ledger")].find(
        (ledger) => {
          const coordinates = [
            ...(ledger.getAttribute("d") ?? "").matchAll(/[ML]\s*(-?[\d.]+)/g),
          ].map((match) => Number(match[1]));
          const center =
            (Math.min(...coordinates) + Math.max(...coordinates)) / 2;
          return Math.abs(center - headTranslateBefore) < 4;
        },
      ),
    );
    const coordinates = [
      ...(ledgerPath.getAttribute("d") ?? "").matchAll(/[ML]\s*(-?[\d.]+)/g),
    ].map((match) => Number(match[1]));
    const ledgerLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    ledgerLine.setAttribute("class", "abcjs-ledger");
    ledgerLine.setAttribute("x1", String(coordinates[0]));
    ledgerLine.setAttribute("x2", String(coordinates[1]));
    ledgerLine.setAttribute("y1", "109.355");
    ledgerLine.setAttribute("y2", "109.355");
    ledgerPath.replaceWith(ledgerLine);

    const ledgerXBefore = Number(ledgerLine.getAttribute("x1"));
    compactGraceNoteSpacing(scoreSvg);

    const headTranslateAfter = readFirstNumber(
      graceHead.getAttribute("transform"),
      /^translate\(\s*(-?[\d.]+)/,
    );
    const ledgerXAfter = Number(ledgerLine.getAttribute("x1"));

    expect(ledgerXAfter - ledgerXBefore).toBeCloseTo(
      headTranslateAfter - headTranslateBefore,
    );
  });
});
