"use client";

import { useEffect } from "react";

/** Loads AdSense without next/script's data-nscript attribute warning. */
export function AdSenseLoader({ client }: { client: string }) {
  useEffect(() => {
    if (!client || document.querySelector(`script[data-et-adsense="${client}"]`)) return;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    s.dataset.etAdsense = client;
    document.body.appendChild(s);
  }, [client]);
  return null;
}
