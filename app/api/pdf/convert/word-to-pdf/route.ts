import { docxBufferToPdf } from "@/lib/pdf/operations";
import { guardPdfRequest, pdfFileResponse, pdfJsonError } from "@/lib/pdf/http";
import { readSingleDocx } from "@/lib/pdf/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = guardPdfRequest(request);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return pdfJsonError("Missing Word file.");

    const buf = await readSingleDocx(file);
    const out = await docxBufferToPdf(buf);
    const base = file.name.replace(/\.docx$/i, "") || "document";
    return pdfFileResponse(out, "application/pdf", `${base}.pdf`);
  } catch (e) {
    return pdfJsonError(e instanceof Error ? e.message : "Conversion failed.", 400);
  }
}
