"use client";

import type { PdfTextHit } from "@/lib/pdf/pdfPageTextHits";

const MIN_CONFIDENCE = 52;
const MAX_OCR_HITS = 450;
const OCR_MAX_EDGE_PX = 2000;

/**
 * OCR hits first, native second — pickPdfTextHit scans from the end, so native wins on overlap.
 * Native `hitIndex` values are preserved (Fabric masks/textboxes store them); OCR indices start after the last native.
 */
export function mergeNativeAndOcrHitsForPick(native: PdfTextHit[], ocr: PdfTextHit[]): PdfTextHit[] {
  if (ocr.length === 0) return native;
  const ocrBase =
    native.length === 0
      ? 0
      : Math.max(...native.map((h) => h.hitIndex)) + 1;
  const ocrMapped = ocr.map((h, i) => ({ ...h, hitIndex: ocrBase + i }));
  return [...ocrMapped, ...native];
}

function downscaleCanvasForOcr(source: HTMLCanvasElement): { canvas: HTMLCanvasElement; sx: number; sy: number } {
  const w = source.width;
  const h = source.height;
  if (w < 4 || h < 4) return { canvas: source, sx: 1, sy: 1 };
  const maxDim = Math.max(w, h);
  if (maxDim <= OCR_MAX_EDGE_PX) return { canvas: source, sx: 1, sy: 1 };
  const scale = OCR_MAX_EDGE_PX / maxDim;
  const tw = Math.max(4, Math.floor(w * scale));
  const th = Math.max(4, Math.floor(h * scale));
  const c = document.createElement("canvas");
  c.width = tw;
  c.height = th;
  const ctx = c.getContext("2d");
  if (!ctx) return { canvas: source, sx: 1, sy: 1 };
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, tw, th);
  return { canvas: c, sx: w / tw, sy: h / th };
}

/**
 * Runs Tesseract on the rendered page bitmap. Boxes are returned in the same pixel space as `source`
 * (matches PDF.js viewport / Fabric overlay).
 */
export async function extractOcrTextHitsFromCanvas(
  source: HTMLCanvasElement,
  onProgress?: (pct: number, status: string) => void,
): Promise<PdfTextHit[]> {
  const { canvas, sx, sy } = downscaleCanvasForOcr(source);
  if (canvas.width < 4 || canvas.height < 4) return [];

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (typeof m.progress === "number" && m.status) {
        onProgress?.(Math.min(100, Math.round(m.progress * 100)), m.status);
      }
    },
  });

  try {
    const { data } = await worker.recognize(canvas);
    const words = data.words ?? [];
    const hits: PdfTextHit[] = [];

    for (const w of words) {
      if (hits.length >= MAX_OCR_HITS) break;
      if (w.confidence < MIN_CONFIDENCE) continue;
      const t = w.text?.replace(/\s+/g, " ").trim() ?? "";
      if (t.length < 1) continue;
      const { x0, y0, x1, y1 } = w.bbox;
      const rw = (x1 - x0) * sx;
      const rh = (y1 - y0) * sy;
      if (rw < 2 || rh < 2) continue;
      const left = x0 * sx;
      const top = y0 * sy;
      hits.push({
        str: t,
        left,
        top,
        width: rw,
        height: rh,
        fontSizePx: Math.max(8, Math.min(96, rh * 0.92)),
        hitIndex: hits.length,
        fontFamily: "Helvetica, Arial, sans-serif",
      });
    }

    return hits;
  } finally {
    await worker.terminate().catch(() => {});
  }
}
