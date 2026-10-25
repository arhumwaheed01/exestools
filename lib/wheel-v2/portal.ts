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

export type ClampedMenuBox = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

/**
 * Clamp a fixed menu into the viewport.
 * Flips above the anchor when there isn't enough room below (sticky SPIN clearance on mobile).
 */
export function clampMenuBox(
  anchor: { left: number; right: number; top: number; bottom: number },
  desiredWidth: number,
  opts?: { preferRightAlign?: boolean },
): ClampedMenuBox {
  const margin = 8;
  const gap = 4;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Sticky SPIN bar (~64px) + safe breathing room on small screens.
  const bottomClearance = vw < 1024 ? 88 : margin;
  const bottomLimit = vh - bottomClearance;
  const maxCap = Math.max(120, vh - 120);

  const width = Math.min(desiredWidth, Math.max(0, vw - margin * 2));
  let left = opts?.preferRightAlign ? anchor.right - width : anchor.left;
  left = Math.min(Math.max(margin, left), vw - width - margin);

  const spaceBelow = bottomLimit - (anchor.bottom + gap);
  const spaceAbove = anchor.top - gap - margin;

  const openBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;

  if (openBelow) {
    const maxHeight = Math.min(maxCap, Math.max(96, spaceBelow));
    return {
      top: anchor.bottom + gap,
      left,
      width,
      maxHeight,
    };
  }

  const maxHeight = Math.min(maxCap, Math.max(96, spaceAbove));
  return {
    top: Math.max(margin, anchor.top - gap - maxHeight),
    left,
    width,
    maxHeight,
  };
}
