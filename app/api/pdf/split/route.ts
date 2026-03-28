import { splitPdfEachPageZip, splitPdfRange } from "@/lib/pdf/operations";
import { guardPdfRequest, pdfFileResponse, pdfJsonError } from "@/lib/pdf/http";
import { readSinglePdf } from "@/lib/pdf/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = guardPdfRequest(request);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return pdfJsonError("Missing PDF file.");

    const mode = String(form.get("mode") ?? "each");
    const buf = await readSinglePdf(file);

    if (mode === "range") {
      const from = Number.parseInt(String(form.get("from") ?? "1"), 10);
      const to = Number.parseInt(String(form.get("to") ?? "1"), 10);
      if (!Number.isFinite(from) || !Number.isFinite(to)) {
        return pdfJsonError("Invalid page numbers.");
      }
      const out = await splitPdfRange(buf, from, to);
      return pdfFileResponse(out, "application/pdf", "extracted-pages.pdf");
    }

    if (mode !== "each") return pdfJsonError("Invalid mode.");

    const zip = await splitPdfEachPageZip(buf);
    return pdfFileResponse(zip, "application/zip", "split-pages.zip");
  } catch (e) {
    return pdfJsonError(e instanceof Error ? e.message : "Split failed.", 400);
  }
}
