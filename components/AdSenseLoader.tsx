"use client";

import { useEffect } from "react";

/** Loads AdSense without next/script's data-nscript attribute warning. */
export function AdSenseLoader({ client }: { client: string }) {
  useEffect(() => {
    if (!client) return;
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = src;
    document.body.appendChild(s);
  }, [client]);
  return null;
}
