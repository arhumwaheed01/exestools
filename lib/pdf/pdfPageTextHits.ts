import { Util, type PDFPageProxy, type PageViewport } from "pdfjs-dist";

/** Click targets derived from PDF.js text content (viewport / canvas pixels). */
export type PdfTextHit = {
  str: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSizePx: number;
  hitIndex: number;
  fontFamily: string;
};

const MAX_RAW_FRAGMENTS = 4000;
const MAX_MERGED_HITS = 900;

/** Same scale math as the editor canvas so hits align with the rendered page. */
export function getEditorPageViewport(
  page: PDFPageProxy,
  rotation: number,
  maxW: number,
  maxH: number,
): PageViewport {
  const base = page.getViewport({ scale: 1, rotation });
  const scale = Math.min(maxW / base.width, maxH / base.height, 2.5);
  return page.getViewport({ scale, rotation });
}

function mapPdfFontFamily(pdfFontName: string, styles: Record<string, { fontFamily?: string }>): string {
  const style = styles[pdfFontName];
  const raw = style?.fontFamily?.toLowerCase() ?? "";
  if (raw.includes("mono") || raw.includes("courier")) {
    return "Courier New, Courier, monospace";
  }
  if (
    raw.includes("serif") ||
    raw.includes("times") ||
    raw.includes("georgia") ||
    raw.includes("minion")
  ) {
    return "Georgia, Times New Roman, serif";
  }
  return "Helvetica, Arial, sans-serif";
}

type RawHit = {
  str: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSizePx: number;
  fontFamily: string;
  hasEOL: boolean;
};

/**
 * Merge consecutive text fragments from the PDF content stream when they sit on one
 * line and are close horizontally — much easier to click than single-glyph targets.
 * Respects hasEOL so we do not glue separate lines together.
 */
type LineAcc = {
  str: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSizePx: number;
  fontFamily: string;
  endsWithEOL: boolean;
};

function rawToAcc(r: RawHit): LineAcc {
  return {
    str: r.str,
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
    fontSizePx: r.fontSizePx,
    fontFamily: r.fontFamily,
    endsWithEOL: !!r.hasEOL,
  };
}

function mergeStreamOrderHits(raw: RawHit[]): PdfTextHit[] {
  if (raw.length === 0) return [];

  const merged: PdfTextHit[] = [];
  let cur = rawToAcc(raw[0]!);

  const flush = (): boolean => {
    merged.push({
      str: cur.str,
      left: cur.left,
      top: cur.top,
      width: cur.width,
      height: cur.height,
      fontSizePx: cur.fontSizePx,
      fontFamily: cur.fontFamily,
      hitIndex: merged.length,
    });
    return merged.length >= MAX_MERGED_HITS;
  };

  for (let i = 1; i < raw.length; i++) {
    if (merged.length >= MAX_MERGED_HITS) break;
    const h = raw[i]!;

    if (cur.endsWithEOL) {
      if (flush()) break;
      cur = rawToAcc(h);
      continue;
    }

    const curMidY = cur.top + cur.height / 2;
    const hMidY = h.top + h.height / 2;
    const lineH = Math.min(Math.max(cur.height, h.height, 4), 48);
    const sameLine = Math.abs(hMidY - curMidY) <= Math.max(2.5, lineH * 0.45);

    const prevR = cur.left + cur.width;
    const gap = h.left - prevR;
    const fs = Math.min(cur.fontSizePx, h.fontSizePx);
    const maxGap = Math.max(8, fs * 1.05);

    const canMerge = sameLine && gap <= maxGap && gap >= -fs * 0.45;

    if (canMerge) {
      const newLeft = Math.min(cur.left, h.left);
      const newTop = Math.min(cur.top, h.top);
      const newRight = Math.max(prevR, h.left + h.width);
      const newBottom = Math.max(cur.top + cur.height, h.top + h.height);
      const sep = gap > fs * 0.04 ? " " : "";
      cur = {
        str: cur.str + sep + h.str,
        left: newLeft,
        top: newTop,
        width: newRight - newLeft,
        height: newBottom - newTop,
        fontSizePx: (cur.fontSizePx + h.fontSizePx) / 2,
        fontFamily: cur.fontFamily,
        endsWithEOL: !!h.hasEOL,
      };
    } else {
      if (flush()) break;
      cur = rawToAcc(h);
    }
  }

  if (merged.length < MAX_MERGED_HITS) {
    flush();
  }

  return merged.map((hit, idx) => ({ ...hit, hitIndex: idx }));
}

/**
 * Extract text runs with axis-aligned bounds in viewport space (matches canvas),
 * then merge adjacent fragments into larger click targets.
 */
export async function extractPdfTextHits(
  page: PDFPageProxy,
  viewport: PageViewport,
): Promise<PdfTextHit[]> {
  const content = await page.getTextContent();
  const styles = content.styles as Record<string, { fontFamily?: string }>;
  const raw: RawHit[] = [];

  for (const item of content.items) {
    if (raw.length >= MAX_RAW_FRAGMENTS) break;
    if (!("str" in item) || typeof item.str !== "string") continue;

    const str = item.str;
    if (str.length === 0) continue;

    const w = Math.max(0, item.width);
    const h = Math.max(0, item.height);
    if (w < 0.2 && h < 0.2 && str.trim() === "") continue;

    const m = Util.transform(viewport.transform, item.transform);
    const [minX, minY, maxX, maxY] = Util.getAxialAlignedBoundingBox([0, 0, w, h], m);
    const width = maxX - minX;
    const height = maxY - minY;
    if (width < 0.3 || height < 0.3) continue;

    const fontSizePx = Math.max(6, Math.min(96, Math.hypot(m[2]!, m[3]!)));

    raw.push({
      str,
      left: minX,
      top: minY,
      width,
      height,
      fontSizePx,
      fontFamily: mapPdfFontFamily(item.fontName, styles),
      hasEOL: !!item.hasEOL,
    });
  }

  return mergeStreamOrderHits(raw);
}

/**
 * Prefer the last matching hit in paint order (later content on top).
 */
export function pickPdfTextHit(
  x: number,
  y: number,
  hits: PdfTextHit[] | undefined,
  padPx = 8,
): PdfTextHit | null {
  if (!hits?.length) return null;
  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i]!;
    const L = h.left - padPx;
    const T = h.top - padPx;
    const R = h.left + h.width + padPx;
    const B = h.top + h.height + padPx;
    if (x >= L && x <= R && y >= T && y <= B) return h;
  }
  return null;
}
