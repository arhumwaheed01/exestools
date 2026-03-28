import { MAX_MERGE_FILE_COUNT, MAX_MERGE_TOTAL_BYTES, MAX_PDF_FILE_BYTES } from "./constants";

/** Skip UTF-8 BOM and leading whitespace some tools emit before %PDF-. */
function pdfHeaderOffset(view: Uint8Array): number {
  let i = 0;
  if (view.length >= 3 && view[0] === 0xef && view[1] === 0xbb && view[2] === 0xbf) {
    i = 3;
  }
  while (
    i < view.length &&
    (view[i] === 0x09 || view[i] === 0x0a || view[i] === 0x0d || view[i] === 0x20)
  ) {
    i++;
  }
  return i;
}

export function isPdfMagic(view: Uint8Array): boolean {
  const i = pdfHeaderOffset(view);
  if (view.length - i < 5) return false;
  return (
    view[i] === 0x25 &&
    view[i + 1] === 0x50 &&
    view[i + 2] === 0x44 &&
    view[i + 3] === 0x46 &&
    view[i + 4] === 0x2f
  );
}

export function isZipMagic(view: Uint8Array): boolean {
  return view.length >= 4 && view[0] === 0x50 && view[1] === 0x4b && view[2] === 0x03 && view[3] === 0x04;
}

export async function fileToBuffer(file: File, maxBytes: number): Promise<Buffer> {
  if (file.size > maxBytes) {
    throw new Error(`File exceeds ${Math.floor(maxBytes / (1024 * 1024))} MB limit.`);
  }
  const ab = await file.arrayBuffer();
  return Buffer.from(ab);
}

export async function collectPdfFiles(
  files: File[],
  opts: { maxEach: number; maxTotal: number; maxCount: number },
): Promise<Buffer[]> {
  if (files.length === 0) throw new Error("No PDF files provided.");
  if (files.length > opts.maxCount) throw new Error(`Too many files (max ${opts.maxCount}).`);

  let total = 0;
  const buffers: Buffer[] = [];

  for (const file of files) {
    const n = file.name.toLowerCase();
    const pdfish =
      n.endsWith(".pdf") || file.type === "application/pdf" || file.type === "application/x-pdf";
    if (!pdfish) throw new Error("Only PDF files are allowed.");

    const buf = await fileToBuffer(file, opts.maxEach);
    total += buf.length;
    if (total > opts.maxTotal) throw new Error("Combined file size is too large.");
    const view = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    if (!isPdfMagic(view)) throw new Error("Invalid or corrupted PDF file.");
    buffers.push(buf);
  }

  return buffers;
}

export async function readSinglePdf(file: File): Promise<Buffer> {
  return collectPdfFiles([file], {
    maxEach: MAX_PDF_FILE_BYTES,
    maxTotal: MAX_PDF_FILE_BYTES,
    maxCount: 1,
  }).then((b) => b[0]!);
}

export async function readSingleDocx(file: File): Promise<Buffer> {
  const n = file.name.toLowerCase();
  const ok =
    n.endsWith(".docx") ||
    (file.type?.includes("wordprocessingml") ?? false) ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (!ok) throw new Error("Only .docx Word files are allowed.");

  const buf = await fileToBuffer(file, MAX_PDF_FILE_BYTES);
  const view = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  if (!isZipMagic(view)) throw new Error("Invalid DOCX file.");
  return buf;
}

export { MAX_MERGE_FILE_COUNT, MAX_MERGE_TOTAL_BYTES, MAX_PDF_FILE_BYTES };
