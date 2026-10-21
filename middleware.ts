import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CLASSROOM_EMBED_CSP } from "@/lib/classroom-embed";
import { EMBED_FRAME_CSP } from "@/lib/embed";

const GONE = new Set(["/tools/jwt-decoder"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/classroom-spinner/embed/:path*", "/embed/:path*", "/tools/:path*"],
};
