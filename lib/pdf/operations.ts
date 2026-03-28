import { Document, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";
import { degrees, PDFDocument, type PDFFont, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";

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

export async function pdfBufferToDocx(buffer: Buffer): Promise<Uint8Array> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  let raw: string;
  try {
    const textResult = await parser.getText();
    raw = (textResult.text || "").trim() || " ";
  } finally {
    await parser.destroy();
  }
  const lines = raw.split(/\r?\n/);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: lines.map(
          (line) =>
            new Paragraph({
              children: [new TextRun({ text: line.length ? line : " " })],
            }),
        ),
      },
    ],
  });
  const out = await Packer.toBuffer(doc);
  return new Uint8Array(out);
}

function wrapLineToWidth(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        line = word;
      } else {
        let rest = word;
        while (rest.length > 0) {
          let take = rest.length;
          while (take > 0 && font.widthOfTextAtSize(rest.slice(0, take), fontSize) > maxWidth) {
            take--;
          }
          if (take < 1) take = 1;
          lines.push(rest.slice(0, take));
          rest = rest.slice(take);
        }
        line = "";
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function docxBufferToPdf(buffer: Buffer): Promise<Uint8Array> {
  const { value: text } = await mammoth.extractRawText({ buffer });
  const body = text?.trim() ? text : " ";
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const lineHeight = fontSize * 1.35;
  const margin = 50;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const paragraphs = body.split(/\r?\n/);
  for (const para of paragraphs) {
    const wrapped = wrapLineToWidth(para, font, fontSize, maxWidth);
    const lines = wrapped.length ? wrapped : [""];
    for (const wline of lines) {
      if (y < margin + lineHeight) {
        page = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(wline || " ", { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
  }

  return pdf.save({ useObjectStreams: true });
}
