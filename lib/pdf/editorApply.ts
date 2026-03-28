import { degrees, PDFDocument, type PDFFont, rgb, StandardFonts } from "pdf-lib";
import type {
  PdfEditorPayload,
  PdfEditorPayloadV1,
  PdfEditorPayloadV2,
  PdfEditorTextItem,
} from "./editorTypes";

const MAX_TEXT_LEN = 4000;
const MAX_WM_LEN = 120;
const MAX_OVERLAY_BASE64_CHARS = 14_000_000;

function sanitizeText(s: string, max: number): string {
  return s
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .slice(0, max)
    .trim();
}

function normRot(n: number): 0 | 90 | 180 | 270 {
  const r = ((Math.round(n) % 360) + 360) % 360;
  if (r === 90 || r === 180 || r === 270) return r;
  return 0;
}

function pickFont(
  bold: boolean,
  italic: boolean,
  h: PDFFont,
  hb: PDFFont,
  ho: PDFFont,
  hbo: PDFFont,
): PDFFont {
  if (bold && italic) return hbo;
  if (bold) return hb;
  if (italic) return ho;
  return h;
}

function validatePageOrder(pageOrder: number[], pageCount: number): void {
  if (!Array.isArray(pageOrder) || pageOrder.length === 0) {
    throw new Error("Invalid page order.");
  }
  const seen = new Set<number>();
  for (const idx of pageOrder) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= pageCount) {
      throw new Error("Invalid page index in order.");
    }
    if (seen.has(idx)) throw new Error("Duplicate page in order.");
    seen.add(idx);
  }
}

function validateV1(p: PdfEditorPayloadV1, pageCount: number): void {
  const texts = p.texts ?? [];
  if (texts.length > 500) throw new Error("Too many text objects.");
  for (const t of texts) {
    if (t.pageIndex < 0 || t.pageIndex >= pageCount) throw new Error("Text references invalid page.");
    if (
      !Number.isFinite(t.nx) ||
      !Number.isFinite(t.ny) ||
      !Number.isFinite(t.nw) ||
      !Number.isFinite(t.nh) ||
      !Number.isFinite(t.fontSizePt)
    ) {
      throw new Error("Invalid text placement.");
    }
  }
  validateWatermark(p.watermark);
}

function validateWatermark(wm: PdfEditorPayloadV1["watermark"]): void {
  if (wm?.text && (wm.opacity < 0 || wm.opacity > 1)) {
    throw new Error("Invalid watermark opacity.");
  }
}

function validateV2(p: PdfEditorPayloadV2, pageCount: number): void {
  if (!p.pageOverlays || typeof p.pageOverlays !== "object") {
    throw new Error("Invalid overlays.");
  }
  let total = 0;
  for (const [k, v] of Object.entries(p.pageOverlays)) {
    const idx = Number.parseInt(k, 10);
    if (!Number.isInteger(idx) || idx < 0 || idx >= pageCount) {
      throw new Error("Overlay references invalid page.");
    }
    if (typeof v !== "string" || v.length === 0) continue;
    total += v.length;
    if (total > MAX_OVERLAY_BASE64_CHARS) {
      throw new Error("Overlay data too large. Try fewer edits or a shorter document.");
    }
  }
  validateWatermark(p.watermark);
}

function drawWatermark(
  page: ReturnType<PDFDocument["getPage"]>,
  helvetica: PDFFont,
  wm: NonNullable<PdfEditorPayloadV1["watermark"]>,
): void {
  const text = sanitizeText(wm.text, MAX_WM_LEN);
  if (!text) return;
  const { width, height } = page.getSize();
  const sz = Math.min(56, Math.max(22, width / (text.length * 0.55)));
  const tw = helvetica.widthOfTextAtSize(text, sz);
  const op = Math.min(0.45, Math.max(0.06, wm.opacity ?? 0.22));
  const pos = wm.position ?? "diagonal";

  if (pos === "diagonal") {
    page.drawText(text, {
      x: Math.max(12, width / 2 - tw / 2),
      y: height / 2,
      size: sz,
      font: helvetica,
      color: rgb(0.78, 0.78, 0.78),
      opacity: op,
      rotate: degrees(-28),
    });
    return;
  }

  const pad = height * 0.06;
  let yFromBottom: number;
  if (pos === "top") yFromBottom = height - pad;
  else if (pos === "bottom") yFromBottom = pad + sz * 0.35;
  else yFromBottom = height / 2;

  page.drawText(text, {
    x: Math.max(12, width / 2 - tw / 2),
    y: yFromBottom,
    size: Math.min(36, sz),
    font: helvetica,
    color: rgb(0.72, 0.72, 0.72),
    opacity: op,
  });
}

