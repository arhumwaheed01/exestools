import { mergePdfBuffers } from "@/lib/pdf/operations";
import { guardPdfRequest, pdfFileResponse, pdfJsonError } from "@/lib/pdf/http";
import {
  collectPdfFiles,
  MAX_MERGE_FILE_COUNT,
  MAX_MERGE_TOTAL_BYTES,
  MAX_PDF_FILE_BYTES,
} from "@/lib/pdf/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = guardPdfRequest(request);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const list = form.getAll("file").filter((x): x is File => x instanceof File);
    if (list.length < 2) return pdfJsonError("Select at least two PDF files to merge.");
    const buffers = await collectPdfFiles(list, {
      maxEach: MAX_PDF_FILE_BYTES,
      maxTotal: MAX_MERGE_TOTAL_BYTES,
      maxCount: MAX_MERGE_FILE_COUNT,
    });
    const out = await mergePdfBuffers(buffers);
    return pdfFileResponse(out, "application/pdf", "merged.pdf");
  } catch (e) {
    return pdfJsonError(e instanceof Error ? e.message : "Merge failed.", 400);
  }
}
