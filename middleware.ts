import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Legacy ?c= share links: noindex via response header only when `c` is present.
 * Clean URLs never receive this header — avoids baking noindex into static HTML.
 */
export function middleware(request: NextRequest) {
  const hasLegacyShare = request.nextUrl.searchParams.has("c");
  if (!hasLegacyShare) {
    return NextResponse.next();
  }
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, follow");
  return response;
}

export const config = {
  matcher: ["/", "/random-name-picker", "/classroom-spinner", "/prize-wheel", "/yes-no-wheel"],
};
