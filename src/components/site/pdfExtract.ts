/**
 * PDF → plain text, entirely in the browser (pdf.js). Nothing is uploaded:
 * the file is read locally and pdf.js runs against the bytes in memory.
 *
 * pdf.js exposes text as a flat list of positioned fragments, not lines —
 * a table row in the source PDF usually becomes several fragments at the
 * same vertical position. We reconstruct lines by grouping fragments whose
 * baseline is within a small tolerance of each other, then ordering each
 * line left to right; that is what lets `parseMultipleStatements()` treat
 * the result exactly like a pasted or CSV-exported statement.
 */

import type { TextItem } from "pdfjs-dist/types/src/display/api";

/** Fragments within this many PDF units of vertical tolerance sit on one line. */
const LINE_Y_TOLERANCE = 3;

let workerConfigured = false;

async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }
  return pdfjsLib;
}

function isTextItem(item: TextItem | { type: string }): item is TextItem {
  return "str" in item;
}

function reconstructLines(items: TextItem[]): string[] {
  const fragments = items
    .filter((item) => item.str.trim().length > 0)
    .map((item) => ({ x: item.transform[4], y: item.transform[5], str: item.str }));

  // PDF y grows upward; sort top to bottom, then left to right within a line.
  fragments.sort((a, b) => b.y - a.y || a.x - b.x);

  const lines: { y: number; parts: { x: number; str: string }[] }[] = [];
  for (const frag of fragments) {
    const current = lines[lines.length - 1];
    if (current && Math.abs(current.y - frag.y) <= LINE_Y_TOLERANCE) {
      current.parts.push({ x: frag.x, str: frag.str });
    } else {
      lines.push({ y: frag.y, parts: [{ x: frag.x, str: frag.str }] });
    }
  }

  return lines.map((line) =>
    line.parts
      .sort((a, b) => a.x - b.x)
      .map((p) => p.str)
      .join(" "),
  );
}

/** Extracts text from every page of a PDF File, reconstructed line by line. */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items.filter(isTextItem);
    pageTexts.push(reconstructLines(items).join("\n"));
  }
  return pageTexts.join("\n\n");
}
