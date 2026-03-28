import { applyPdfEditorPayload } from "@/lib/pdf/editorApply";
import type { PdfEditorPayload } from "@/lib/pdf/editorTypes";
import { guardPdfRequest, pdfFileResponse, pdfJsonError } from "@/lib/pdf/http";
import { readSinglePdf } from "@/lib/pdf/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = guardPdfRequest(request);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const opsRaw = form.get("operations");
    if (!(file instanceof File)) return pdfJsonError("Missing PDF file.");
    if (typeof opsRaw !== "string") return pdfJsonError("Missing operations payload.");

    let payload: PdfEditorPayload;
    try {
      payload = JSON.parse(opsRaw) as PdfEditorPayload;
    } catch {
      return pdfJsonError("Invalid operations JSON.");
    }

    const buf = await readSinglePdf(file);
    const out = await applyPdfEditorPayload(buf, payload);
    const base = file.name.replace(/\.pdf$/i, "") || "document";
    return pdfFileResponse(out, "application/pdf", `${base}-edited.pdf`);
  } catch (e) {
    return pdfJsonError(e instanceof Error ? e.message : "Edit failed.", 400);
  }
}
