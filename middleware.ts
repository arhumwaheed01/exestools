import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CLASSROOM_EMBED_CSP } from "@/lib/classroom-embed";
import { EMBED_FRAME_CSP } from "@/lib/embed";

const GONE = new Set(["/tools/jwt-decoder"]);
const CANONICAL_HOST = "www.exestools.com";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const proto = (request.headers.get("x-forwarded-proto") ?? "https").split(",")[0].trim();

  // Apex → www (and force https). Prefer a single hop to https://www when possible.
  if (host === "exestools.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  // http://www → https://www (path preserved). Vercel usually does this first; keep as fallback.
  if (host === CANONICAL_HOST && proto === "http") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  if (GONE.has(pathname)) {
    return new NextResponse("Gone", {
      status: 410,
      headers: { "X-Robots-Tag": "noindex" },
    });
  }

  const isClassroomEmbed = pathname.startsWith("/classroom-spinner/embed/");
  const isToolEmbed = pathname.startsWith("/embed/");

  const requestHeaders = new Headers(request.headers);
  if (isClassroomEmbed || isToolEmbed) {
    requestHeaders.set("x-exestools-embed", "1");
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (isClassroomEmbed) {
    response.headers.set("Content-Security-Policy", CLASSROOM_EMBED_CSP);
    response.headers.delete("X-Frame-Options");
  }

  if (isToolEmbed) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Content-Security-Policy", EMBED_FRAME_CSP);
    response.headers.delete("X-Frame-Options");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Host canonicalization for all pages; skip Next internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.svg|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|txt|xml|json)$).*)",
  ],
};
