import { pdfBufferToDocx } from "@/lib/pdf/operations";
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

    const buf = await readSinglePdf(file);
    const out = await pdfBufferToDocx(buf);
    const base = file.name.replace(/\.pdf$/i, "") || "document";
    return pdfFileResponse(
      out,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      `${base}.docx`,
    );
  } catch (e) {
    return pdfJsonError(e instanceof Error ? e.message : "Conversion failed.", 400);
  }
}
