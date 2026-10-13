import { describe, expect, it } from "vitest";
import { expandStaffLineSpacing } from "../src/utils/expandStaffLineSpacing.js";

function setBounds(
  staffSystem: SVGGElement,
  y: number,
  height: number,
): void {
  Object.defineProperty(staffSystem, "getBBox", {
    configurable: true,
    value: () => ({ x: 0, y, width: 700, height }),
  });
}

describe("expandStaffLineSpacing", () => {
  it("scales systems vertically and offsets following systems to preserve gaps", () => {
    const scoreSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    scoreSvg.innerHTML = `
      <g class="abcjs-staff-wrapper"></g>
      <g class="abcjs-staff-wrapper"></g>
    `;
    const [firstSystem, secondSystem] = [
      ...scoreSvg.querySelectorAll<SVGGElement>(".abcjs-staff-wrapper"),
    ];
    setBounds(firstSystem, 100, 100);
    setBounds(secondSystem, 220, 100);

    expandStaffLineSpacing(scoreSvg);

    expect(firstSystem.getAttribute("transform")).toBe(
      "translate(0 0) translate(0 100) scale(1 1.25) translate(0 -100)",
    );
    expect(secondSystem.getAttribute("transform")).toBe(
      "translate(0 25) translate(0 220) scale(1 1.25) translate(0 -220)",
    );
  });

  it("expands the SVG viewBox to include the transformed score bounds", () => {
    const scoreSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    scoreSvg.setAttribute("viewBox", "0 0 700 459");
    const scoreContainer = document.createElement("div");
    scoreContainer.style.paddingBottom = "65.5714%";
    scoreContainer.append(scoreSvg);
    const staffSystem = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    staffSystem.setAttribute("class", "abcjs-staff-wrapper");
    scoreSvg.append(staffSystem);
    setBounds(staffSystem, 100, 80);
    Object.defineProperty(scoreSvg, "getBBox", {
      configurable: true,
      value: () => ({ x: 0, y: 25, width: 700, height: 575 }),
    });

    expandStaffLineSpacing(scoreSvg);

    expect(scoreSvg.getAttribute("viewBox")).toBe("0 0 700 600");
    expect(Number.parseFloat(scoreContainer.style.paddingBottom)).toBeCloseTo(
      85.7143,
      3,
    );
  });

  it("widens noteheads by 50 percent while preserving their original transform", () => {
    const scoreSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    scoreSvg.setAttribute("viewBox", "0 0 700 300");
    const staffSystem = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    staffSystem.setAttribute("class", "abcjs-staff-wrapper");
    const notehead = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    notehead.setAttribute("class", "abcjs-notehead");
    notehead.setAttribute("transform", "translate(100 120) scale(0.6)");
    staffSystem.append(notehead);
    scoreSvg.append(staffSystem);
    setBounds(staffSystem, 100, 80);
    Object.defineProperty(notehead, "getBBox", {
      configurable: true,
      value: () => ({ x: 10, y: 20, width: 8, height: 5 }),
    });
    Object.defineProperty(scoreSvg, "getBBox", {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 700, height: 300 }),
    });

    expandStaffLineSpacing(scoreSvg);

    const widthTransform = notehead.getAttribute("transform");
    const wrapperTransform = notehead.parentElement?.getAttribute("transform");
    expect(widthTransform).toBe(
      "translate(14 22.5) scale(1.5 1) translate(-14 -22.5)",
    );
    expect(wrapperTransform).toBe("translate(100 120) scale(0.6)");
  });

  it("does not expand an already adjusted staff system again", () => {
    const scoreSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    const staffSystem = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    staffSystem.setAttribute("class", "abcjs-staff-wrapper");
    scoreSvg.append(staffSystem);
    scoreSvg.setAttribute("viewBox", "0 0 700 300");
    setBounds(staffSystem, 100, 80);
    Object.defineProperty(scoreSvg, "getBBox", {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 700, height: 300 }),
    });

    expandStaffLineSpacing(scoreSvg);
    const transform = staffSystem.getAttribute("transform");
    expandStaffLineSpacing(scoreSvg);

    expect(staffSystem.getAttribute("transform")).toBe(transform);
  });
});
