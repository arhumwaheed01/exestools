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
  left: number;
  width: number;
  maxHeight: number;
  /** Open below the anchor (set `top`). */
  placement: "below" | "above";
  /** Distance from viewport top — only when placement === "below". */
  top?: number;
  /** Distance from viewport bottom — only when placement === "above" (keeps menu next to the button). */
  bottom?: number;
};

/**
 * Clamp a fixed menu into the viewport.
 * When flipping up, use `bottom` so the menu stays attached to the button
 * (never jump to y=8 with a large empty max-height box).
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
  const mobile = vw < 1024;
  const bottomClearance = mobile ? 96 : margin;
  const bottomLimit = vh - bottomClearance;
  const maxCap = Math.max(140, vh - 120);

  const width = Math.min(desiredWidth, Math.max(0, vw - margin * 2));
  let left = opts?.preferRightAlign ? anchor.right - width : anchor.left;
  left = Math.min(Math.max(margin, left), vw - width - margin);

  const spaceBelow = bottomLimit - (anchor.bottom + gap);
  const spaceAbove = anchor.top - gap - margin;

  const openBelow = spaceBelow >= 280 && spaceBelow >= spaceAbove;

  if (openBelow) {
    return {
      placement: "below",
      top: anchor.bottom + gap,
      left,
      width,
      maxHeight: Math.min(maxCap, Math.max(120, spaceBelow)),
    };
  }

  // Anchor the menu's bottom edge just above the button.
  return {
    placement: "above",
    bottom: Math.max(margin, vh - anchor.top + gap),
    left,
    width,
    maxHeight: Math.min(maxCap, Math.max(120, spaceAbove)),
  };
}

/** Parse CSV / pasted lists with quoted fields (e.g. a,b,"d, e"). */
export function parseCsvEntries(raw: string): string[] {
  const text = raw.replace(/^\uFEFF/, "").trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const out: string[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    let i = 0;
    let field = "";
    let inQuotes = false;
    while (i < line.length) {
      const ch = line[i]!;
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i += 1;
          continue;
        }
        field += ch;
        i += 1;
        continue;
      }
      if (ch === '"') {
        inQuotes = true;
        i += 1;
        continue;
      }
      if (ch === ",") {
        const t = field.trim();
        if (t) out.push(t);
        field = "";
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
    }
    const t = field.trim();
    if (t) out.push(t);
  }

  return out;
}
