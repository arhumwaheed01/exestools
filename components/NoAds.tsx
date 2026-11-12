"use client";

import { useEffect } from "react";

/** Marks the document so AdSenseLoader skips, and removes any injected ads script. */
export function NoAds() {
  useEffect(() => {
    document.documentElement.dataset.exestoolsNoAds = "1";
    document
      .querySelectorAll('script[src*="pagead2.googlesyndication.com"]')
      .forEach((el) => el.remove());
  }, []);
  return null;
}
