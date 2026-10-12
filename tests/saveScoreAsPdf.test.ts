import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveScoreAsPdf } from "../src/saveScoreAsPdf.js";

const { mockPdfSvg, mockSave, mockJsPDF } = vi.hoisted(() => ({
  mockPdfSvg: vi.fn(),
  mockSave: vi.fn(),
  mockJsPDF: vi.fn(),
}));

type MockPdfOrientation = "landscape" | "portrait";

interface MockPdfInstance {
  internal: {
    pageSize: {
      getWidth: () => number;
      getHeight: () => number;
    };
  };
  svg: typeof mockPdfSvg;
  save: typeof mockSave;
}

function createMockPdf(
  this: MockPdfInstance,
  { orientation }: { orientation: MockPdfOrientation },
): void {
  const isLandscape = orientation === "landscape";
  this.internal = {
    pageSize: {
      getWidth: () => (isLandscape ? 841.89 : 595.28),
      getHeight: () => (isLandscape ? 595.28 : 841.89),
    },
  };
  this.svg = mockPdfSvg;
  this.save = mockSave;
}

vi.mock("jspdf", () => ({
  jsPDF: mockJsPDF.mockImplementation(createMockPdf),
}));

vi.mock("svg2pdf.js", () => ({}));

describe("saveScoreAsPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJsPDF.mockImplementation(createMockPdf);
  });

  function createScoreSvg(lineCount: number): SVGSVGElement {
    const scoreSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    Object.defineProperty(scoreSvg, "viewBox", {
      value: { baseVal: { width: 200, height: 100 } },
    });
    scoreSvg.getBBox = () => new DOMRect(0, 0, 200, 100);
    scoreSvg.innerHTML = Array.from(
      { length: lineCount },
      () => '<g class="abcjs-staff-wrapper"></g>',
    ).join("");

    return scoreSvg;
  }

  it("exports six score lines in landscape and names the PDF from its title", async () => {
    const scoreSvg = createScoreSvg(6);

    await saveScoreAsPdf(scoreSvg, "X:1\nT: A/Test Tune? \nK:C");

    expect(mockPdfSvg).toHaveBeenCalledWith(
      scoreSvg,
      expect.objectContaining({ width: 769.89 }),
    );
    expect(mockSave).toHaveBeenCalledWith("ATest-Tune.pdf");
    expect(mockJsPDF).toHaveBeenCalledWith({
      unit: "pt",
      format: "a4",
      orientation: "landscape",
    });
  });

  it("exports more than six score lines in portrait", async () => {
    const scoreSvg = createScoreSvg(7);

    await saveScoreAsPdf(scoreSvg, "T:Long Tune");

    expect(mockJsPDF).toHaveBeenCalledWith({
      unit: "pt",
      format: "a4",
      orientation: "portrait",
    });
  });

  it("rejects a score without printable dimensions", async () => {
    const scoreSvg = createScoreSvg(1);
    scoreSvg.viewBox.baseVal.width = 0;
    scoreSvg.viewBox.baseVal.height = 0;
    scoreSvg.getBBox = () => new DOMRect(0, 0, 0, 0);

    await expect(saveScoreAsPdf(scoreSvg, "T:Empty")).rejects.toThrow(
      "The rendered score has no printable dimensions.",
    );
  });
});
