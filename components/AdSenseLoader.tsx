"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Paths that must not load adsbygoogle.js (thin / non-content pages). */
const NO_ADS_PATHS = new Set([
  "/contact",
  "/privacy-policy",
  "/terms",
  "/dmca",
  "/wheel-gallery",
]);

function shouldLoadAds(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname === "/404" || pathname === "/_not-found") return false;
  if (NO_ADS_PATHS.has(pathname)) return false;
  // App Router not-found often keeps the requested path; still skip known thin routes above.
  return true;
}

/** Loads AdSense without next/script's data-nscript attribute warning. */
export function AdSenseLoader({ client }: { client: string }) {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (!client) return;
    if (document.documentElement.dataset.exestoolsNoAds === "1") return;
    if (!shouldLoadAds(pathname)) return;
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = src;
    document.body.appendChild(s);
  }, [client, pathname]);

  return null;
}
