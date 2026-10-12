function getFileName(abcString) {
  const title = abcString.match(/^T:(.*)$/m)?.[1]?.trim() || "sheet-music";
  const fileName = title
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+|\.+$/g, "");

  return `${fileName || "sheet-music"}.pdf`;
}

export async function saveScoreAsPdf(scoreSvg, abcString) {
  const { jsPDF } = await import("jspdf");
  await import("svg2pdf.js");

  const staffLineCount = scoreSvg.querySelectorAll(
    ".abcjs-staff-wrapper",
  ).length;
  const orientation = staffLineCount > 6 ? "portrait" : "landscape";
  const viewBox = scoreSvg.viewBox.baseVal;
  const bounds = scoreSvg.getBBox();
  const sourceWidth = viewBox.width || bounds.width;
  const sourceHeight = viewBox.height || bounds.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("The rendered score has no printable dimensions.");
  }

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation });
  const margin = 36;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const scale = Math.min(
    (pageWidth - margin * 2) / sourceWidth,
    (pageHeight - margin * 2) / sourceHeight,
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (pageWidth - width) / 2;
  const y = (pageHeight - height) / 2;

  await pdf.svg(scoreSvg, { x, y, width, height });
  pdf.save(getFileName(abcString));
}
