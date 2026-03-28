import { NextResponse } from "next/server";
import { checkPdfRateLimit, clientKeyFromRequest } from "./rateLimit";

export function pdfJsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function guardPdfRequest(request: Request): Response | null {
  if (!checkPdfRateLimit(clientKeyFromRequest(request))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }
  return null;
}

export function pdfFileResponse(body: Uint8Array, contentType: string, downloadName: string) {
  const safe = downloadName.replace(/[^\w.\-()+ ]/g, "_").slice(0, 180);
  return new NextResponse(Buffer.from(body), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safe}"`,
      "Cache-Control": "no-store",
    },
  });
}
