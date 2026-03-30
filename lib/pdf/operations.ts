import { Document, ImageRun, Packer, Paragraph, TextRun } from "docx";
import type { EmbeddedImage } from "pdf-parse";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { renderMammothHtmlToPdf } from "@/lib/pdf/docxHtmlToPdf";

export async function mergePdfBuffers(buffers: Buffer[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save({ useObjectStreams: true });
}

export async function splitPdfEachPageZip(buffer: Buffer): Promise<Uint8Array> {
  const src = await PDFDocument.load(buffer);
  const zip = new JSZip();
  const n = src.getPageCount();
  for (let i = 0; i < n; i++) {
    const part = await PDFDocument.create();
    const [p] = await part.copyPages(src, [i]);
    part.addPage(p);
    const bytes = await part.save({ useObjectStreams: true });
    zip.file(`page-${String(i + 1).padStart(3, "0")}.pdf`, bytes);
  }
  return zip.generateAsync({ type: "uint8array" });
}

export async function splitPdfRange(buffer: Buffer, fromPage: number, toPage: number): Promise<Uint8Array> {
  const src = await PDFDocument.load(buffer);
  const count = src.getPageCount();
  const from = Math.max(1, Math.min(fromPage, count));
  const to = Math.max(1, Math.min(toPage, count));
  if (from > to) throw new Error("Invalid range: start page must be ≤ end page.");
  const indices: number[] = [];
  for (let i = from - 1; i <= to - 1; i++) indices.push(i);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  return out.save({ useObjectStreams: true });
}

export async function compressPdfBuffer(buffer: Buffer): Promise<Uint8Array> {
  const src = await PDFDocument.load(buffer);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices());
  pages.forEach((p) => out.addPage(p));
  return out.save({ useObjectStreams: true });
}

const MAX_DOCX_EMBEDDED_IMAGES = 120;
const MAX_IMAGE_DISPLAY_WIDTH_PX = 720;

/** pdf-parse default pageJoiner inserts `-- 1 of N --` lines; strip if any slip through. */
function isPdfPageMarkerLine(line: string): boolean {
  return /^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/i.test(line.trim());
}

function guessDocxImageType(data: Uint8Array): "png" | "jpg" | "gif" | "bmp" | null {
  if (data.length < 4) return null;
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return "png";
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "jpg";
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x38) return "gif";
  if (data[0] === 0x42 && data[1] === 0x4d) return "bmp";
  return null;
}

function scaleImageForDocx(w: number, h: number, maxW: number): { width: number; height: number } {
  if (w <= maxW) return { width: w, height: h };
  const s = maxW / w;
  return { width: maxW, height: Math.max(1, Math.round(h * s)) };
}

function paragraphFromEmbeddedImage(img: EmbeddedImage): Paragraph | null {
  if (!img.data?.length) return null;
  const type = guessDocxImageType(img.data);
  if (!type) return null;
  const { width, height } = scaleImageForDocx(img.width, img.height, MAX_IMAGE_DISPLAY_WIDTH_PX);
  return new Paragraph({
    children: [
      new ImageRun({
        type,
        data: Buffer.from(img.data),
        transformation: { width, height },
      }),
    ],
  });
}

export async function pdfBufferToDocx(buffer: Buffer): Promise<Uint8Array> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  let textResult: Awaited<ReturnType<InstanceType<typeof PDFParse>["getText"]>>;
  let imageResult: Awaited<ReturnType<InstanceType<typeof PDFParse>["getImage"]>>;
  try {
    textResult = await parser.getText({ pageJoiner: "" });
    imageResult = await parser.getImage({ imageThreshold: 0 });
  } finally {
    await parser.destroy();
  }

  const textByPage = new Map<number, string>();
  for (const p of textResult.pages) {
    textByPage.set(p.num, p.text ?? "");
  }
  const imagesByPage = new Map<number, EmbeddedImage[]>();
  for (const p of imageResult.pages) {
    imagesByPage.set(p.pageNumber, p.images ?? []);
  }

  const pageNums = new Set<number>([...textByPage.keys(), ...imagesByPage.keys()]);
  const sortedPages = [...pageNums].sort((a, b) => a - b);

  const children: Paragraph[] = [];
  let imageCount = 0;

  pageLoop: for (const pageNum of sortedPages) {
    const pageText = textByPage.get(pageNum) ?? "";
    for (const line of pageText.split(/\r?\n/)) {
      if (isPdfPageMarkerLine(line)) continue;
      const t = line.trimEnd();
      children.push(
        new Paragraph({
          children: [new TextRun({ text: t.length ? t : " " })],
        }),
      );
    }

    for (const img of imagesByPage.get(pageNum) ?? []) {
      if (imageCount >= MAX_DOCX_EMBEDDED_IMAGES) break pageLoop;
      const para = paragraphFromEmbeddedImage(img);
      if (para) {
        children.push(para);
        imageCount++;
      }
    }
  }

  if (children.length === 0) {
    const raw = (textResult.text || "").trim() || " ";
    const lines = raw.split(/\r?\n/).filter((line) => !isPdfPageMarkerLine(line));
    for (const line of lines.length ? lines : [raw]) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line.trimEnd().length ? line.trimEnd() : " " })],
        }),
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
  const out = await Packer.toBuffer(doc);
  return new Uint8Array(out);
}

export async function docxBufferToPdf(buffer: Buffer): Promise<Uint8Array> {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  const fragment = html?.trim() ? html : "<p> </p>";
  return renderMammothHtmlToPdf(fragment);
}
