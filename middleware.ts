import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CLASSROOM_EMBED_CSP } from "@/lib/classroom-embed";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isClassroomEmbed = pathname.startsWith("/classroom-spinner/embed/");

  const requestHeaders = new Headers(request.headers);
  if (isClassroomEmbed) {
    requestHeaders.set("x-exestools-embed", "1");
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (isClassroomEmbed) {
    // Allow Google Sites iframes. Do not send X-Frame-Options on this route.
    response.headers.set("Content-Security-Policy", CLASSROOM_EMBED_CSP);
    response.headers.delete("X-Frame-Options");
  }

  return response;
}

export const config = {
  matcher: ["/classroom-spinner/embed/:path*"],
};
