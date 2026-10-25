"use client";

import { useEffect, useState } from "react";

/** Portal host that stays visible during Fullscreen API (menus must not use body alone). */
export function useFullscreenPortalRoot(): HTMLElement | null {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const sync = () => {
      setRoot((document.fullscreenElement as HTMLElement | null) ?? document.body);
    };
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  return root;
}

/** Clamp a fixed menu into the viewport with an 8px margin. */
export function clampMenuBox(
  preferredLeft: number,
  preferredTop: number,
  desiredWidth: number,
): { top: number; left: number; width: number } {
  const margin = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(desiredWidth, Math.max(0, vw - margin * 2));
  let left = Math.min(preferredLeft, vw - width - margin);
  left = Math.max(margin, left);
  let top = preferredTop;
  // Keep at least a sliver on-screen if the anchor is near the bottom.
  top = Math.min(top, vh - margin - 48);
  top = Math.max(margin, top);
  return { top, left, width };
}