export async function applyPdfEditorPayload(
  buffer: Buffer,
  payload: PdfEditorPayload,
): Promise<Uint8Array> {
  const src = await PDFDocument.load(buffer);
  const pageCount = src.getPageCount();

  if (payload.version === 1) {
    validatePageOrder(payload.pageOrder, pageCount);
    validateV1(payload, pageCount);
  } else if (payload.version === 2) {
    validatePageOrder(payload.pageOrder, pageCount);
    validateV2(payload, pageCount);
  } else {
    throw new Error("Unsupported editor format.");
  }

  const out = await PDFDocument.create();
  const helvetica = await out.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await out.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await out.embedFont(StandardFonts.HelveticaOblique);
  const helveticaBoldOblique = await out.embedFont(StandardFonts.HelveticaBoldOblique);

  if (payload.version === 1) {
    const textsByOrig = new Map<number, PdfEditorTextItem[]>();
    for (const t of payload.texts ?? []) {
      const list = textsByOrig.get(t.pageIndex) ?? [];
      list.push(t);
      textsByOrig.set(t.pageIndex, list);
    }

    for (const origIdx of payload.pageOrder) {
      const [copied] = await out.copyPages(src, [origIdx]);
      out.addPage(copied);
      const page = out.getPage(out.getPageCount() - 1);
      const { width, height } = page.getSize();

      const rotRaw = payload.pageRotations[String(origIdx)] ?? payload.pageRotations[origIdx] ?? 0;
      const rot = normRot(Number(rotRaw));
      if (rot !== 0) page.setRotation(degrees(rot));

      const pageTexts = textsByOrig.get(origIdx) ?? [];
      for (const t of pageTexts) {
        const text = sanitizeText(t.text, MAX_TEXT_LEN);
        if (!text) continue;
        const fsBase = Math.min(96, Math.max(6, t.fontSizePt));
        const fs = t.heading ? Math.min(96, fsBase * 1.35) : fsBase;
        const font = pickFont(
          t.bold,
          t.italic,
          helvetica,
          helveticaBold,
          helveticaOblique,
          helveticaBoldOblique,
        );
        const xPts = Math.max(0, Math.min(1, t.nx)) * width;
        const yTopPts = Math.max(0, Math.min(1, t.ny)) * height;
        const boxW = Math.max(0.01, Math.min(1, t.nw)) * width;
        const tw = font.widthOfTextAtSize(text, fs);
        let drawX = xPts;
        if (t.align === "center") drawX = xPts + (boxW - tw) / 2;
        if (t.align === "right") drawX = xPts + boxW - tw;
        const baselineY = height - yTopPts - fs * 0.88;
        page.drawText(text, {
          x: Math.max(0, drawX),
          y: Math.max(0, baselineY),
          size: fs,
          font,
          color: rgb(0.08, 0.09, 0.12),
        });
      }

      if (payload.watermark?.text) {
        drawWatermark(page, helvetica, payload.watermark);
      }
    }
  } else {
    for (const origIdx of payload.pageOrder) {
      const [copied] = await out.copyPages(src, [origIdx]);
      out.addPage(copied);
      const page = out.getPage(out.getPageCount() - 1);
      const { width, height } = page.getSize();

      const rotRaw = payload.pageRotations[String(origIdx)] ?? payload.pageRotations[origIdx] ?? 0;
      const rot = normRot(Number(rotRaw));
      if (rot !== 0) page.setRotation(degrees(rot));

      const b64 = payload.pageOverlays[String(origIdx)] ?? payload.pageOverlays[origIdx];
      if (typeof b64 === "string" && b64.length > 32) {
        try {
          const bytes = Buffer.from(b64, "base64");
          const png = await out.embedPng(bytes);
          page.drawImage(png, {
            x: 0,
            y: 0,
            width,
            height,
          });
        } catch {
          throw new Error("Invalid overlay image for one or more pages.");
        }
      }

      if (payload.watermark?.text) {
        drawWatermark(page, helvetica, payload.watermark);
      }
    }
  }

  return out.save({ useObjectStreams: true });
}
